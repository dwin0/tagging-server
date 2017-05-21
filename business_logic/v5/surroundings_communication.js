var populationSurroundings = require('./populationSurroundings');
var geographicalSurroundings = require('./geographicalSurroundings');
var parallel = require("async/parallel");
var jsonHelper = require('./jsonHelper');
var positionsHelper = require('./positionsHelper');


function getSurroundingsJSON(req, res) {

    var positions = positionsHelper.choosePositions(req.body.positions, res);

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
            var json = jsonHelper.renderSurroundingsJson(results[0], results[1]);

            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(json));
        }
    );
}


module.exports = { "getSurroundingsJSON": getSurroundingsJSON };