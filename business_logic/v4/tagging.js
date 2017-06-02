var dbAccess = require('../../persistence/db_access_v4');
var posHelper = require('./positionsHelper');
var queries = require('./dbQueries');
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

const UNKNOWN = {
    id: -1,
    name: "unknown",
    description: "No tagging possible."
};


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

    var switzerlandDB = dbAccess.getDatabase(dbAccess.SWITZERLAND_DB);
    var streetDB = dbAccess.getDatabase(dbAccess.STREETS_DB);
    var queryPositions = posHelper.makePoints(positions);

    parallel([
            //Get the nearest building within 15 meters of each of the 3 positions
            function(callback) {
                dbAccess.queryMultipleParameterized(switzerlandDB, queries.SWITZERLAND_NEAREST_BUILDING, queryPositions, function (result) {
                        callback(null, result);
                });
            },
            //Get all railways or streets within 10 meters for each of the 3 positions
            function(callback) {
                dbAccess.queryMultipleParameterized(streetDB, queries.OSM_NEAREST_WAYS, queryPositions, function (result) {
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

function calculate_RAILWAY_STREET(tags, positions, callback) {

    var database = dbAccess.getDatabase(dbAccess.STREETS_DB);
    var queryPositions = posHelper.makePoints(positions);

    parallel([
            //Get all railways or streets within 10 meters for each of the 3 positions
            function(callback) {
                dbAccess.queryMultipleParameterized(database, queries.OSM_NEAREST_WAYS, queryPositions, function (result) {
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

    var database = dbAccess.getDatabase(dbAccess.STREETS_DB);
    var queryPositions = posHelper.makePoints(positions);

    parallel([
            //Get all railways or streets within 10 meters for each of the 3 positions
            function(callback) {
                dbAccess.queryMultipleParameterized(database, queries.OSM_NEAREST_RAILWAYS, queryPositions, function (result) {
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
        totalAccuracy += pos.horizontalAccuracy;
    });

    for(var i = 0; i < NUMBER_OF_POINTS; i++) {

        //Check if building was found nearby
        if(nearestBuildings[i].length) {

            //The bigger the horizontalAccuracy (not accurate values), the smaller the pointProbability
            var pointProbability = 1 - (positions[i].horizontalAccuracy / totalAccuracy);
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
        totalAccuracy += pos.horizontalAccuracy;
    });

    //check each point, if a street or a railway is nearby
    for (var i = 0; i < nearestWays.length; i++){

        var amountOfStreets = 0;
        var amountOfRailways = 0;

        //The bigger the horizontalAccuracy (not accurate values), the smaller the pointProbability
        var pointProbability = 1 - (positions[i].horizontalAccuracy / totalAccuracy);

        //iterate through the nearest ways of 1 point
        for (var j = 0; j < nearestWays[i].length; j++){

            if(nearestWays[i][j].highway && amountOfStreets === 0) {
                amountOfStreets += pointProbability;
            }
            else if (nearestWays[i][j].railway && amountOfRailways === 0) {
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
        totalAccuracy += pos.horizontalAccuracy;
    });

    for(var i = 0; i < NUMBER_OF_POINTS; i++) {

        //Check if railway was found nearby
        if(nearestWays[i].length) {

            //The bigger the horizontalAccuracy (not accurate values), the smaller the pointProbability
            var pointProbability = 1 - (positions[i].horizontalAccuracy / totalAccuracy);
            totalAmountOfRailways += pointProbability;
        }
    }

    //NUMBER_OF_POINTS - 1: For 3 Input-Points, the maximum totalAccuracy is 2
    tags.railway.probability += totalAmountOfRailways / (NUMBER_OF_POINTS - 1);

    return tags;
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