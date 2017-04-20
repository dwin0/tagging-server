//TODO: Create function with common behaviour

var db_access = require('../../persistence/db_access');


const osmQueryDistance = 'SELECT ST_Distance(ST_GeomFromText(\'POINT({lon1} {lat1})\',4326)::geography, ' +
    'ST_GeomFromText(\'POINT({lon2} {lat2})\', 4326)::geography);';



function getSpeedCalculationJSON(req, res) {

    var body = req.body;

    var lat1 = body.latitude1;
    var lat2 = body.latitude2;

    var lon1 = body.longitude1;
    var lon2 = body.longitude2;

    var startDate = new Date(body.startTime);
    var endDate = new Date(body.endTime);


    var queryStatement = osmQueryDistance
        .replaceAll("{lon1}", lon1)
        .replaceAll("{lat1}", lat1)
        .replaceAll("{lon2}", lon2)
        .replaceAll("{lat2}", lat2);

    db_access.singleQuery(queryStatement, res, startDate, endDate, renderVelocityJSON);
}


function renderVelocityJSON(res, endDate, startDate, resultingDistance) {

    resultingDistance = resultingDistance.st_distance;

    var resultingTime = (endDate - startDate) / 1000;
    var resultingVelocityMS = resultingDistance / resultingTime;
    var resultingVelocityKMH = (resultingDistance / 1000) / (resultingTime / 3600);


    res.writeHead(200, {"Content-Type": "application/json"});

    var json = JSON.stringify({
        title: "Calculated Distance:",
        distance: resultingDistance,
        time: resultingTime,
        velocity_ms: resultingVelocityMS,
        velocity_kmh: resultingVelocityKMH
    });

    res.end(json);
}





function getSpeedCalculationView(req, res) {

    var body = req.body;

    var lat1 = body.latitude1;
    var lat2 = body.latitude2;

    var lon1 = body.longitude1;
    var lon2 = body.longitude2;

    var startDate = new Date(body.startTime);
    var endDate = new Date(body.endTime);


    var queryStatement = osmQueryDistance
        .replaceAll("{lon1}", lon1)
        .replaceAll("{lat1}", lat1)
        .replaceAll("{lon2}", lon2)
        .replaceAll("{lat2}", lat2);

    db_access.singleQuery(queryStatement, res, startDate, endDate, renderVelocityView);
}

function renderVelocityView(res, endDate, startDate, resultingDistance) {

    resultingDistance = resultingDistance.st_distance;

    var resultingTime = (endDate - startDate) / 1000;
    var resultingVelocityMS = resultingDistance / resultingTime;
    var resultingVelocityKMH = (resultingDistance / 1000) / (resultingTime / 3600);

    res.render('speedView', {
        title: "Calculated Distance:",
        distance: resultingDistance,
        time: resultingTime,
        velocity_ms: resultingVelocityMS,
        velocity_kmh: resultingVelocityKMH
    });
}

module.exports = { "getSpeedCalculationView": getSpeedCalculationView, "getSpeedCalculationJSON": getSpeedCalculationJSON };