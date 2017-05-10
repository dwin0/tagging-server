var db_access = require('../../persistence/db_access_v3');
var parallel = require("async/parallel");

const OSM_QUERY_DISTANCE = 'SELECT ST_Distance(ST_GeomFromText(\'POINT({lon1} {lat1})\',4326)::geography, ' +
    'ST_GeomFromText(\'POINT({lon2} {lat2})\', 4326)::geography);';


function getVelocity_request(req, res, callback) {

    var positions = req.body.positions;

    var startDate = new Date(positions[0].time);
    var endDate = new Date(positions[1].time);
    var dbStatement = getDbStatement(positions);

    parallel([
            function(callback) {
                db_access.singleQuery(db_access.getDatabase(db_access.STREETS_DB), dbStatement, function (result) {
                    callback(null, result[0].st_distance)
                });
            }],
        function(err, results) {
            callback(res, endDate, startDate, results[0])
        });
}


function getVelocity_positionArray(positions, callback) {

    var dbStatements = [];
    var dbRequests = [];

    //prepare dbRequests
    for(var i = 1; i < positions.length; i++) {

        var pos1 = positions[i-1];
        var pos2 = positions[i];
        var time_s = Math.abs(new Date(pos2.time).getTime() - new Date(pos1.time).getTime()) / 1000;

        dbStatements[i-1] = getDbStatement([pos1, pos2]);

        dbRequests[i-1] = (function(i, time_s) {
            return function(callback) {
                db_access.singleQuery(db_access.getDatabase(db_access.STREETS_DB), dbStatements[i-1], function (res) {
                    var resultingVelocityMS = res[0].st_distance / time_s;
                    callback(null, { startPosition: i-1, endPosition: i, time_s: time_s, distance: res[0].st_distance,
                        resultingVelocityMS: resultingVelocityMS } );
                    /*For Debugging: callback(null, { startPosition: i-1, endPosition: i, time_s: time_s, distance: res,
                    resultingVelocityMS: resultingVelocityMS } );*/
                });
            };
        }(i, time_s));
    }

    //Request database and calculate average speed
    parallel(dbRequests,
        function(err, results) {
            callback(calcAverageVelocity(results));
        });
}


function calcAverageVelocity(positions) {

    var numerator = 0; //Zähler -> Total Distance
    var denominator = 0; //Nenner -> Total Time

    //velocity = (t1 * v1 + t2 * v2) / t1 + t2
    positions.forEach(function (pos) {
        numerator += pos.time_s * pos.resultingVelocityMS;
        denominator += pos.time_s;
    });

    var velocity_ms = numerator / denominator;

    return {
        title: "Calculated velocity:",
        distance_m: numerator,
        time_s: denominator,
        velocity_ms: velocity_ms,
        velocity_kmh: velocity_ms * 3.6,
        probability: null
    };
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


module.exports = { "getVelocity_request": getVelocity_request, "getVelocity_positionArray": getVelocity_positionArray, "prepareJSON": prepareJSON };