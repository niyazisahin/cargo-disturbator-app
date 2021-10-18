var map = L.map('mapid').setView([51.505, -0.09], 13);
const { ipcRenderer } = require('electron');

const apiKey = 'pk.eyJ1Ijoibml5YXppc2FoaW4iLCJhIjoiY2t1dnEzNGUyMXhuejJ1cXY4Y2hiNDN4ZCJ9.RZo41tIbfal8CGgX6NVpaw';

const provider = new window.GeoSearch.OpenStreetMapProvider();

const searchControl = new window.GeoSearch.GeoSearchControl({
    popupFormat: ({ query, result }) => { document.getElementById('adress-input').value = result.label },
    provider: provider,
    //updateMap:false,
    keepResult: true,
    retainZoomLevel: true,
});

var marker;
var geocoder = L.Control.Geocoder.mapbox({ apiKey: apiKey });

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoibml5YXppc2FoaW4iLCJhIjoiY2t1dnEzNGUyMXhuejJ1cXY4Y2hiNDN4ZCJ9.RZo41tIbfal8CGgX6NVpaw', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: apiKey
}).addTo(map);

map.addControl(searchControl);

function onMapClick(e) {
    geocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom()), function (results) {
        var r = results[0];
        if (r) {
            document.getElementById('adress-input').value = r.name;
            if (marker) {
                marker
                    .setLatLng(r.center)
                    .setPopupContent(r.html || r.name)
                    .openPopup();
            } else {
                marker = L.marker(r.center)
                    .bindPopup(r.name)
                    .addTo(map)
                    .openPopup();
            }
        }
    });
}

map.on('click', onMapClick);

document.getElementById('btn-add').addEventListener('click', () => {
    let value = document.getElementById('adress-input').value;
    if (value) {

        geocoder.geocode(value, (result) => {
            let data = { name: value };
            ipcRenderer.send('welcome', result[0].center);
            data.cord = result[0].center;
            ipcRenderer.send('new-cord', data);
        })

    }

})


