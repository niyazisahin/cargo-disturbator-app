const { ipcRenderer } = require('electron');




document.getElementById("btnSignUp").addEventListener('click', () => {
    let userName = document.getElementById('floatingInput').value;
    let mail = document.getElementById('floatingMail').value;
    let password = document.getElementById('floatingPassword').value;

    ipcRenderer.send('new-user', { UserName: userName, EMail: mail, Password: password });
})


document.getElementById("btnReturnSignIn").addEventListener('click', () => {
    ipcRenderer.send('load-file', './index.html');
})
