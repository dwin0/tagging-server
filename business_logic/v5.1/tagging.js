var dbAccess = require('../../persistence/dbAccess_v5');
var queries = require('./dbQueries');
var parallel = require('async/parallel');


const RAILWAY = {
    id: 1,
    name: 'railway',
    description: 'Includes OpenStreetMap-Key: railway, Values: rail, light_rail, narrow_gauge, tram and subway.'
};

const STREET = {
    id: 2,
    name: 'street',
    description: 'Includes OpenStreetMap-Key: highway, Values: motorway, motorway_link, trunk, trunk_link, primary, ' +
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
            weight: 0,
            location: RAILWAY
        },
        street: {
            weight: 0,
            location: STREET
        },
        building: {
            weight: 0,
            location: BUILDING
        }
    };

    switch(typeOfMotion.id) {

        //STATIONARY
        case 1:
            check_RAILWAY_STREET_BUILDING(tags, positions, callback);
            break;

        //PEDESTRIAN
        case 2:
        //VEHICULAR
        case 3:
            check_RAILWAY_STREET(tags, positions, callback);
            break;

        //HIGH_SPEED_VEHICULAR
        case 4:
            check_RAILWAY(tags, positions, callback);
            break;

        default:
            //callback(error, tag);
            callback(null, { tag: UNKNOWN, weight: 0 });
    }
}




function check_RAILWAY_STREET_BUILDING(tags, positions, callback) {

    var queryPositions = queries.makePoints(positions);

    parallel([
            //Get the nearest building within X meters of each of the 3 positions
            function(callback) {
                dbAccess.queryMultiple(queries.SWITZERLAND_NEAREST_BUILDING, queryPositions, function (error, result) {
                        callback(error, result);
                });
            },
            //Get all railways or streets within X meters for each of the 3 positions (returns max. 3)
            function(callback) {
                dbAccess.queryMultiple(queries.OSM_NEAREST_WAYS, queryPositions, function (error, result) {
                        callback(error, result);
                });
            }
        ],
        function(err, results) {

            if(err) {
                callback(err);
                return;
            }

            var nearestBuildings = results[0];
            var nearestWays = results[1];

            tags = getEntryWeight(tags, positions, nearestBuildings, 'building');
            tags = getStreetAndRailwayWeight(tags, positions, nearestWays);

            returnTag(tags, callback);
        });
}

function check_RAILWAY_STREET(tags, positions, callback) {

    var queryPositions = queries.makePoints(positions);

    //Get all railways or streets within X meters for each of the 3 positions (returns max. 3)
    dbAccess.queryMultiple(queries.OSM_NEAREST_WAYS, queryPositions, function (error, nearestWays) {

        if(error) {
            callback(error);
            return;
        }

        tags = getStreetAndRailwayWeight(tags, positions, nearestWays);
        returnTag(tags, callback);
    });
}

function check_RAILWAY(tags, positions, callback) {

    var queryPositions = queries.makePoints(positions);

    //Check if there is 1 railway-line within X meters for each of the 3 positions
    dbAccess.queryMultiple(queries.OSM_NEAREST_RAILWAYS, queryPositions, function (error, nearestRailways) {

        if(error) {
            callback(error);
            return;
        }

        tags = getEntryWeight(tags, positions, nearestRailways, 'railway');
        returnTag(tags, callback);
    });
}




function getStreetAndRailwayWeight(tags, positions, nearestWays) {

    //The bigger the horizontalAccuracy (not accurate values), the smaller the positionsWeight
    var positionsWeight = getPositionWeight(positions);

    //check for each point, if a street or a railway is nearby
    for(var i = 0; i < positions.length; i++) {

        var streetWeight = 0;
        var railwayWeight = 0;

        //each of the 3 points can have at most 3 nearest ways (street or railway)
        //a single point can only indicate 1 street and/or 1 railway (prevent double-count)
        nearestWays[i].forEach(function (way) {

            if(way.highway && streetWeight === 0) {
                streetWeight += positionsWeight[i];
            }
            else if (way.railway && railwayWeight === 0) {
                railwayWeight += positionsWeight[i];
            }
        });

        tags.street.weight += streetWeight;
        tags.railway.weight += railwayWeight;
    }

    return tags;
}

function getEntryWeight(tags, positions, nearestEntries, tagName) {

    //The bigger the horizontalAccuracy (not accurate values), the smaller the positionsWeight
    var positionsWeight = getPositionWeight(positions);

    for(var i = 0; i < positions.length; i++) {

        //Check if db-entry was found nearby
        if(nearestEntries[i].length) {
            tags[tagName].weight += positionsWeight[i];
        }
    }

    return tags;
}

function getPositionWeight(positions) {

    var totalHorizontalAccuracy = 0;
    var denominator = 0;
    var weights = [];

    positions.forEach(function (pos) {
        totalHorizontalAccuracy += pos.horizontalAccuracy;
    });

    positions.forEach(function (pos) {
        denominator += totalHorizontalAccuracy / pos.horizontalAccuracy;
    });

    for(var i = 0; i < positions.length; i++) {
        weights[i] = totalHorizontalAccuracy / positions[i].horizontalAccuracy / denominator;
    }

    return weights;
}




function returnTag(tags, callback) {

    var maxLocation = UNKNOWN;
    var maxWeight = 0;

    for(var key in tags) {

        if (!tags.hasOwnProperty(key)) continue;

        var tag = tags[key];
        if(tag.weight > maxWeight) {
            maxLocation = tag.location;
            maxWeight = tag.weight;
        }

        delete tag.location;
    }

    //callback(error, tag);
    callback(null, {
        id: maxLocation.id,
        name: maxLocation.name,
        description: maxLocation.description,
        weight: maxWeight,
        allWeights: tags
    });
}


module.exports = {
    "getTag": getTag
};