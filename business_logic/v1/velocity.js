var db_access = require('../../persistence/db_access');

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

    var body = req.body;
    var startDate = new Date(body.startTime);
    var endDate = new Date(body.endTime);
    var statement = getDbStatement(body);

    db_access.singleQuery(statement, res, startDate, endDate, callback);
}


function getDbStatement(positions) {

    return OSM_QUERY_DISTANCE
        .replaceAll("{lon1}", positions.longitude1)
        .replaceAll("{lat1}", positions.latitude1)
        .replaceAll("{lon2}", positions.longitude2)
        .replaceAll("{lat2}", positions.latitude2);
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
        probability_0to1: null
    }
}


module.exports = { "getSpeedCalculationView": getSpeedCalculationView, "getSpeedCalculationJSON": getSpeedCalculationJSON };