var tagging = require('./tagging');
var typeOfMotion = require('./typeOfMotion');
var velocity = require('./velocity');
var populationSurroundings = require('./populationSurroundings');
var geographicalSurroundings = require('./geographicalSurroundings');
var parallel = require("async/parallel");
var jsonHelper = require('./jsonHelper');
var positionsHelper = require('./positionsHelper');


function getTags(req, res) {

    var positions = positionsHelper.choosePositions(req.body.positions, res);
    if(typeof positions === 'undefined') {
        return;
    }

    parallel([
            function(callback) {
                velocity.getVelocity_positionArray(positions, function (velocityJSON) {
                    callback(null, velocityJSON);
                });
            }
        ],
        function(err, results) {
            calculateTags(res, positions, results[0])
        }
    );
}

function calculateTags(res, positions, speedResult) {

    var typeOfMotionRes = typeOfMotion.getType(speedResult.velocity_kmh);

    if(typeOfMotionRes.name === "unknown") {

        res.status(400).json({
            statusText: 'Bad Request',
            description: 'The input-positions are too far away from each other.',
            velocity_kmh: speedResult.velocity_kmh
        });

        return;
    }

    //TODO: check if faster if long operations are put at the beginning
    parallel([
            function(callback) {
                console.time('getTag');
                tagging.getTag(speedResult.velocity_kmh, positions, function (result) {
                    console.timeEnd('getTag');
                    callback(null, result);
                });
            },
            function(callback) {
                console.time('getGeographicalSurroundings');
                geographicalSurroundings.getGeographicalSurroundings(positions, function (result) {
                    console.timeEnd('getGeographicalSurroundings');
                    callback(null, result);
                });
            },
            function(callback) {
                console.time('getGeoAdminData');
                populationSurroundings.getGeoAdminData(positions, function (result) {
                    console.timeEnd('getGeoAdminData');
                    callback(null, result);
                })
            },
            function (callback) {
                console.time('checkIfSwitzerland');
                positionsHelper.checkIfSwitzerland(positions, function (result) {
                    console.timeEnd('checkIfSwitzerland');
                    callback(null, result);
                })
            }
        ],
        function(err, results) {

            var allPointsInSwitzerland = results[3];

            if(!allPointsInSwitzerland) {

                res.status(400).json({
                    statusText: 'Bad Request',
                    description: 'Not all positions are located within switzerland.'
                });

                return;
            }


            /*Parameters: tagging-result, type-of-motion, speed-result, geographicalSurroundings-result, geoAdmin-result */
            var response = jsonHelper.renderTagJson(results[0], typeOfMotionRes, speedResult, results[1], results[2]);
            res.status(200).json(response);
        });
}


module.exports = { "getTags": getTags };