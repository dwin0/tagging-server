var populationSurroundings = require('./populationSurroundings');
var geographicalSurroundings = require('./geographicalSurroundings');
var parallel = require("async/parallel");
var jsonHelper = require('./jsonHelper');
var positionsHelper = require('./positionsHelper');


function getSurroundings(req, res) {

    var positions = positionsHelper.choosePositions(req.body.positions, res);
    if(typeof positions === 'undefined') {
        return;
    }

    parallel([
            function(callback) {
                geographicalSurroundings.getGeographicalSurroundings(positions, function (result) {
                    callback(null, result);
                });
            },
            function(callback) {
                populationSurroundings.getGeoAdminData(positions, function (result) {
                    callback(null, result);
                })
            }
        ],
        function(err, results) {

            /*Parameters: geographicalSurroundings-result, geoAdmin-result */
            var response = jsonHelper.renderSurroundingsJson(results[0], results[1]);
            res.status(200).json(response);
        }
    );
}


module.exports = { "getSurroundings": getSurroundings };