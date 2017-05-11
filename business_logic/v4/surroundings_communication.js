var surroundings = require('./surroundings');
var parallel = require("async/parallel");
var jsonHelper = require('./jsonHelper');
var positionsHelper = require('./positionsHelper');


function getSurroundingsJSON(req, res) {

    var positions = req.body.positions;

    if(typeof positions === 'string') {
        positions = JSON.parse(positions);
    }

    positions = positionsHelper.filterSurroundingsPositions(positions);

    if(positions.length < 3) {

        res.writeHead(400, {"Content-Type": "application/json"});
        var json = JSON.stringify({
            statusText: 'Bad Request',
            description: 'Phases DownloadStart, DownloadEnd and UploadEnd where expected. At least one phase is missing.',
            receivedElements: positions
        });
        res.end(json);

    } else {
        parallel([
                function(callback) {
                    surroundings.getGeographicalSurroundings(positions, function (result) {
                        callback(null, result);
                    });
                },
                function(callback) {
                    surroundings.getGeoAdminData(positions, function (result) {
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
}


module.exports = { "getSurroundingsJSON": getSurroundingsJSON };