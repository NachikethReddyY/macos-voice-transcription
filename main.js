const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let tray;
let pythonProcess;
let isRecording = false;

// Hide the dock icon (macOS)
if (process.platform === 'darwin') {
    app.dock.hide();
}

function createTray() {
    const iconPath = path.join(__dirname, 'assets', 'tray_icon.png'); // Ensure you have an icon here or use a default
    // If icon doesn't exist, it might throw or show empty. 
    // For now we assume we'll generate one.

    tray = new Tray(iconPath);
    tray.setToolTip('Wispr Flow Clone');

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Quit', click: () => {
                app.quit();
            }
        }
    ]);

    tray.setContextMenu(contextMenu);
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 200,
        height: 200,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        hasShadow: false,
        focusable: false, // Prevent stealing focus
        type: 'panel', // macOS utility window behavior
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Calculate position: Bottom center with some gap
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    const windowWidth = 200;
    const windowHeight = 200;
    const x = Math.round((width - windowWidth) / 2);
    const y = Math.round(height - windowHeight - (height * 0.1)); // 10% from bottom

    mainWindow.setPosition(x, y);
    mainWindow.loadFile('index.html');

    // High priority always on top and visible across workspaces (fullscreen apps)
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    // Initially hide
    mainWindow.hide();
}

function startPythonBackend() {
    const pythonCmd = 'python3';

    let pythonPath = 'python3';
    const venvPython = path.join(__dirname, 'venv', 'bin', 'python');
    const fs = require('fs');
    if (fs.existsSync(venvPython)) {
        pythonPath = venvPython;
    }

    pythonProcess = spawn(pythonPath, ['-u', path.join(__dirname, 'backend', 'transcribe.py')]);

    pythonProcess.stdout.on('data', (data) => {
        const message = data.toString().trim();
        console.log(`Python: ${message}`);

        if (message.startsWith('TRANSCRIPTION_COMPLETE')) {
            // Transcription and typing handled by Python now.
            // We just need to reset UI state.
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('status', 'idle');
                mainWindow.hide();
            }
            isRecording = false;
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        const message = data.toString().trim();
        // Filters specific weird resource tracker warnings if needed, or just logs them
        if (message.includes('resource_tracker')) return;
        console.log(`Python Status: ${message}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });
}

app.whenReady().then(() => {
    createTray();
    createWindow();
    startPythonBackend();

    // Register Global Shortcut
    const ret = globalShortcut.register('Command+Shift+Space', () => {
        toggleRecording();
    });

    if (!ret) {
        console.log('registration failed');
    }
});

function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    isRecording = true;
    if (mainWindow) {
        mainWindow.showInactive(); // Show without taking focus
        mainWindow.webContents.send('status', 'listening');
    }
    if (pythonProcess) {
        pythonProcess.stdin.write('START_RECORDING\n');
    }
}

function stopRecording() {
    if (mainWindow) {
        mainWindow.webContents.send('status', 'processing');
    }
    if (pythonProcess) {
        pythonProcess.stdin.write('STOP_RECORDING\n');
    }
}

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    if (pythonProcess) {
        pythonProcess.kill();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
