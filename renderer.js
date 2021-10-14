const { ipcRenderer } = require('electron');

document.getElementById("btnLogin").addEventListener('click', () => {

    let userName = document.getElementById('floatingInput').value;
    let password = document.getElementById('floatingPassword').value;

    ipcRenderer.send('login-valid', { UserName: userName, Password: password });

})

document.getElementById("btnSignUp").addEventListener('click', () => {
    ipcRenderer.send('load-file', 'sahneler/signup.html');
})



