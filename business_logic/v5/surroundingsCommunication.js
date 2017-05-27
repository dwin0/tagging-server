var populationSurroundings = require('./populationSurroundings');
var geographicalSurroundings = require('./geographicalSurroundings');
var parallel = require('async/parallel');
var jsonHelper = require('./jsonHelper');
var positionsHelper = require('./positionsHelper');


function getSurroundings(req, res) {

    positionsHelper.choosePositions(req.body.positions, res, function (positions) {

        //error occurred
        if(!positions) {
            return;
        }

        calculateSurroundings(positions, res);
    });
}

function calculateSurroundings(positions, res) {

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
                res.status(500).send('Internal Server Error');
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