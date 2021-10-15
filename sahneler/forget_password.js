const { ipcRenderer } = require('electron');

document.getElementById("btnSubmit").addEventListener('click', () => {

    let UserName = document.getElementById('floatingInput').value;
    let Mail = document.getElementById('floatingMail').value;
    let Password = document.getElementById('floatingPassword').value;

    ipcRenderer.send('password-change', { UserName: UserName, EMail: Mail, Password: Password });

});

let error = document.getElementById('errorMessage');
let success = document.getElementById('successMessage');

ipcRenderer.on('show-error-message', (event) => {

    error.style.display = 'block';
    ipcRenderer.send('welcome', 'merhaba abi');
    success.style.display = 'none';

});

ipcRenderer.on('show-success-message', (event) => {

    success.style.display = 'block';
    error.style.display = 'none';
    
});

document.getElementById("homePage").addEventListener('click', () => {
    ipcRenderer.send('load-file', './index.html');
})



