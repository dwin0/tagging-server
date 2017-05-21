var tagging = require('./tagging');
var typeOfMotion = require('./typeOfMotion');
var velocity = require('./velocity');
var populationSurroundings = require('./populationSurroundings');
var geographicalSurroundings = require('./geographicalSurroundings');
var parallel = require("async/parallel");
var jsonHelper = require('./jsonHelper');
var positionsHelper = require('./positionsHelper');


function getTagsJSON(req, res) {

    var positions = positionsHelper.choosePositions(req.body.positions, res);

    parallel([
            function(callback) {
                velocity.getVelocity_positionArray(positions, function (velocityJSON) {
                    callback(null, velocityJSON);
                });
            }
        ],
        function(err, results) {
            renderTagJSON(res, positions, results[0])
        }
    );
}

function renderTagJSON(res, positions, speedResult) {

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