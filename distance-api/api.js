const exec = require("child_process").execSync;


function getDistance(cord1, cord2) {

    let searchString = cord1.lng + ',' + cord1.lat + ';' + cord2.lng + ',' + cord2.lat;

    let result = exec('curl "http://router.project-osrm.org/route/v1/driving/' + searchString + '?overview=false"', {stdio:['pipe', 'pipe', 'ignore']});
    
    let lastResult = JSON.parse(result.toString("utf8")).routes[0].distance;

    lastResult /= 1000;

    console.log(lastResult);

    return Math.round(lastResult* 100) / 100;

}

module.exports = { getDistance: getDistance };