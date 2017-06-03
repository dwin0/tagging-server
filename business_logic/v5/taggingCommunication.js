var tagging = require('./tagging');
var typeOfMotion = require('./typeOfMotion');
var velocity = require('./velocity');
var populationSurroundings = require('./populationSurroundings');
var geographicalSurroundings = require('./geographicalSurroundings');
var parallel = require('async/parallel');
var jsonHelper = require('./jsonHelper');
var positionsHelper = require('./positionsHelper');
var logError = require('./errorLogger').logError;


function getTags(req, res) {

    positionsHelper.choosePositions(req.body, res, function (positions) {

        //error occurred, but already handled
        if(!positions) {
            return;
        }

        calculateVelocity(positions, req.body, res, calculateTags);
    });
}


function calculateVelocity(positions, body, res, callback) {

    velocity.getVelocity(positions, function (error, velocityJSON) {

        if(error || velocityJSON.velocityKilometersPerHour < 0) {
            res.status(500).json({ error: 'Internal Server Error' });
            logError(500, 'Internal Server Error', error || 'Speed: ' + velocityJSON.velocityKilometersPerHour + 'km/h',
                'velocity.getVelocity', 'taggingCommunication', body);
            return;
        }

        if(velocityJSON.timeSeconds === 0) {
            res.status(400).json({ error: 'All positions have the same time.' });
            return;
        }

        callback(positions, body, res, velocityJSON)
    });
}


function calculateTags(positions, body, res, velocityJSON) {

    var typeOfMotionRes = typeOfMotion.getTypeOfMotion(velocityJSON.velocityKilometersPerHour);

    if(typeOfMotionRes.name === 'unknown') {
        res.status(400).json({ error: 'The input-positions are too far away from each other.' });
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
                res.status(500).json({ error: 'Internal Server Error' });
                logError(500, 'Internal Server Error', err, 'parallel', 'taggingCommunication', body);
                return;
            }

            /*Parameters: tagging-result, type-of-motion, speed-result, geographicalSurroundings-result, geoAdmin-result */
            var response = jsonHelper.renderTagJson(results[0], typeOfMotionRes, velocityJSON, results[1], results[2]);
            res.status(200).json(response);
        });
}


module.exports = {
    "getTags": getTags
};