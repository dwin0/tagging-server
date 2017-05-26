var db = require('../../persistence/db_access_v4');
var posHelper = require('./positionsHelper');
var queries = require('./dbQueries');
var parallel = require('async/parallel');


const RAILWAY = {
    id: 1,
    name: 'railway',
    description: 'Includes OpenStreetMap-Key:railway, Values: rail, light_rail, narrow_gauge, tram and subway.'
};

const STREET = {
    id: 2,
    name: 'street',
    description: 'Includes OpenStreetMap-Key:highway, Values: motorway, motorway_link, trunk, trunk_link, primary, ' +
    'primary_link, secondary, secondary_link, tertiary, tertiary_link, residential, road, unclassified, service, ' +
    'living_street and track.'
};

const BUILDING = {
    id: 3,
    name: 'building',
    description: 'Includes positions in or on top of a building.'
};

const UNKNOWN = {
    id: -1,
    name: 'unknown',
    description: 'No tagging possible.'
};


function getTag(typeOfMotion, positions, callback) {

    var tags = {
        railway: {
            probability: 0,
            location: RAILWAY
        },
        street: {
            probability: 0,
            location: STREET
        },
        building: {
            probability: 0,
            location: BUILDING
        }
    };

    switch(typeOfMotion.id) {

        //STATIONARY
        case 1:
        //PEDESTRIAN
        case 2:
            check_RAILWAY_STREET_BUILDING(tags, positions, callback);
            break;

        //VEHICULAR
        case 3:
            check_RAILWAY_STREET(tags, positions, callback);
            break;

        //HIGH_SPEED_VEHICULAR
        case 4:
            checkIf_RAILWAY(tags, positions, callback);
            break;

        default:
            callback({ tag: UNKNOWN, probability: null });
    }
}





function check_RAILWAY_STREET_BUILDING(tags, positions, callback) {

    var switzerlandDB = db.getDatabase(db.SWITZERLAND_DB);
    var streetDB = db.getDatabase(db.STREETS_DB);
    var queryPositions = posHelper.makePoints(positions);

    parallel([
            //Get the nearest building within X meters of each of the 3 positions
            function(callback) {
                db.queryMultipleParameterized(switzerlandDB, queries.SWITZERLAND_NEAREST_BUILDING, queryPositions, function (result) {
                        callback(null, result);
                });
            },
            //Get all railways or streets within X meters for each of the 3 positions
            function(callback) {
                db.queryMultipleParameterized(streetDB, queries.OSM_NEAREST_WAYS, queryPositions, function (result) {
                        callback(null, result);
                });
            }
        ],
        function(err, results) {

            var nearestBuildings = results[0];
            var nearestWays = results[1];

            tags = getBuildingProbability(tags, positions, nearestBuildings);
            tags = getStreetAndRailwayProbability(tags, positions, nearestWays);

            returnTag(tags, callback);
        });
}

function check_RAILWAY_STREET(tags, positions, callback) {

    var database = db.getDatabase(db.STREETS_DB);
    var queryPositions = posHelper.makePoints(positions);

    //Get all railways or streets within X meters for each of the 3 positions
    db.queryMultipleParameterized(database, queries.OSM_NEAREST_WAYS, queryPositions, function (result) {

        var nearestWays = result;
        tags = getStreetAndRailwayProbability(tags, positions, nearestWays);
        returnTag(tags, callback);
    });
}

function checkIf_RAILWAY(tags, positions, callback) {

    var database = db.getDatabase(db.STREETS_DB);
    var queryPositions = posHelper.makePoints(positions);

    //Get all railways or streets within X meters for each of the 3 positions
    db.queryMultipleParameterized(database, queries.OSM_NEAREST_RAILWAYS, queryPositions, function (result) {
        var nearestRailways = result;
        tags = getRailwayProbability(tags, positions, nearestRailways);
        returnTag(tags, callback);
    });
}





function getBuildingProbability(tags, positions, nearestBuildings) {

    //The bigger the horizontal_accuracy (not accurate values), the smaller the positionsWeight
    var positionsWeight = getPositionWeight(positions);

    for(var i = 0; i < positions.length; i++) {

        //Check if building was found nearby
        if(nearestBuildings[i].length) {
            tags.building.probability += positionsWeight[i];
        }
    }

    return tags;
}

function getStreetAndRailwayProbability(tags, positions, nearestWays) {

    //The bigger the horizontal_accuracy (not accurate values), the smaller the positionsWeight
    var positionsWeight = getPositionWeight(positions);

    //check for each point, if a street or a railway is nearby
    for(var i = 0; i < positions.length; i++) {

        var streetWeight = 0;
        var railwayWeight = 0;

        //each of the 3 points can have at most 3 nearest ways (street or railway)
        //a single point can only indicate 1 street and/or 1 railway (prevent double-count)
        nearestWays[i].forEach(function (way) {

            var wayType = clazzToWayType(way.clazz);

            if(wayType === STREET && streetWeight === 0) {
                streetWeight += positionsWeight[i];
            }
            else if (wayType === RAILWAY && railwayWeight === 0) {
                railwayWeight += positionsWeight[i];
            }
        });

        tags.street.probability += streetWeight;
        tags.railway.probability += railwayWeight;
    }

    return tags;
}

function getRailwayProbability(tags, positions, nearestWays) {

    //The bigger the horizontal_accuracy (not accurate values), the smaller the positionsWeight
    var positionsWeight = getPositionWeight(positions);

    for(var i = 0; i < positions.length; i++) {

        //Check if railway was found nearby
        if(nearestWays[i].length) {
            tags.railway.probability += positionsWeight[i];
        }
    }

    return tags;
}

function getPositionWeight(positions) {

    var totalHorizontalAccuracy = 0;
    var denominator = 0;
    var weights = [];

    positions.forEach(function (pos) {
        totalHorizontalAccuracy += pos.horizontal_accuracy;
    });

    positions.forEach(function (pos) {
        denominator += totalHorizontalAccuracy / pos.horizontal_accuracy;
    });

    for(var i = 0; i < positions.length; i++) {
        weights[i] = totalHorizontalAccuracy / denominator / positions[i].horizontal_accuracy;
    }

    return weights;
}





function clazzToWayType(clazz) {

    return (clazz > 0 && clazz < 17) ?  STREET : RAILWAY;
}

function returnTag(tags, callback) {

    var maxLocation = UNKNOWN;
    var maxProbability = 0;

    for(var key in tags) {

        if (!tags.hasOwnProperty(key)) continue;

        var tag = tags[key];
        if(tag.probability > maxProbability) {
            maxLocation = tag.location;
            maxProbability = tag.probability;
        }

        delete tag.location;
    }

    callback({
        id: maxLocation.id,
        name: maxLocation.name,
        description: maxLocation.description,
        probability: maxProbability,
        allProbabilities: tags
    });
}


module.exports = {
    "getTag": getTag
};