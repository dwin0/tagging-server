var db_access = require('../../persistence/db_access_v4');
var posHelper = require('./positionsHelper');
var queries = require('./dbQueries');
var parallel = require("async/parallel");


function getVelocity_request(req, res, callback) {

    var positions = req.body.positions;
    var queryPositions = posHelper.makePoints(positions);
    var database = db_access.getDatabase(db_access.STREETS_DB);

    db_access.singleQueryParameterized(database, queries.OSM_QUERY_DISTANCE, queryPositions, function (result) {

        var startDate = new Date(positions[0].time);
        var endDate = new Date(positions[1].time);

        callback(res, endDate, startDate, result[0].st_distance)
    });
}


function prepareJSON(endDate, startDate, resultingDistance) {

    var resultingTime = (endDate - startDate) / 1000;
    var resultingVelocityMS = resultingDistance / resultingTime;
    var resultingVelocityKMH = resultingVelocityMS * 3.6;

    return {
        distance_m: resultingDistance,
        time_s: resultingTime,
        velocity_ms: resultingVelocityMS,
        velocity_kmh: resultingVelocityKMH,
        probability: null
    }
}


function getVelocity(positions, callback) {

    var dbRequests = [];

    //prepare dbRequests
    for(var i = 1; i < positions.length; i++) {

        var pos1 = positions[i-1];
        var pos2 = positions[i];
        var time_s = Math.abs(new Date(pos2.time).getTime() - new Date(pos1.time).getTime()) / 1000;
        const queryPositions = posHelper.makePoints([pos1, pos2]);

        dbRequests[i-1] = (function(i, time_s) {
            return function(callback) {

                var database = db_access.getDatabase(db_access.STREETS_DB);

                db_access.singleQueryParameterized(database, queries.OSM_QUERY_DISTANCE, queryPositions, function (res) {
                    callback(null, { time_s: time_s, distance_m: res[0].st_distance });
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

    //velocity = (t1 * v1 + t2 * v2) / t1 + t2

    var totalDistance = 0;
    var totalTime = 0;

    positions.forEach(function (pos) {
        totalDistance += pos.distance_m;
        totalTime += pos.time_s;
    });

    var velocity_ms = totalDistance / totalTime;
    var velocity_kmh = velocity_ms * 3.6;

    return {
        distance_m: totalDistance,
        time_s: totalTime,
        velocity_ms: velocity_ms,
        velocity_kmh: velocity_kmh,
        probability: null
    };
}


module.exports = {
    "getVelocity_request": getVelocity_request,
    "getVelocity": getVelocity,
    "prepareJSON": prepareJSON
};