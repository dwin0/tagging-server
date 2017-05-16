var db = require('../../persistence/db_access_v4');
var posHelper = require('./positionsHelper');
var parallel = require("async/parallel");


const RAILWAY = {
    id: 1,
    name: "railway",
    description: "Includes OpenStreetMap-Key:railway, Values: rail, light_rail, narrow_gauge, tram and subway."
};

const STREET = {
    id: 2,
    name: "street",
    description: "Includes OpenStreetMap-Key:highway, Values: motorway, motorway_link, trunk, trunk_link, primary, " +
    "primary_link, secondary, secondary_link, tertiary, tertiary_link, residential, road, unclassified, service, " +
    "living_street and track."
};

const BUILDING = {
    id: 3,
    name: "building",
    description: "Includes positions in or on top of a building."
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




//TODO: Make Limits in meters variable
const SWITZERLAND_NEAREST_BUILDING_IN_15M = 'WITH closest_candidates AS (' +
    'SELECT * FROM public.multipolygons WHERE building IS NOT NULL ' +
    'ORDER BY multipolygons.wkb_geometry <-> ST_GeomFromText($1, 4326) ' +
    'ASC LIMIT 10) ' +
    'SELECT osm_way_id, name, building, ST_Distance(wkb_geometry::geography, ST_GeomFromText($1, 4326)::geography) ' +
    'FROM closest_candidates ' +
    'WHERE ST_Distance(wkb_geometry::geography, ST_GeomFromText($1, 4326)::geography) < 15 ' +
    'LIMIT 1;';

const OSM_NEAREST_WAYS_IN_10M = 'WITH closest_candidates AS (' +
    'SELECT id, osm_id, osm_name, clazz, geom_way FROM switzerland ' +
    'ORDER BY geom_way <-> ST_GeomFromText($1, 4326) LIMIT 100) ' +
    'SELECT id, osm_id, osm_name, clazz, ST_Distance(geom_way::geography, ST_GeomFromText($1, 4326)::geography) ' +
    'FROM closest_candidates ' +
    'WHERE ST_Distance(geom_way::geography, ST_GeomFromText($1, 4326)::geography) < 10 ' +
    'ORDER BY ST_Distance(geom_way, ST_GeomFromText($1, 4326)) ' +
    'LIMIT 3;';

const OSM_NEAREST_RAILWAYS_IN_10M = 'WITH closest_candidates AS (' +
    'SELECT id, osm_id, osm_name, clazz, geom_way FROM switzerland ' +
    'WHERE clazz >= 50' +
    'ORDER BY geom_way <-> ST_GeomFromText($1, 4326) LIMIT 100) ' +
    'SELECT id, osm_id, osm_name, clazz, ST_Distance(geom_way::geography, ST_GeomFromText($1, 4326)::geography) ' +
    'FROM closest_candidates ' +
    'WHERE ST_Distance(geom_way::geography, ST_GeomFromText($1, 4326)::geography) < 10 ' +
    'ORDER BY ST_Distance(geom_way, ST_GeomFromText($1, 4326)) ' +
    'LIMIT 1;';




function getTag(velocity_kmh, positions, callback) {

    var tags = {
        railway: {
            probability: 0.0,
            location: RAILWAY
        },
        street: {
            probability: 0.0,
            location: STREET
        },
        building: {
            probability: 0.0,
            location: BUILDING
        }
    };

    //STATIONARY or PEDESTRIAN
    if(velocity_kmh >= 0 && velocity_kmh < 10) {
        calculate_RAILWAY_STREET_BUILDING(tags, positions, callback);
    }
    //VEHICULAR
    else if(velocity_kmh <= 120) {
        calculate_RAILWAY_STREET(tags, positions, callback);
    }
    //HIGH_SPEED_VEHICULAR
    else if(velocity_kmh <= 350) {
        checkIf_RAILWAY(tags, positions, callback);
    }
    else {
        callback({ tag: UNKNOWN, probability: null });
    }
}



function calculate_RAILWAY_STREET_BUILDING(tags, positions, callback) {

    var switzerlandDB = db.getDatabase(db.SWITZERLAND_DB);
    var streetDB = db.getDatabase(db.STREETS_DB);
    var queryPositions = posHelper.makePoints(positions);

    parallel([
            //Get the nearest building within 15 meters of each of the 3 positions
            function(callback) {
                db.queryMultipleParameterized(switzerlandDB, SWITZERLAND_NEAREST_BUILDING_IN_15M, queryPositions, function (result) {
                        callback(null, result);
                });
            },
            //Get all railways or streets within 10 meters for each of the 3 positions
            function(callback) {
                db.queryMultipleParameterized(streetDB, OSM_NEAREST_WAYS_IN_10M, queryPositions, function (result) {
                        callback(null, result);
                });
            }
        ],
        function(err, results) {

            //TODO: Check if this 3 buildings are the same
            var nearestBuildings = results[0];
            var nearestWays = results[1];

            tags = getBuildingProbability(tags, positions, nearestBuildings);
            tags = getStreetAndRailwayProbability(tags, positions, nearestWays);

            returnTag(tags, callback);
        });
}

function calculate_RAILWAY_STREET(tags, positions, callback) {

    var database = db.getDatabase(db.STREETS_DB);
    var queryPositions = posHelper.makePoints(positions);

    parallel([
            //Get all railways or streets within 10 meters for each of the 3 positions
            function(callback) {
                db.queryMultipleParameterized(database, OSM_NEAREST_WAYS_IN_10M, queryPositions, function (result) {
                        callback(null, result);
                });
            }
        ],
        function(err, results) {

            var nearestWays = results[0];
            tags = getStreetAndRailwayProbability(tags, positions, nearestWays);
            returnTag(tags, callback);
        });
}

function checkIf_RAILWAY(tags, positions, callback) {

    var database = db.getDatabase(db.STREETS_DB);
    var queryPositions = posHelper.makePoints(positions);

    parallel([
            //Get all railways or streets within 10 meters for each of the 3 positions
            function(callback) {
                db.queryMultipleParameterized(database, OSM_NEAREST_RAILWAYS_IN_10M, queryPositions, function (result) {
                        callback(null, result);
                });
            }
        ],
        function(err, results) {

            var nearestRailways = results[0];
            tags = getRailwayProbability(tags, positions, nearestRailways);
            returnTag(tags, callback);
        });
}



function getBuildingProbability(tags, positions, nearestBuildings) {

    const NUMBER_OF_POINTS = 3;
    var closeBuildingCount = 0;
    var totalAccuracy = 0;

    positions.forEach(function (pos) {
        totalAccuracy += pos.horizontal_accuracy;
    });

    for(var i = 0; i < NUMBER_OF_POINTS; i++) {

        //Check if building was found nearby
        if(nearestBuildings[i].length) {

            //The bigger the horizontal_accuracy (not accurate values), the smaller the pointProbability
            var pointProbability = 1 - (positions[i].horizontal_accuracy / totalAccuracy);
            closeBuildingCount += pointProbability;
        }
    }

    //NUMBER_OF_POINTS - 1: For 3 Input-Points, the maximum totalAccuracy is 2
    tags.building.probability += closeBuildingCount / (NUMBER_OF_POINTS - 1);

    return tags;
}

function getStreetAndRailwayProbability(tags, positions, nearestWays) {

    //each of the 3 points can have at most 3 nearest ways (street or railway)
    const NUMBER_OF_POINTS = 3;
    var totalAmountOfStreets = 0;
    var totalAmountOfRailways = 0;
    var totalAccuracy = 0;

    positions.forEach(function (pos) {
        totalAccuracy += pos.horizontal_accuracy;
    });

    //check each point, if a street or a railway is nearby
    for (var i = 0; i < nearestWays.length; i++){

        var amountOfStreets = 0;
        var amountOfRailways = 0;

        //The bigger the horizontal_accuracy (not accurate values), the smaller the pointProbability
        var pointProbability = 1 - (positions[i].horizontal_accuracy / totalAccuracy);

        //iterate through the nearest ways of 1 point
        for (var j = 0; j < nearestWays[i].length; j++){

            var wayType = clazzToWayType([nearestWays[i][j].clazz]);

            if(wayType === STREET && amountOfStreets === 0) {
                amountOfStreets += pointProbability;
            }
            else if (wayType === RAILWAY && amountOfRailways === 0) {
                amountOfRailways += pointProbability;
            }
        }

        totalAmountOfStreets += amountOfStreets;
        totalAmountOfRailways += amountOfRailways;
    }

    //NUMBER_OF_POINTS - 1: For 3 Input-Points, the maximum totalAccuracy is 2
    tags.street.probability += totalAmountOfStreets / (NUMBER_OF_POINTS - 1);
    tags.railway.probability += totalAmountOfRailways / (NUMBER_OF_POINTS - 1);

    return tags;
}

function getRailwayProbability(tags, positions, nearestWays) {

    const NUMBER_OF_POINTS = 3;
    var totalAmountOfRailways = 0;
    var totalAccuracy = 0;

    positions.forEach(function (pos) {
        totalAccuracy += pos.horizontal_accuracy;
    });

    for(var i = 0; i < NUMBER_OF_POINTS; i++) {

        //Check if railway was found nearby
        if(nearestWays[i].length) {

            //The bigger the horizontal_accuracy (not accurate values), the smaller the pointProbability
            var pointProbability = 1 - (positions[i].horizontal_accuracy / totalAccuracy);
            totalAmountOfRailways += pointProbability;
        }
    }

    //NUMBER_OF_POINTS - 1: For 3 Input-Points, the maximum totalAccuracy is 2
    tags.railway.probability += totalAmountOfRailways / (NUMBER_OF_POINTS - 1);

    return tags;
}





function clazzToWayType(clazz) {

    return (clazz > 0 && clazz < 17) ?  STREET : RAILWAY;
}

function returnTag(tags, callback) {

    var maxLocation = UNKNOWN;
    var maxProbability = 0.0;

    for(var key in tags) {

        if (!tags.hasOwnProperty(key)) continue;

        var tag = tags[key];
        if(tag.probability > maxProbability) {
            maxLocation = tag.location;
            maxProbability = tag.probability;
        }
    }

    callback({ tag: maxLocation, probability: maxProbability, allProbabilities: tags });
}



module.exports = { "getTag": getTag };