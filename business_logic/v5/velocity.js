var db_access = require('../../persistence/dbAccess_v5');
var posHelper = require('./positionsHelper');
var queries = require('./dbQueries');
var parallel = require('async/parallel');


function getVelocity(positions, callback) {

    var dbRequests = [];
    var database = db_access.getDatabase(db_access.STREETS_DB);

    //prepare dbRequests to get all distances between the input-points
    for(var i = 1; i < positions.length; i++) {

        var pos1 = positions[i-1];
        var pos2 = positions[i];
        var timeSeconds = Math.abs(new Date(pos2.time).getTime() - new Date(pos1.time).getTime()) / 1000;
        const queryPositions = posHelper.makePoints([pos1, pos2]);

        dbRequests[i-1] = (function(timeSeconds) {
            return function(parallelCallback) {

                db_access.singleQuery(database, queries.OSM_QUERY_DISTANCE, queryPositions, function (err, res) {
                    if(err) {
                        parallelCallback(err);
                        return;
                    }
                    parallelCallback(null, { timeSeconds: timeSeconds, distanceMeters: res[0].st_distance });
                });
            };
        }(timeSeconds));
    }

    //Request database and calculate average speed
    parallel(dbRequests,
        function(err, results) {
            if(err) {
                callback(err);
                return;
            }

            callback(null, calcAverageVelocity(results));
        }
    );
}


function calcAverageVelocity(dbResults) {

    //velocity = (s1 + s2) / (t1 + t2)

    var totalDistance = 0;
    var totalTime = 0;

    dbResults.forEach(function (pos) {
        totalDistance += pos.distanceMeters;
        totalTime += pos.timeSeconds;
    });

    var velocityMeterPerSecond = totalDistance / totalTime;
    var velocityKilometersPerHour = velocityMeterPerSecond * 3.6;

    return {
        distanceMeters: Math.round(totalDistance),
        timeSeconds: totalTime,
        velocityMeterPerSecond: Math.round(velocityMeterPerSecond),
        velocityKilometersPerHour: Math.round(velocityKilometersPerHour)
    };
}


module.exports = {
    "getVelocity": getVelocity
};