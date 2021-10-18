const { ipcRenderer } = require('electron');

document.getElementById('new-cargo').addEventListener('click', () =>{
    ipcRenderer.send('load-file', 'sahneler/new_cargo.html');

});

document.getElementById('cargo-state').addEventListener('click', () =>{

    ipcRenderer.send('load-file', 'sahneler/cargo_state.html');
});