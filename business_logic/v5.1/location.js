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


function getLocation(typeOfMotion, positions, callback) {

    var locations = {
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

        //PEDESTRIAN
        case 2:
            check_RAILWAY_STREET_BUILDING(locations, positions, callback);
            break;

        //VEHICULAR
        case 3:
            check_RAILWAY_STREET(locations, positions, callback);
            break;

        //HIGH_SPEED_VEHICULAR
        case 4:
            check_RAILWAY(locations, positions, callback);
            break;

        default:
            //callback(error, location);
            callback(null, {
                id: UNKNOWN.id,
                name: UNKNOWN.name,
                description: UNKNOWN.description,
                weight: 0,
                allWeights: locations });
    }
}




function check_RAILWAY_STREET_BUILDING(locations, positions, callback) {

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
                dbAccess.queryMultiple(queries.OSM_NEAREST_PEDESTRIAN_WAYS, queryPositions, function (error, result) {
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

            locations = getStreetAndRailwayWeight(locations, positions, nearestWays);
            locations = getBuildingWeight(locations, positions, nearestBuildings);

            returnLocation(locations, callback);
        });
}

function check_RAILWAY_STREET(locations, positions, callback) {

    var queryPositions = queries.makePoints(positions);

    //Get all railways or streets within X meters for each of the 3 positions (returns max. 3)
    dbAccess.queryMultiple(queries.OSM_NEAREST_WAYS, queryPositions, function (error, nearestWays) {

        if(error) {
            callback(error);
            return;
        }

        locations = getStreetAndRailwayWeight(locations, positions, nearestWays);
        returnLocation(locations, callback);
    });
}

function check_RAILWAY(locations, positions, callback) {

    var queryPositions = queries.makePoints(positions);

    //Check if there is 1 railway-line within X meters for each of the 3 positions
    dbAccess.queryMultiple(queries.OSM_NEAREST_RAILWAYS, queryPositions, function (error, nearestRailways) {

        if(error) {
            callback(error);
            return;
        }

        locations = getRailwayWeight(locations, positions, nearestRailways);
        returnLocation(locations, callback);
    });
}




function getStreetAndRailwayWeight(locations, positions, nearestWays) {

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
            if (way.railway && railwayWeight === 0) {
                railwayWeight += positionsWeight[i];
            }
        });

        locations.street.weight += streetWeight;
        locations.railway.weight += railwayWeight;
    }

    return locations;
}

function getBuildingWeight(locations, positions, nearestBuildings) {

    //WLAN-Accuracy is between 20 and 30 Meters
    var wlanHorizontalAccuracyPositions = [];

    //The bigger the horizontalAccuracy (not accurate values), the smaller the positionsWeight
    var positionsWeight = getPositionWeight(positions);

    for(var i = 0; i < positions.length; i++) {

        if(positions[i].horizontalAccuracy >= 20 && positions[i].horizontalAccuracy <= 30) {
            wlanHorizontalAccuracyPositions.push(positions[i]);
        }

        //Check if a building was found nearby
        if(nearestBuildings[i].length) {
            locations.building.weight += positionsWeight[i];
        }
    }

    if(wlanHorizontalAccuracyPositions.length > 1) {
        locations.railway.weight *= 0.9;
        locations.street.weight *= 0.9;
    }

    return locations;
}

function getRailwayWeight(locations, positions, nearestRailways) {

    //The bigger the horizontalAccuracy (not accurate values), the smaller the positionsWeight
    var positionsWeight = getPositionWeight(positions);

    for(var i = 0; i < positions.length; i++) {

        //Check if a railway-line was found nearby
        if(nearestRailways[i].length) {
            locations.railway.weight += positionsWeight[i];
        }
    }

    return locations;
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




function returnLocation(locations, callback) {

    var maxLocation = UNKNOWN;
    var maxWeight = 0;

    for(var key in locations) {

        if (!locations.hasOwnProperty(key)) continue;

        var location = locations[key];
        if(location.weight > maxWeight) {
            maxLocation = location.location;
            maxWeight = location.weight;
        }

        location.weight = location.weight.toFixed(2);
        delete location.location;
    }

    //callback(error, location);
    callback(null, {
        id: maxLocation.id,
        name: maxLocation.name,
        description: maxLocation.description,
        weight: maxWeight.toFixed(2),
        allWeights: locations
    });
}


module.exports = {
    "getLocation": getLocation
};