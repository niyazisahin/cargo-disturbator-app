var map = L.map('mapid').setView([51.505, -0.09], 13);
const { ipcRenderer } = require('electron');
const { getDistance } = require('./distance-api/api');

const apiKey = 'pk.eyJ1Ijoibml5YXppc2FoaW4iLCJhIjoiY2t1dnEzNGUyMXhuejJ1cXY4Y2hiNDN4ZCJ9.RZo41tIbfal8CGgX6NVpaw';

const provider = new window.GeoSearch.OpenStreetMapProvider();

const searchControl = new window.GeoSearch.GeoSearchControl({
    provider: provider,
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

var map_route = L.Routing.control({
    router: L.Routing.mapbox(apiKey),
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: false,
    showAlternatives: false,

});

map_route.addTo(map);

map.addControl(searchControl);

function onMapClick(e) {
    ipcRenderer.send('get-all');
    geocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom()), function (results) {
        var r = results[0];

        if (r) {
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

ipcRenderer.on('send-loc', (event, data) => {


    
    map.eachLayer((layer) => {

        if (layer['_latlng'] != undefined)
            layer.remove();

    });

    map.setView([data[0].lat, data[0].lng], 13);

    data.forEach(item => {

        let marker = L.marker(item)
            .addTo(map)
            .openPopup();

    });
    // node sayısı
    var len = data.length;
    var nodes = [];

    for (var i = 0; i < len; i++) {

        var graf = new Graph(data[i]);
        nodes.push(graf);

    }

    for (var i = 0; i < len; i++) {
        for (var j = i; j < len; j++) {

            // node'un kendine bağlanmasını engellemek için
            if (i == j) {
                continue;
            }

            // Kullanıcı kodu buraya
            let dist = getDistance(nodes[i].cord, nodes[j].cord);

            console.log(i + ":" + j);
            nodes[i].addConnection(nodes[j], dist);
            nodes[j].addConnection(nodes[i], dist);

        }
    }
    ipcRenderer.send('print-graph', nodes);

    var edges = [];


    for (var item of nodes) {

        for (var item2 of item.AdjList.keys()) {

            var flag = true;

            for (var item3 of edges) {

                if (item3.isEqual(item, item2)) {
                    flag = false;
                }
            }
            if (flag) {

                edges.push(new Edge(item, item2, item.AdjList.get(item2)));
            }
        }
    }

    ipcRenderer.send('print-edges', edges);

    edges.sort((a, b) => {
        if (a.distance < b.distance) return -1
        return a.distance > b.distance ? 1 : 0
    })

    ipcRenderer.send('welcome', '\n---- Siralanmis edge ler ---- ');
    ipcRenderer.send('print-edges', edges);

    var nodes_status = new Map();

    data.forEach((item) => {


        nodes_status.set(item, false);

    })

    let start_node = data[0]; // kuryenin adresi
    let node_count = data.length;
    let visit_edges = []; // mst uygulanmış edgeler
    let current_nodes = []; // bakılması gereken nodelar

    current_nodes.push(start_node);

    while (true) {
        let edges_to_add = []; // ekleme imkanımız olan tüm edgeler

        edges.forEach((item, index) => {
            for (const n of current_nodes) {
                if ((item.n1.cord == n) || (item.n2.cord == n)) {
                    edges_to_add.push(item);
                }
            }
        });

        edges_to_add.sort((a, b) => {
            if (a.distance < b.distance) return -1
            return a.distance > b.distance ? 1 : 0
        });

        let edge_to_add = edges_to_add[0];

        let bool1 = current_nodes.includes(edge_to_add.n1.cord);
        let bool2 = current_nodes.includes(edge_to_add.n2.cord);

        if (bool1 && !bool2) {
            current_nodes.push(edge_to_add.n2.cord);
        }

        if (!bool1 && bool2) {
            current_nodes.push(edge_to_add.n1.cord);
        }

        visit_edges.push(edge_to_add);

        let index = edges.indexOf(edge_to_add);

        if (index !== -1) {
            edges.splice(index, 1);
        }

        if (current_nodes.length == node_count) {
            break;
        }

    }


    ipcRenderer.send('welcome', '\n ---- Ziyaret edilen edge ler ----');
    ipcRenderer.send('print-edges', visit_edges);

    var order = [];

    order.push(data[0]);

    var stack = [];
    stack.push(data[0]);

    data.forEach((item) => {

        nodes_status.set(item, false);

    })

    nodes_status.set(stack[0], true);

    while (all(Array.from(nodes_status.values())) == false) {

        var flag = false;

        visit_edges.forEach((item) => {
            let current_node = stack[stack.length - 1];

            let n1 = item.n1.cord;
            let n2 = item.n2.cord;


            if ((n1 == current_node) && (nodes_status.get(n2) == false)) {

                nodes_status.set(n2, true);
                stack.push(n2);
                order.push(n2);

                flag = true;

            }
            if ((n2 == current_node) && (nodes_status.get(n1) == false)) {

                nodes_status.set(n1, true);
                stack.push(n1);
                order.push(n1);

                flag = true;

            }

        })
        if ((flag == false) && (all(Array.from(nodes_status.values())) == false)) {

            var flag2 = true;

            while (flag2) {

                let tmp = stack.pop();

                visit_edges.forEach((item) => {

                    let n1 = item.n1.cord;
                    let n2 = item.n2.cord;

                    if ((n1 == tmp) && (nodes_status.get(n2) == false)) {

                        stack.push(tmp);
                        flag2 = false;
                    }
                    if ((n2 == tmp) && (nodes_status.get(n1) == false)) {

                        stack.push(tmp);
                        flag2 = false;
                    }

                })

            }


        }

    }

    ipcRenderer.send('welcome', 'Bu son sonuc heee');
    ipcRenderer.send('welcome', order);

    var route_nodes = [];

    order.forEach((item) => {
        route_nodes.push(L.latLng(item.lat, item.lng));
    })

    ipcRenderer.send('welcome', route_nodes);

    
    map_route.setWaypoints(route_nodes);


})

function all(iterable) {
    for (var index = 0; index < iterable.length; index++) {
        if (!iterable[index]) return false;
    }
    return true;
}


class Graph {

    constructor(cord) {
        this.AdjList = new Map();
        this.cord = cord;
    }

    addConnection(node, cost) {
        this.AdjList.set(node, cost);
    }
}


class Edge {

    constructor(n1, n2, distance) {

        this.n1 = n1;
        this.n2 = n2;
        this.distance = distance;
    }

    isEqual(n1, n2) {

        return (this.n1 === n1 && this.n2 === n2) || (this.n1 === n2 && this.n2 === n1);
    }
}


