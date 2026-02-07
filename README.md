# Wispr Flow Clone

A local, privacy-focused voice dictation tool acting as a clone of "Wispr Flow". It records audio upon a global hotkey, transcribes it locally using OpenAI's Whisper model, and **pastes** the text into your active application instantly.

## 🚀 Features

-   **Privacy-First**: All audio processing happens locally on your machine.
-   **Instant Typing**: Uses clipboard injection (`Cmd+V`) for fast text insertion.
-   **Background App**: Runs invisibly in the background with no Dock icon.
-   **Tray Control**: Managed via a menu bar icon.
-   **Overlay UI**: Minimalist pulsing indicator that floats over all apps (including fullscreen).

## 🛠 Prerequisites

-   **macOS** (Required for Accessibility/AppleScript integration).
-   **Node.js** installed.
-   **Python 3** installed.
-   **FFmpeg**: Required for audio processing (`brew install ffmpeg`).

## ⚡️ Quick Start

1.  **Installation**:
    ```bash
    ./install_and_run.sh
    ```
    *   *Note*: The first run downloads the Whisper AI model (~150MB).
    *   **Permissions**: You MUST grant **Accessibility** permissions to Terminal/Electron when prompted. This is required for the app to type/paste text.
    *   **Microphone**: Grant microphone access when prompted.

2.  **Usage**:
    -   **Trigger**: Press `Command + Shift + Space`.
    -   **Dictate**: Speak clearly when you see the black pulsing circle.
    -   **Finish**: Press `Command + Shift + Space` again.
    -   **Result**: The text is automatically pasted into your active cursor position.

### 🖥 Global Command (CLI)

You can launch the app from any terminal by typing `wisper`.

1.  **Setup**:
    ```bash
    sudo ln -s /Users/ynr/code/wisper/wisper_wrapper.sh /usr/local/bin/wisper
    ```
2.  **Usage**: Simply type `wisper` in any directory to start the app.

## ⚙️ Auto-Start at Login

To have the app start automatically when you log in:

1.  Run the setup script:
    ```bash
    ./setup_launchd.sh
    ```
2.  The app will now launch silently in the background on your next login.

## 🛑 Stopping the App

-   **Quit**: Click the microphone icon in the menu bar (Tray) and select **Quit**.
-   **Manual Stop**: If running via terminal, press `Ctrl + C`.

## 🏗 Architecture

-   **Frontend (Electron)**: Handles the UI overlay, global shortcuts, and system tray. Communicates with Python via `stdio`.
-   **Backend (Python)**:
    -   Records audio using `sounddevice`.
    -   Transcribes using `openai-whisper` (Base model).
    -   Pastes text using `pyperclip` (clipboard) and `pyautogui` (keyboard simulation).

## 🔧 Troubleshooting

-   **"Python Status" Logs**: You might see logs in the terminal labeled "Python Status". These are normal progress indicators, not errors.
-   **Not Typing**: Ensure you have granted **Accessibility** permissions to the app (System Settings -> Privacy & Security -> Accessibility).
-   **Git Push Failures**: Since `venv` and `node_modules` are large, they are excluded from Git. If you added them previously, run `git rm -r --cached venv node_modules` before pushing.
