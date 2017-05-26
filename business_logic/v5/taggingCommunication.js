var tagging = require('./tagging');
var typeOfMotion = require('./typeOfMotion');
var velocity = require('./velocity');
var populationSurroundings = require('./populationSurroundings');
var geographicalSurroundings = require('./geographicalSurroundings');
var parallel = require('async/parallel');
var jsonHelper = require('./jsonHelper');
var positionsHelper = require('./positionsHelper');


function getTags(req, res) {

    var positions = positionsHelper.choosePositions(req.body.positions, res);
    if(!positions) {
        return;
    }

    velocity.getVelocity(positions, function (error, velocityJSON) {

        if(error) {
            res.status(500).send('Internal Server Error');
            return;
        }

        calculateTags(res, positions, velocityJSON)
    });
}


function calculateTags(res, positions, speedResult) {

    var typeOfMotionRes = typeOfMotion.getType(speedResult.velocity_kmh);

    if(typeOfMotionRes.name === 'unknown') {

        res.status(400).json({
            statusText: 'Bad Request',
            description: 'The input-positions are too far away from each other.',
            velocity_kmh: speedResult.velocity_kmh
        });

        return;
    }

    parallel([
            function(callback) {
                //console.time('getTag');
                tagging.getTag(typeOfMotionRes, positions, function (error, result) {
                    //console.timeEnd('getTag');
                    callback(error, result);
                });
            },
            function(callback) {
                //console.time('getGeographicalSurroundings');
                geographicalSurroundings.getGeographicalSurroundings(positions, function (error, result) {
                    //console.timeEnd('getGeographicalSurroundings');
                    callback(error, result);
                });
            },
            function(callback) {
                //console.time('getGeoAdminData');
                populationSurroundings.getGeoAdminData(positions, function (error, result) {
                    //console.timeEnd('getGeoAdminData');
                    callback(error, result);
                })
            },
            function (callback) {
                //console.time('checkIfSwitzerland');
                positionsHelper.checkIfSwitzerland(positions, function (error, result) {
                    //console.timeEnd('checkIfSwitzerland');
                    callback(error, result);
                })
            }
        ],
        function(err, results) {

            if(err) {
                res.status(500).send('Internal Server Error');
                return;
            }

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


module.exports = {
    "getTags": getTags
};