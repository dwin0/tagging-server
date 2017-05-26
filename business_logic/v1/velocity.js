var db_access = require('../../persistence/db_access_v1');

const OSM_QUERY_DISTANCE = 'SELECT ST_Distance(ST_GeomFromText(\'POINT({lon1} {lat1})\',4326)::geography, ' +
    'ST_GeomFromText(\'POINT({lon2} {lat2})\', 4326)::geography);';


function getSpeedCalculationJSON(req, res) {
    getVelocity(req, res, function (res, endDate, startDate, resultingDistance) {

        res.writeHead(200, {"Content-Type": "application/json"});
        var json = prepareJSON(endDate, startDate, resultingDistance);
        res.end( JSON.stringify(json));
    })
}

function getSpeedCalculationView(req, res) {
    getVelocity(req, res, function (res, endDate, startDate, resultingDistance) {

        var json = prepareJSON(endDate, startDate, resultingDistance);
        res.render('speedView', json);
    })
}

function getVelocity(req, res, callback) {

    var positions = req.body.positions;
    var startDate = new Date(positions[0].time);
    var endDate = new Date(positions[1].time);
    var statement = getDbStatement(positions);

    db_access.singleQuery(statement, res, startDate, endDate, callback);
}


function getDbStatement(positions) {

    return OSM_QUERY_DISTANCE
        .replaceAll("{lon1}", positions[0].longitude)
        .replaceAll("{lat1}", positions[0].latitude)
        .replaceAll("{lon2}", positions[1].longitude)
        .replaceAll("{lat2}", positions[1].latitude);
}

function prepareJSON(endDate, startDate, resultingDistance) {

    var resultingTime = (endDate - startDate) / 1000;
    var resultingVelocityMS = resultingDistance / resultingTime;
    var resultingVelocityKMH = (resultingDistance / 1000) / (resultingTime / 3600);

    return {
        title: "Calculated velocity:",
        distance_m: resultingDistance,
        time_s: resultingTime,
        velocity_ms: resultingVelocityMS,
        velocity_kmh: resultingVelocityKMH,
        probability: null
    }
}


module.exports = { "getSpeedCalculationView": getSpeedCalculationView, "getSpeedCalculationJSON": getSpeedCalculationJSON };