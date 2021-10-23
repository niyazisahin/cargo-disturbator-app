// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog, ipcRenderer } = require('electron');

var mainWindow;
const path = require('path')

const { MongoClient } = require('mongodb');
const { monitorEventLoopDelay } = require('perf_hooks');
const { Console, table } = require('console');
const { isProxy } = require('util/types');

const uri = "mongodb+srv://Charon:Ns190202069@navigation.xptsq.mongodb.net/CargoAppDb?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

var user;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
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

ipcMain.on('load-file', (event, data) => {

  BrowserWindow.getFocusedWindow().loadFile(data);
  console.log('DEBUG: ' + data + ' sayfasina gidiyoz.');
});

ipcMain.on('show-dialog', (event, data) => {
  const window = BrowserWindow.getFocusedWindow();
  dialog.showMessageBox(window, {
    title: 'Verify',
    buttons: ['Continue'],
    type: 'info',
    message: data,
  });
})

ipcMain.on('get-all', (event, data)=>{
  client.connect(async err => {
    console.log('database e girdim');

    const collection = client.db("CargoAppDb").collection("Cargos");
    const collection2 = client.db("CargoAppDb").collection("Users");

    let cords = []; 
    const res = await collection.find().toArray();
    const res2 = await collection2.find().toArray(); //1 tane

    cords.push(res2[0].Coordinate); //User location önce eklemek için.

    res.forEach((item)=>{
      cords.push(item.Coordinate);
    })
    
    cords.push(res2[0].Coordinate);

    mainWindow.webContents.send('send-loc', cords)

    //event.reply('send-loc', cords);
  
    console.log(cords);
    client.close();
  });
})

const io = require("socket.io-client");

const socket = io('ws://localhost:8080');

socket.on('message', text => {

  console.log(text );
  ipcMain.emit('get-all');

});
