var tagging = require('./tagging');
var typeOfMotion = require('./typeOfMotion');
var velocity = require('./velocity');
var populationSurroundings = require('./populationSurroundings');
var geographicalSurroundings = require('./geographicalSurroundings');
var parallel = require("async/parallel");
var jsonHelper = require('./jsonHelper');
var positionsHelper = require('./positionsHelper');


function getTagsJSON(req, res) {

    var positions = req.body.positions;

    if(typeof positions === 'string') {
        positions = JSON.parse(positions);
    }

    var surroundingsPositions = positionsHelper.filterSurroundingsPositions(positions);

    if(surroundingsPositions.length < 3) {

        res.status(400).json({ error: 'Phases DownloadStart, DownloadEnd and UploadEnd where expected. ' +
            'At least one phase is missing.' });
        return;
    }


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
                //console.time('getTag');
                tagging.getTag(speedResult.velocityKilometersPerHour, positions, function (result) {
                    //console.timeEnd('getTag');
                    callback(null, result);
                });
            },
            function(callback) {
                //console.time('getGeographicalSurroundings');
                geographicalSurroundings.getGeographicalSurroundings(surroundingsPositions, function (result) {
                    //console.timeEnd('getGeographicalSurroundings');
                    callback(null, result);
                });
            },
            function(callback) {
                //console.time('getGeoAdminData');
                populationSurroundings.getGeoAdminData(surroundingsPositions, function (result) {
                    //console.timeEnd('getGeoAdminData');
                    callback(null, result);
                })
            }
        ],
        function(err, results) {

            var typeOfMotionRes = typeOfMotion.getType(speedResult.velocityKilometersPerHour);

            /*Parameters: tagging-result, type-of-motion, speed-result, geographicalSurroundings-result, geoAdmin-result */
            var json = jsonHelper.renderTagJson(results[0], typeOfMotionRes, speedResult, results[1], results[2]);

            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(json));
        });
}


module.exports = { "getTagsJSON": getTagsJSON };