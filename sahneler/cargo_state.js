const { ipcRenderer } = require('electron');

var table = document.getElementById('table');

ipcRenderer.send('table-list');

ipcRenderer.on('convert-html', (event, data)=>{
    table.innerHTML = data;
});

