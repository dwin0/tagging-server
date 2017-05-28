var tagging = require('./tagging');
var typeOfMotion = require('./typeOfMotion');
var velocity = require('./velocity');
var surroundings = require('./surroundings');
var surroundings_communication = require('./surroundings_communication');
var parallel = require("async/parallel");


function getTagsJSON(req, res) {

    var positions = req.body.positions;

    if(typeof positions === 'string') {
        positions = JSON.parse(positions);
    }

    var surroundingsPositions = surroundings_communication.filterSurroundingsPositions(positions);
    positions = filterPositions(positions);

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

    var typeOfMotionRes = typeOfMotion.getType(speedResult.velocityKilometersPerHour);

    parallel([
            function(callback) {
                tagging.getTag(speedResult.velocityKilometersPerHour, positions, function (result) {
                    callback(null, result);
                });
            },
            function(callback) {
                surroundings.getGeographicalSurroundings(surroundingsPositions, function (result) {
                    callback(null, result);
                });
            },
            function(callback) {
                surroundings.getGeoAdminData(surroundingsPositions, function (result) {
                    callback(null, result);
                })
            }
        ],
        function(err, results) {

            var taggingRes = results[0];
            var geographicalSurroundingsResult = results[1];
            var geoAdminResults = results[2];
            var jsonSurrounding = surroundings_communication.renderSurroundingsJson(geographicalSurroundingsResult, geoAdminResults);
            res.writeHead(200, {"Content-Type": "application/json"});

            var json = JSON.stringify({
                title: "Calculated Tagging",
                location: {
                    id: taggingRes.tag.id,
                    name: taggingRes.tag.name,
                    description: taggingRes.tag.description,
                    probability: taggingRes.probability,
                    allProbabilities: taggingRes.allProbabilities
                },
                typeOfMotion: {
                    id: typeOfMotionRes.id,
                    name: typeOfMotionRes.name,
                    description: typeOfMotionRes.description
                },
                velocity: {
                    distanceMeters: speedResult.distanceMeters,
                    timeSeconds: speedResult.timeSeconds,
                    velocityMeterPerSecond: speedResult.velocityMeterPerSecond,
                    velocityKilometersPerHour: speedResult.velocityKilometersPerHour
                },
                surroundings: jsonSurrounding.surroundings
            });

            res.end(json);
        });
}


//Get measurement-points 1 (FCTStart), 4 (DownloadEnd) and 8 (RTTEnd)
function filterPositions(positions) {

    positions.sort(function (p1, p2) {
        return new Date(p1.time).getTime() - new Date(p2.time).getTime();
    });

    return [positions[0], positions[3], positions[7]];
}





module.exports = { "getTagsJSON": getTagsJSON };