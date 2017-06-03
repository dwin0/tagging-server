var populationSurroundings = require('./populationSurroundings');
var geographicalSurroundings = require('./geographicalSurroundings');
var parallel = require('async/parallel');
var jsonHelper = require('./jsonHelper');
var positionsHelper = require('./positionsHelper');
var logError = require('./errorLogger').logError;


function getSurroundings(req, res) {

    positionsHelper.choosePositions(req.body, res, function (positions) {

        //error occurred, but already handled
        if(!positions) {
            return;
        }

        calculateSurroundings(positions, req.body, res);
    });
}

function calculateSurroundings(positions, body, res) {

    parallel([
            function(callback) {
                geographicalSurroundings.getGeographicalSurroundings(positions, function (error, result) {
                    callback(error, result);
                });
            },
            function(callback) {
                populationSurroundings.getGeoAdminData(positions, function (error, result) {
                    callback(error, result);
                })
            }
        ],
        function(err, results) {

            if(err) {
                res.status(500).json({ error: 'Internal Server Error' });
                logError(500, 'Internal Server Error', err, 'parallel', 'surroundingsCommunication', body);
                return;
            }

            /*Parameters: geographicalSurroundings-result, geoAdmin-result */
            var response = jsonHelper.renderSurroundingsJson(results[0], results[1]);
            res.status(200).json(response);
        }
    );
}


module.exports = {
    "getSurroundings": getSurroundings
};