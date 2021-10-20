const { ipcRenderer, dialog } = require('electron');

var table = document.getElementById('table');

ipcRenderer.send('table-list', '');

ipcRenderer.on('convert-html', (event, data) => {
    table.innerHTML = data;

    for (var i = 1; i < table.rows.length; i++) {

        table.rows[i].cells[3].onclick = function () {

            var c = confirm("Do you want delete this adress? Reallyyyyyy");

            if (c) {
                let index = this.parentElement.rowIndex;
                let adress = this.parentElement.cells[1].innerHTML;
                ipcRenderer.send('show-dialog', "Deleting.." + index + adress)
                ipcRenderer.send('delete-cargo', adress);
                table.deleteRow(index);
            }
        };

        table.rows[i].cells[5].onclick = function () {

            var c = confirm("Do you want update this Cargo status? Reallyyyyyy");

            if (c) {
                let index = this.parentElement.rowIndex;
                let adress = this.parentElement.cells[1].innerHTML;

                ipcRenderer.send('show-dialog', "Updating" + index + adress)
                this.parentElement.cells[2].innerHTML = 'Completed';
                ipcRenderer.send('update-cargo', adress);
            }
        };

        table.rows[i].cells[4].onclick = function () {
            ipcRenderer.send('load-file', 'sahneler/new_cargo.html');

        };
    }
});

document.getElementById('btn-back').addEventListener('click', () => {
    ipcRenderer.send('load-file', 'sahneler/transition.html');
});

document.getElementById('btn-search').addEventListener('click', () => {
    let value = document.getElementById('search-input').value;
    ipcRenderer.send('table-list', value);
});

