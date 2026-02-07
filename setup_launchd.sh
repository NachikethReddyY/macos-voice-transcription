#!/bin/bash

# Setup Wispr Flow to run at login using LaunchAgents

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LABEL="com.user.wisprflow"
PLIST_PATH="$HOME/Library/LaunchAgents/$LABEL.plist"

echo "🚀 Setting up startup item for: $APP_DIR"

# Create LaunchAgent plist
cat <<EOF > "$PLIST_PATH"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$LABEL</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$APP_DIR/install_and_run.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/wisprwrap.out</string>
    <key>StandardErrorPath</key>
    <string>/tmp/wisprwrap.err</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
</dict>
</plist>
EOF

echo "📄 Plist created at $PLIST_PATH"

# Load the agent
launchctl unload "$PLIST_PATH" 2>/dev/null
launchctl load "$PLIST_PATH"

echo "✅ LaunchAgent loaded. Wispr Flow will now start automatically at login."
