const { ipcRenderer } = require('electron');

const circle = document.getElementById('circle');

ipcRenderer.on('status', (event, status) => {
    circle.className = ''; // clear classes
    circle.classList.add(status);
});
