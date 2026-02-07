import sys
import sounddevice as sd
import numpy as np
import scipy.io.wavfile as wav
import whisper
import os
import tempfile
import threading
import queue
import pyautogui
import pyperclip
import time
try:
    import AppKit
    # Hide the dock icon
    info = AppKit.NSBundle.mainBundle().infoDictionary()
    info['LSBackgroundOnly'] = '1'
    AppKit.NSApplication.sharedApplication().setActivationPolicy_(AppKit.NSApplicationActivationPolicyProhibited)
except ImportError:
    pass

# Parameters
SAMPLE_RATE = 16000 # Whisper expects 16kHz
CHANNELS = 1

# Global state
is_recording = False
audio_queue = queue.Queue()
model = None

def load_model():
    global model
    sys.stderr.write("Loading Whisper model...\n")
    model = whisper.load_model("base")
    sys.stderr.write("Model loaded.\n")

def audio_callback(indata, frames, time, status):
    if status:
        sys.stderr.write(f"Audio Error: {status}\n")
    if is_recording:
        audio_queue.put(indata.copy())

def record_audio():
    global is_recording
    
    with audio_queue.mutex:
        audio_queue.queue.clear()
        
    sys.stderr.write("Recording started...\n")
    
    with sd.InputStream(samplerate=SAMPLE_RATE, channels=CHANNELS, callback=audio_callback):
        while is_recording:
            sd.sleep(100)
            
    sys.stderr.write("Recording stopped.\n")

def process_audio():
    frames = []
    while not audio_queue.empty():
        frames.append(audio_queue.get())
    
    if not frames:
        sys.stderr.write("No audio recorded.\n")
        print("TRANSCRIPTION_COMPLETE") 
        sys.stdout.flush()
        return

    audio_data = np.concatenate(frames, axis=0)
    
    fd, path = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    
    wav.write(path, SAMPLE_RATE, audio_data)
    
    sys.stderr.write("Transcribing...\n")
    try:
        result = model.transcribe(path, fp16=False)
        text = result["text"].strip()
        
        if text:
            sys.stderr.write(f"Pasting: {text}\n")
            # Use clipboard + paste for speed
            pyperclip.copy(text + " ")
            # Short delay to ensure clipboard is updated
            time.sleep(0.1) 
            pyautogui.hotkey('command', 'v')
            
        print("TRANSCRIPTION_COMPLETE")
        sys.stdout.flush()
    except Exception as e:
        sys.stderr.write(f"Transcription error: {e}\n")
        print("TRANSCRIPTION_COMPLETE") 
        sys.stdout.flush()
    finally:
        os.remove(path)

def main():
    global is_recording
    
    load_model()
    
    sys.stderr.write("Backend ready. Waiting for commands.\n")
    
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
            
            command = line.strip()
            
            if command == "START_RECORDING":
                if not is_recording:
                    is_recording = True
                    recording_thread = threading.Thread(target=record_audio)
                    recording_thread.start()
            
            elif command == "STOP_RECORDING":
                if is_recording:
                    is_recording = False
                    sd.sleep(200) 
                    process_audio()
                
        except KeyboardInterrupt:
            break

if __name__ == "__main__":
    main()
