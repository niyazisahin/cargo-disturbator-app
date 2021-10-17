// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');

const path = require('path')

const { MongoClient } = require('mongodb');
const { monitorEventLoopDelay } = require('perf_hooks');
const { Console } = require('console');
const { isProxy } = require('util/types');
const uri = "mongodb+srv://Charon:Ns190202069@navigation.xptsq.mongodb.net/CargoAppDb?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

var user;

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()


  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


ipcMain.on('welcome', function (event, sentence) {
  console.log(sentence);
});

ipcMain.on('login-valid', (event, data) => {
  client.connect(async err => {
    const collection = client.db("CargoAppDb").collection("Users");

    const res = await collection.findOne(data);

    client.close();

    if (!!res) {

      user = data;

      console.log('DEBUG: yeni kullanici geldi : ' + data.UserName);

      BrowserWindow.getFocusedWindow().loadFile('sahneler/transition.html');
      console.log('DEBUG: sahneler/transition.html sayfasina gidiyoz.');

    }

  });

});

ipcMain.on('load-file', (event, data) => {

  BrowserWindow.getFocusedWindow().loadFile(data);
  console.log('DEBUG: ' + data + ' sayfasina gidiyoz.');
});

ipcMain.on('new-user', (event, data) => {
  client.connect(async err => {
    const collection = client.db("CargoAppDb").collection("Users");

    const res = await collection.insertOne(data);

    console.log('DEBUG: Yeni kullanici olusturuldu :' + res.UserName);
    client.close();

  });

});

ipcMain.on('password-change', (event, data) => {
  client.connect(async err => {
    const collection = client.db("CargoAppDb").collection("Users");

    const query = { UserName: data.UserName, EMail: data.EMail }
    const res = await collection.updateOne(query, { $set: { Password: data.Password } });
    if (res.matchedCount > 0) {
      event.reply('show-success-message');
    } else {
      event.reply('show-error-message');
    }
    client.close();

  });

});




