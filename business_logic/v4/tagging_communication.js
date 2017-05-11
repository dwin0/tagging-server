var tagging = require('./tagging');
var typeOfMotion = require('./typeOfMotion');
var velocity = require('./velocity');
var surroundings = require('./surroundings');
var parallel = require("async/parallel");
var jsonHelper = require('./jsonHelper');
var positionsHelper = require('./positionsHelper');


function getTagsJSON(req, res) {

    var positions = req.body.positions;

    if(typeof positions === 'string') {
        positions = JSON.parse(positions);
    }

    var surroundingsPositions = positionsHelper.filterSurroundingsPositions(positions);
    positions = positionsHelper.filterPositions(positions);

    parallel([
            function(callback) {
                velocity.getVelocity_positionArray(positions, function (velocityJSON) {
                    callback(null, velocityJSON);
                });
            }
        ],
        function(err, results) {
            renderTagJSON(res, positions, surroundingsPositions, results[0])
        }
    );
}

function renderTagJSON(res, positions, surroundingsPositions, speedResult) {

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
                surroundings.getGeographicalSurroundings(surroundingsPositions, function (result) {
                    console.timeEnd('getGeographicalSurroundings');
                    callback(null, result);
                });
            },
            function(callback) {
                console.time('getGeoAdminData');
                surroundings.getGeoAdminData(surroundingsPositions, function (result) {
                    console.timeEnd('getGeoAdminData');
                    callback(null, result);
                })
            }
        ],
        function(err, results) {

            var typeOfMotionRes = typeOfMotion.getType(speedResult.velocity_kmh);

            /*Parameters: tagging-result, type-of-motion, speed-result, geographicalSurroundings-result, geoAdmin-result */
            var json = jsonHelper.renderTagJson(results[0], typeOfMotionRes, speedResult, results[1], results[2]);

            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(json));
        });
}


module.exports = { "getTagsJSON": getTagsJSON };