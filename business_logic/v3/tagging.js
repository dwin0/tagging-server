var dbAccess = require('../../persistence/db_access_v3');
var helper = require('./helper');
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




const SWITZERLAND_NEAREST_BUILDING_IN_15M = 'WITH closest_candidates AS (' +
    'SELECT * FROM public.multipolygons WHERE building IS NOT NULL ' +
    'ORDER BY multipolygons.wkb_geometry <-> ST_GeomFromText(\'POINT({lon} {lat})\', 4326) ' +
    'ASC LIMIT 10) ' +
    'SELECT osm_way_id, name, building, ST_Distance(wkb_geometry::geography, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)::geography) ' +
    'FROM closest_candidates ' +
    'WHERE ST_Distance(wkb_geometry::geography, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)::geography) < 15 ' +
    'LIMIT 1;';


const OSM_NEAREST_WAYS_IN_10M = 'WITH closest_candidates AS (' +
    'SELECT id, osm_id, osm_name, clazz, geom_way FROM switzerland ' +
    'ORDER BY geom_way <-> ST_GeomFromText(\'POINT({lon} {lat})\', 4326) LIMIT 100) ' +
    'SELECT id, osm_id, osm_name, clazz, ST_Distance(geom_way::geography, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)::geography) ' +
    'FROM closest_candidates ' +
    'WHERE ST_Distance(geom_way::geography, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)::geography) < 10 ' +
    'ORDER BY ST_Distance(geom_way, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)) ' +
    'LIMIT 3;';


const OSM_NEAREST_RAILWAYS_IN_10M = 'WITH closest_candidates AS (' +
    'SELECT id, osm_id, osm_name, clazz, geom_way FROM switzerland ' +
    'WHERE clazz >= 50' +
    'ORDER BY geom_way <-> ST_GeomFromText(\'POINT({lon} {lat})\', 4326) LIMIT 100) ' +
    'SELECT id, osm_id, osm_name, clazz, ST_Distance(geom_way::geography, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)::geography) ' +
    'FROM closest_candidates ' +
    'WHERE ST_Distance(geom_way::geography, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)::geography) < 10 ' +
    'ORDER BY ST_Distance(geom_way, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)) ' +
    'LIMIT 1;';




function getTag(velocity_kmh, positions, callback) {

    //STATIONARY or PEDESTRIAN
    if(velocity_kmh >= 0 && velocity_kmh < 10) {
        calculate_RAILWAY_STREET_BUILDING(positions, callback);
    }
    //VEHICULAR
    else if(velocity_kmh <= 120) {
        calculate_RAILWAY_STREET(positions, callback);
    }
    //HIGH_SPEED_VEHICULAR
    else if(velocity_kmh <= 350) {
        checkIf_RAILWAY(positions, callback);
    }
    else {
        callback({ tag: UNKNOWN, probability: null });
    }
}



function calculate_RAILWAY_STREET_BUILDING(positions, callback) {

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

    var nearestBuildingStatements = helper.getDBStatements(SWITZERLAND_NEAREST_BUILDING_IN_15M, positions);
    var nearestWaysStatements = helper.getDBStatements(OSM_NEAREST_WAYS_IN_10M, positions);

    parallel([
            //Get the nearest building within 15 meters of each of the 3 positions
            function(callback) {
                dbAccess.queryMultiple(dbAccess.getDatabase(dbAccess.SWITZERLAND_DB), nearestBuildingStatements, function (result) {
                    callback(null, result);
                });
            },
            //Get all railways or streets within 10 meters for each of the 3 positions
            function(callback) {
                dbAccess.queryMultiple(dbAccess.getDatabase(dbAccess.STREETS_DB), nearestWaysStatements, function (result) {
                    callback(null, result);
                });
            }
        ],
        function(err, results) {

            var nearestBuildings = results[0];
            var nearestWays = results[1];

            tags = getBuildingProbability(tags, nearestBuildings);
            tags = getStreetAndRailwayProbability(tags, nearestWays);

            returnTag(tags, callback);
        });
}

function calculate_RAILWAY_STREET(positions, callback) {

    var tags = {
        railway: {
            probability: 0.0,
            location: RAILWAY
        },
        street: {
            probability: 0.0,
            location: STREET
        }
    };

    var nearestWaysStatements = helper.getDBStatements(OSM_NEAREST_WAYS_IN_10M, positions);

    parallel([
            //Get all railways or streets within 10 meters for each of the 3 positions
            function(callback) {
                dbAccess.queryMultiple(dbAccess.getDatabase(dbAccess.STREETS_DB), nearestWaysStatements, function (result) {
                    callback(null, result);
                });
            }
        ],
        function(err, results) {

            var nearestWays = results[0];
            tags = getStreetAndRailwayProbability(tags, nearestWays);
            returnTag(tags, callback);
        });
}

function checkIf_RAILWAY(positions, callback) {

    var tags = {
        railway: {
            probability: 0.0,
            location: RAILWAY
        }
    };

    var nearestRailwaysStatements = helper.getDBStatements(OSM_NEAREST_RAILWAYS_IN_10M, positions);

    parallel([
            //Get all railways or streets within 10 meters for each of the 3 positions
            function(callback) {
                dbAccess.queryMultiple(dbAccess.getDatabase(dbAccess.STREETS_DB), nearestRailwaysStatements, function (result) {
                    callback(null, result);
                });
            }
        ],
        function(err, results) {

            var nearestRailways = results[0];
            tags = getRailwayProbability(tags, nearestRailways);
            returnTag(tags, callback);
        });
}





function getBuildingProbability(tags, nearestBuildings) {

    const NUMBER_OF_POINTS = 3;
    var closeBuildingCount = 0;

    nearestBuildings.forEach(function (building) {
        if(building.length > 0) {
            closeBuildingCount++;
        }
    });

    tags.building.probability += closeBuildingCount / NUMBER_OF_POINTS;

    return tags;
}

function getStreetAndRailwayProbability(tags, nearestWays) {

    //each of the 3 points can have at most 3 nearest ways (street or railway)
    const NUMBER_OF_POINTS = 3;
    var totalAmountOfStreets = 0;
    var totalAmountOfRailways = 0;

    //check each point, if a street or a railway is nearby
    for (var i = 0; i < nearestWays.length; i++){

        var amountOfStreets = 0;
        var amountOfRailways = 0;

        //iterate through the nearest ways of 1 point
        for (var j = 0; j < nearestWays[i].length; j++){

            var wayType = clazzToWayType([nearestWays[i][j].clazz]);
            if(wayType === STREET) {
                if(amountOfStreets === 0) {
                    amountOfStreets++;
                }
            }
            else if (wayType === RAILWAY) {
                if(amountOfRailways === 0) {
                    amountOfRailways++;
                }
            }
        }

        totalAmountOfStreets += amountOfStreets;
        totalAmountOfRailways += amountOfRailways;
    }

    tags.street.probability += totalAmountOfStreets / NUMBER_OF_POINTS;
    tags.railway.probability += totalAmountOfRailways / NUMBER_OF_POINTS;

    return tags;
}

function getRailwayProbability(tags, nearestWays) {

    const NUMBER_OF_POINTS = 3;
    var totalAmountOfRailways = 0;

    nearestWays.forEach(function (way) {
        if(way.length > 0) {
            totalAmountOfRailways++;
        }
    });

    tags.railway.probability += totalAmountOfRailways / NUMBER_OF_POINTS;

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