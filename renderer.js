const { ipcRenderer } = require('electron');

document.getElementById("btnLogin").addEventListener('click', () => {

    let UserName = document.getElementById('floatingInput').value;
    let Password = document.getElementById('floatingPassword').value;

    ipcRenderer.send('login-valid', { UserName: UserName, Password: Password });

})

document.getElementById("btnSignUp").addEventListener('click', () => {
    ipcRenderer.send('load-file', 'sahneler/signup.html');
})

document.getElementById("btnforgetPassword").addEventListener('click', () => {
    ipcRenderer.send('load-file', 'sahneler/forget_password.html');
})


