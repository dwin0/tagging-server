var db_access= require('../../persistence/db_access_v3');
var helper = require('./helper');
var parallel = require("async/parallel");


const GRASSLAND = {
    id: 1,
    name: "grassland",
    description: "Includes OpenStreetMap-Key: landuse with the values: meadow, farmland, grass, farmyard, allotments, greenhouse_horticulture, " +
    "plant_nursery, recreation_ground, village_green, greenfield and conservation. Includes OpenStreetMap-Key: natural with the values: scrub, " +
    "grassland, wetland, fell, heath, meadow and grass. Includes OpenStreetMap-Key: protected_area, national_park and nature_reserve. Includes " +
    "OpenStreetMap-Key: leisure with the values: garden, park, nature_reserve, golf_course, miniature_golf, recreation_ground and dog_park."
};

const TREES = {
    id: 2,
    name: "trees",
    description: "Includes OpenStreetMap-Key: landuse with the values: forest, vineyard and orchard. Includes OpenStreetMap-Key: natural with the " +
    "values: wood, tree and tree_row."
};

const CONSTRUCTEDAREA = {
    id: 3,
    name: "constructedArea",
    description: "Includes OpenStreetMap-Key: landuse with the vaalues: residential, industrial, construction, commercial, quarry, railway, military, " +
    "retail, landfill, brownfield and garages. Includes OpenStreetMap-Key: leisure with the values: sports_centre and stadium."
};

const WATER = {
    id: 4,
    name: "water",
    description: "Includes OpenStreetMap-Key: landuse with the values: basin and reservoir. Includes OpenStreetMap-Key: natural with the value: water. " +
    "Includes OpenStreetMap-Key: leisure with the values: swimming_pool, marina, water_park and slipway."
};

const ROCKS = {
    id: 5,
    name: "rocks",
    description: "Includes OpenStreetMap-Key: natural with the values: scree, bare_rock, shingle, cliff, rock and stone."
};

const OTHER = {
    id: 100,
    name:"other",
    description: "OSM-tag is defined, but not supported."
};

const UNKNOWN = {
    id: -1,
    name: "unknown",
    description: "No tagging possible."
};


const FIND_MIDDLE_POINT = "SELECT ST_AsText(ST_Centroid(ST_GeomFromText(('MULTIPOINT ( {lon1} {lat1}, {lon2} {lat2})'), 4326)));";

const NATURAL_QUERY = 'WITH natural_match AS (SELECT "natural", wkb_geometry FROM multipolygons WHERE "natural" IS NOT NULL) ' +
    'SELECT "natural" FROM natural_match ' +
    'WHERE ST_Within(ST_GeomFromText((\'{point}\'), 4326), ST_GeomFromEWKB(natural_match.wkb_geometry))';


function getGeographicalSurroundings(positions, callback) {
    var middlePointQueries = prepareMiddlePointDbStatements(FIND_MIDDLE_POINT, positions);

    parallel([
            function(callback) {
                db_access.queryMultiple(db_access.getDatabase(db_access.SWITZERLAND_DB), middlePointQueries, function (result) {
                    callback(null, result);
                });
            }
        ],
        function (err, results) {
            var naturalQueries = prepareNaturalDbStatements(NATURAL_QUERY, results);
            console.log(naturalQueries);

            parallel([
                    function(callback) {
                        db_access.queryMultiple(db_access.getDatabase(db_access.SWITZERLAND_DB), naturalQueries, function (result) {
                            callback(null, result);
                        });
                    }
                ],
                function (err, results) {
                    results[0].forEach(function (element) {
                        console.log(element);
                        console.log(element.length > 0);
                    });

                    returnTag(UNKNOWN, callback);
                }
            );
        }
    );
}


function prepareMiddlePointDbStatements(statement, positions) {
    var statements = [];

    var statement1 = statement
        .replace('{lat1}', positions[0].latitude)
        .replace('{lon1}', positions[0].longitude)
        .replace('{lat2}', positions[1].latitude)
        .replace('{lon2}', positions[1].longitude);

    var statement2 = statement
        .replace('{lat1}', positions[1].latitude)
        .replace('{lon1}', positions[1].longitude)
        .replace('{lat2}', positions[2].latitude)
        .replace('{lon2}', positions[2].longitude);

    statements.push(statement1, statement2);
    return statements;
}

function prepareNaturalDbStatements(statement, points) {
    var queries = [];

    var query1 = statement.replace('{point}', 'POINT(8.7048 47.3611)');
    var query2 = statement.replace('{point}', points[0][1][0].st_astext);

    queries.push(query1, query2);
    return queries;
}


function returnTag(tags, callback) {

    var result = { download: { tag: tags, osm_tag: 'unknown' }, upload: { tag: tags, osm_tag: 'unknown2' } };
    callback(result);
    //callback({{ tag: tags, osm_tag: 'unknown' }, {tag: tags, osm_tag: 'test'}});
}

module.exports = { "getGeographicalSurroundings": getGeographicalSurroundings };