/**
 * This module calculates the velocity.
 * @module business_logic/velocity
 */

var dbAccess = require('../../persistence/dbAccess_v5');
var queries = require('./dbQueries');
var parallel = require('async/parallel');


/**
 * Function which makes database calls to calculate the velocity.
 *
 * @param {Array} positions - the array is expected to have at least two positions inside
 * @param {function} callback - function which will be called with the result of the velocity calculation, param1 of callback is the error
 * which is null if no error occurred, param2 of callback is an object with distanceMeters, timeSeconds, velocityMeterPerSecond and velocityKilometersPerHour
 */
function getVelocity(positions, callback) {

    var dbRequests = [];

    //prepare dbRequests to get all distances between the input-points
    for(var i = 1; i < positions.length; i++) {

        var pos1 = positions[i-1];
        var pos2 = positions[i];
        var timeSeconds = Math.abs(new Date(pos2.time).getTime() - new Date(pos1.time).getTime()) / 1000;
        const queryPositions = queries.makePoints([pos1, pos2]);

        dbRequests[i-1] = (function(timeSeconds) {
            return function(parallelCallback) {

                dbAccess.singleQuery(queries.OSM_QUERY_DISTANCE, queryPositions, function (err, res) {
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


/**
 * Function which brings the database result of the velocity calculation into a consistent answer, which can later be sent back to the client.
 *
 * @param {Array} dbResults - database result of the velocity calculation
 * @returns {object} an object like this: {distanceMeters: number, timeSeconds: number, velocityMeterPerSecond: number, velocityKilometersPerHour: number}
 */
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