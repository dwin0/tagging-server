var db_access = require('../../persistence/db_access_v4');
var posHelper = require('./positionsHelper');
var queries = require('./dbQueries');
var parallel = require("async/parallel");


function getVelocity_request(req, res, callback) {

    var positions = req.body.positions;

    var startDate = new Date(positions[0].time);
    var endDate = new Date(positions[1].time);
    var queryPositions = posHelper.makePoints(positions);

    parallel([
            function(callback) {

                var database = db_access.getDatabase(db_access.STREETS_DB);

                db_access.singleQueryParameterized(database, queries.OSM_QUERY_DISTANCE, queryPositions, function (result) {
                    callback(null, result[0].st_distance)
                });
            }],
        function(err, results) {
            callback(res, endDate, startDate, results[0])
        });
}


function getVelocity_positionArray(positions, callback) {

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
                    var resultingVelocityMS = res[0].st_distance / time_s;
                    callback(null, { startPosition: i-1, endPosition: i, time_s: time_s, distance: res[0].st_distance,
                        resultingVelocityMS: resultingVelocityMS } );
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