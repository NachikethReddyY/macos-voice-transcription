#!/bin/bash

# Wispr Flow Clone - Install and Run Script

echo "🚀 Starting Wispr Flow Setup..."

# 1. Check for FFmpeg (Required for Whisper/Sounddevice audio handling sometimes, definitely for Whisper)
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed."
    echo "Please install it using Homebrew: brew install ffmpeg"
    exit 1
fi
echo "✅ FFmpeg found."

# 2. Python Setup
PYTHON_CMD="python3"
if ! command -v $PYTHON_CMD &> /dev/null; then
    echo "❌ python3 not found."
    exit 1
fi

VENV_DIR="venv"
if [ ! -d "$VENV_DIR" ]; then
    echo "📦 Creating Python virtual environment..."
    $PYTHON_CMD -m venv $VENV_DIR
fi

# Activate venv
source $VENV_DIR/bin/activate

# Install Python Dependencies
echo "⬇️ Installing Python dependencies..."
pip install -r backend/requirements.txt

# 3. Node Dependencies
echo "⬇️ Installing Node dependencies..."
# Remove robotjs from node_modules if it exists to avoid confusion/errors
rm -rf node_modules/robotjs

if [ ! -d "node_modules" ]; then
    npm install
else 
    echo "Node modules already installed."
    # Prune extraneous packages
    npm prune
fi

# 4. (Removed) Rebuild robotjs - No longer needed

# 5. Run Application
echo "▶️ Starting Wispr Flow..."
npm start
