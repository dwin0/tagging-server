var tagging = require('./tagging');
var helper = require('./helper');
var typeOfMotion = require('./typeOfMotion');
var velocity = require('./velocity');
var db_access = require('../../persistence/db_access_v2');
var parallel = require("async/parallel");

const OSM_NEAREST_OBJECTS = 'WITH closest_candidates AS (SELECT id, osm_id, osm_name, clazz, geom_way FROM switzerland ' +
    'ORDER BY geom_way <-> ST_GeomFromText(\'POINT({lon} {lat})\', 4326) LIMIT 100) ' +
    'SELECT id, osm_id, osm_name, clazz, ST_Distance(geom_way::geography, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)::geography) FROM closest_candidates ' +
    'ORDER BY ST_Distance(geom_way, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)) LIMIT 3;';


function getTagsJSON(req, res) {

    var positions = filterPositions(req.body.positions);
    var nearestObjectsStatements = helper.getDBStatements(OSM_NEAREST_OBJECTS, positions);

    parallel([
            function(callback) {
                db_access.queryMultiple(db_access.getDatabase(db_access.STREETS_DB), nearestObjectsStatements, function (nearestWayResults) {
                    callback(null, nearestWayResults);
                });
            },
            function(callback) {
                velocity.getVelocity_positionArray(positions, function (velocityJSON) {
                    callback(null, velocityJSON);
                });
            }
        ],
        function(err, results) {
            renderTagJSON(res, positions, results[0], results[1])
        });
}

function renderTagJSON(res, positions, taggingResult, speedResult) {

    var typeOfMotionRes = typeOfMotion.getType(speedResult.velocity_kmh);

    parallel([
            function(callback) {
                tagging.getTag(taggingResult, typeOfMotionRes, positions, function (result) {
                    callback(null, result);
                });
            }
        ],
        function(err, results) {

            var taggingRes = results[0];
            res.writeHead(200, {"Content-Type": "application/json"});

            var json = JSON.stringify({
                title: "Calculated Tagging",
                measuring_location: {
                    location: {
                        id: taggingRes.tag.id,
                        name: taggingRes.tag.name,
                        description: taggingRes.tag.description,
                        probability_0to1: taggingRes.probability
                    },
                    surrounding: {
                        id: null,
                        name: null,
                        description: null,
                        probability_0to1: null
                    }
                },
                type_of_motion: {
                    id: typeOfMotionRes.id,
                    name: typeOfMotionRes.name,
                    description: typeOfMotionRes.description,
                    probability_0to1: null
                },
                velocity: {
                    distance_m: speedResult.distance,
                    time_s: speedResult.time_s,
                    velocity_ms: speedResult.velocity_ms,
                    velocity_kmh: speedResult.velocity_kmh,
                    probability_0to1: speedResult.probability_0to1
                },
                population_density: {
                    id: null,
                    name: null,
                    description: null,
                    probability_0to1: null
                }
            });

            res.end(json);
        });
}



function getTagsView(req, res) {

    var positions = filterPositions(JSON.parse(req.body.positions));
    var statements = helper.getDBStatements(OSM_NEAREST_OBJECTS, positions);

    var coordinates = [
        {lat: positions[0].latitude, lon: positions[0].longitude},
        {lat: positions[1].latitude, lon: positions[1].longitude},
        {lat: positions[2].latitude, lon: positions[2].longitude}];


    parallel([
            function(callback) {
                db_access.queryMultiple(db_access.getDatabase(db_access.STREETS_DB), statements, function (result) {
                    callback(null, result);
                });
            },
            function(callback) {
                velocity.getVelocity_positionArray(positions, function (velocityJSON) {
                    callback(null, velocityJSON);
                });
            }],
        function(err, results) {
            renderTagView(res, results[0], results[1], coordinates);
        });
}

function renderTagView(res, taggingResult, speedResult, coordinates) {

    var typeOfMotionRes = typeOfMotion.getType(speedResult.velocity_kmh);
    var taggingRes = tagging.getTag(taggingResult, typeOfMotionRes);


    res.render('nearestView', {
        title: "Calculated Tag",
        results: taggingResult,
        tag: taggingRes.tag.name,
        probability_0to1: taggingRes.tag.probability,
        coordinates: coordinates
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