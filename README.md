# Wispr Flow Clone

A local, privacy-focused voice dictation tool acting as a clone of "Wispr Flow". It records audio upon a global hotkey, transcribes it locally using OpenAI's Whisper model, and types the text into your active application.

## 🚀 Quick Start

1.  **Prerequisites**:
    *   Node.js installed.
    *   Python 3 installed.
    *   FFmpeg installed (`brew install ffmpeg` on macOS).
    *   macOS (for `robotjs` accessibility permissions).

2.  **Installation & Run**:
    ```bash
    ./install_and_run.sh
    ```
    *   Note: On first run, it will download the Whisper model which may take a few moments.
    *   **Permissions**: You will likely be prompted to grant **Accessibility** and **Microphone** permissions to Terminal/Electron. You **MUST** grant Accessibility for the typing simulation to work.

## 🎮 Usage

1.  **Trigger**: Press `Command + Shift + Space`.
2.  **Record**: You will see a black pulsing circle at the bottom of the screen. Speak clearly.
3.  **Finish**: Press `Command + Shift + Space` again.
4.  **Result**: The transcription will be typed at your current cursor position.

## 🏗 Architecturenpm

### Frontend (Electron)
*   **`main.js`**:
    *   Creates a transparent, always-on-top frameless window.
    *   Registers the global shortcut `Cmd+Shift+Space`.
    *   Spawns the Python backend as a child process.
    *   Communicates with Python via `stdio` (Standard Input/Output).
    *   Uses `robotjs` to simulate keystrokes of the transcribed text.
*   **`renderer.js`**: Handles the visual state of the circle (Idle -> Listening -> Processing).

### Backend (Python)
*   **`transcribe.py`**:
    *   Loads `openai-whisper` model (Base model).
    *   Uses `sounddevice` to record audio from the default microphone.
    *   Saves audio to a temporary WAV file.
    *   Transcribes audio and prints `TRANSCRIPTION_COMPLETE: output` to stdout.

## ⚙️ Automatic Startup (macOS)

To run this automatically at login:

1.  Open **System Settings** -> **General** -> **Login Items**.
2.  Click the `+` button.
3.  Navigate to this project folder and select `install_and_run.sh`.

## 🛡 Privacy

All processing happens **locally** on your machine. No audio data is sent to the cloud.
# macos-voice-transcription
