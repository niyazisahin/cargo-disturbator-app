// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron');

const path = require('path')
const socket = require('socket.io')

const { MongoClient } = require('mongodb');
const { monitorEventLoopDelay } = require('perf_hooks');
const { Console, table } = require('console');
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

    } else {

      event.reply('show-error-message');
      console.log('DEBUG: kullanici girisi basarisiz.')

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

ipcMain.on('new-cord', (event, data) => {
  console.log(data);
  client.connect(async err => {
    const collection = client.db("CargoAppDb").collection("Cargos");
    data.Status = 'On its Way';
    const res = await collection.insertOne(data);

    //console.log('DEBUG: Yeni Kordinat olusturuldu :' + res);
    io.emit('message', 'Kargo Eklendi');
    client.close();

  });
});

ipcMain.on('new-user-cord', (event, data) => {

  client.connect(async err => {

    const collection = client.db("CargoAppDb").collection("Users");

    const query = user;
    const res = await collection.updateOne(query, { $set: data });
    io.emit('message', 'Kullanici Eklendi');
    client.close();

  });
});

function dc_to_html(inp) {

  let new_html = "<tr><td>" + inp.CustomerName + " <td>" + inp.Adress + "</td> <td>" + inp.Status + "</td>" + `
  <td class='but btn'>Delete</td>
  <td class='but btn'>Add</td>
  <td class='but btn'>Complete</td>` + "</tr>";

  return new_html;
}

ipcMain.on('table-list', (event, data) => {

  client.connect(async err => {

    const collection = client.db("CargoAppDb").collection("Cargos");

    const res = await collection.find().toArray();
    var const_html = `<thead><tr><th>Customer Name</th><th>Cargo Name</th><th>Cargo Status</th><th>Delete</th><th>Add</th><th>Complete</th></tr></thead>`;

    for (var i = 0; i < res.length; i++) {

      if (res[i].Adress.includes(data)) {

        const_html += dc_to_html(res[i]);
      }
    }

    event.reply('convert-html', const_html);

    client.close();
  });

});

ipcMain.on('delete-cargo', (event, data) => {

  client.connect(async err => {

    const collection = client.db("CargoAppDb").collection("Cargos");

    const res = await collection.deleteOne({
      Adress: data,
    });
    io.emit('message', 'Kargo silindi');

    client.close();
  });

});

ipcMain.on('update-cargo', (event, data) => {
  client.connect(async err => {
    const collection = client.db("CargoAppDb").collection("Cargos");
    const collection2 = client.db("CargoAppDb").collection("Users");

    const cord = await collection.findOne({ Adress: data });
    console.log('**************' + cord);
    const query2 = user;
    const res2 = await collection2.updateOne(query2, { $set: { Adress: data, Coordinate: cord.Coordinate } });


    const query = { Adress: data }

    const res = await collection.updateOne(query, { $set: { Status: 'Completed' } });
    io.emit('message', 'Kargo Guncellendi');
    client.close();

  });

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


const http = require('http').createServer();

const io = require('socket.io')(http, {
  cors: { origin: "*" }
});

io.on('connection', (socket) => {
  console.log('a user connected');


});

http.listen(8080, () => console.log('listening on http://localhost:8080'));
