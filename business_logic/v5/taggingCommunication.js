var tagging = require('./tagging');
var typeOfMotion = require('./typeOfMotion');
var velocity = require('./velocity');
var populationSurroundings = require('./populationSurroundings');
var geographicalSurroundings = require('./geographicalSurroundings');
var parallel = require('async/parallel');
var jsonHelper = require('./jsonHelper');
var positionsHelper = require('./positionsHelper');


function getTags(req, res) {

    positionsHelper.choosePositions(req.body.positions, res, function (positions) {

        //error occurred
        if(!positions) {
            return;
        }

        calculateVelocity(positions, res, calculateTags);
    });
}


function calculateVelocity(positions, res, callback) {

    velocity.getVelocity(positions, function (error, velocityJSON) {

        if(error || velocityJSON.velocityKilometersPerHour < 0) {
            res.status(500).send('Internal Server Error');
            return;
        }

        if(velocityJSON.timeSeconds === 0) {
            res.status(400).json({
                statusText: 'Bad Request',
                description: 'All positions have the same time.'
            });
            return;
        }

        callback(res, positions, velocityJSON)
    });
}


function calculateTags(res, positions, speedResult) {

    var typeOfMotionRes = typeOfMotion.getTypeOfMotion(speedResult.velocityKilometersPerHour);

    if(typeOfMotionRes.name === 'unknown') {

        res.status(400).json({
            statusText: 'Bad Request',
            description: 'The input-positions are too far away from each other.',
            velocityKilometersPerHour: speedResult.velocityKilometersPerHour
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
            }
        ],
        function(err, results) {

            if(err) {
                res.status(500).send('Internal Server Error');
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