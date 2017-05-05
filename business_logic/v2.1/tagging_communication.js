var tagging = require('./tagging');
var typeOfMotion = require('./typeOfMotion');
var velocity = require('./velocity');
var parallel = require("async/parallel");


function getTagsJSON(req, res) {

    var positions = filterPositions(req.body.positions);

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

    var typeOfMotionRes = typeOfMotion.getType(speedResult.velocity_kmh);

    parallel([
            function(callback) {
                tagging.getTag(speedResult.velocity_kmh, positions, function (result) {
                    callback(null, result);
                });
            }
        ],
        function(err, results) {

            var taggingRes = results[0];
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
                type_of_motion: {
                    id: typeOfMotionRes.id,
                    name: typeOfMotionRes.name,
                    description: typeOfMotionRes.description,
                    probability: null
                },
                velocity: {
                    distance_m: speedResult.distance,
                    time_s: speedResult.time_s,
                    velocity_ms: speedResult.velocity_ms,
                    velocity_kmh: speedResult.velocity_kmh,
                    probability: speedResult.probability
                },
                surroundings: {
                    geographical_surroundings: {
                        id: null,
                        name: null,
                        description: null,
                        probability: null
                    },
                    population_density: {
                        id: null,
                        name: null,
                        description: null,
                        probability: null
                    }
                }
            });

            res.end(json);
        });
}



function getTagsView(req, res) {

    var positions = filterPositions(JSON.parse(req.body.positions));

    var coordinates = [
        {lat: positions[0].latitude, lon: positions[0].longitude},
        {lat: positions[1].latitude, lon: positions[1].longitude},
        {lat: positions[2].latitude, lon: positions[2].longitude}];


    parallel([
            function(callback) {
                velocity.getVelocity_positionArray(positions, function (velocityJSON) {
                    callback(null, velocityJSON);
                });
            }],
        function(err, results) {
            renderTagView(res, results[0], coordinates, positions);
        });
}

function renderTagView(res, speedResult, coordinates, positions) {

    var typeOfMotionRes = typeOfMotion.getType(speedResult.velocity_kmh);

    parallel([
            function (callback) {
                tagging.getTag(speedResult.velocity_kmh, positions, function (result) {
                    callback(null, result);
                });
            }
        ],
        function (err, results) {

            var taggingRes = results[0];

            var json = {
                title: "Calculated Tag",
                results: [],
                tag: taggingRes.tag.name,
                probability: taggingRes.probability,
                coordinates: coordinates
            };

            res.render('nearestView', json);
        });
}


//Get measurement-points 1 (FCTStart), 4 (DownloadEnd) and 8 (RTTEnd)
function filterPositions(positions) {

    positions.sort(function (p1, p2) {
        return new Date(p1.time).getTime() - new Date(p2.time).getTime();
    });

    return [positions[0], positions[3], positions[7]];
}


String.prototype.replaceAll = function(target, replacement) {
    return this.split(target).join(replacement);
};


module.exports = { "getTagsView": getTagsView, "getTagsJSON": getTagsJSON };