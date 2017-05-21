var db_access= require('../../persistence/db_access_v4');
var parallel = require("async/parallel");
var posHelper = require('./positionsHelper');
var jsonHelper = require('./jsonHelper');
var queries = require('./dbQueries');


const UNKNOWN = {
    id: -1,
    name: "unknown",
    osm_key: 'unknown',
    osm_value: 'unknown',
    description: "No tagging possible."
};


function getGeographicalSurroundings(positions, callback) {

    var database = db_access.getDatabase(db_access.SWITZERLAND_DB);
    var queryPositions = posHelper.makeMultipoints(positions);

    parallel([
            function(callback) {
                db_access.queryMultipleParameterized(database, queries.FIND_MIDDLE_POINT, queryPositions, function (result) {
                    callback(null, result);
                });
            }
        ],
        function (err, results) {

            //Get results from first (and only) query
            results = results[0];

            /*DEMO-Points
             natural: POINT(8.7048 47.3611) -> wetland
             boundary: POINT(8.55777 47.2495) -> protected_area
             leisure: POINT(8.55777 47.2495) -> nature_reserve
             landuse: POINT(8.6875 47.2157) -> forest
             */
            var middlePoints = [
                {longitude: results[0][0].st_x, latitude: results[0][0].st_y},
                {longitude: 8.6875, latitude: 47.2157} ];


            queryPositions = posHelper.makePoints(middlePoints);
            var switzerlandDB = db_access.getDatabase(db_access.SWITZERLAND_DB);

            parallel([
                    function(callback) {
                        db_access.queryMultipleParameterized(switzerlandDB, queries.BOUNDARY_QUERY, queryPositions, function (result) {

                            //TODO: description, ev. up/down unterschiedlich
                            var resultObj = prepareResult(result, 'boundary', null);
                            callback(null, resultObj);
                        });
                    },
                    function(callback) {
                        db_access.queryMultipleParameterized(switzerlandDB, queries.NATURAL_QUERY, queryPositions, function (result) {

                            //TODO: description
                            var resultObj = prepareResult(result, 'natural', null);
                            callback(null, resultObj);
                        });
                    },
                    function(callback) {
                        db_access.queryMultipleParameterized(switzerlandDB, queries.LEISURE_QUERY, queryPositions, function (result) {

                            //TODO: description
                            var resultObj = prepareResult(result, 'leisure', null);
                            callback(null, resultObj);
                        });
                    },
                    function(callback) {
                        db_access.queryMultipleParameterized(switzerlandDB, queries.LANDUSE_QUERY, queryPositions, function (result) {

                            //TODO: description
                            var resultObj = prepareResult(result, 'landuse', null);
                            callback(null, resultObj);
                        });
                    }

                ],
                function (err, results) {

                    var resultObj = findMostSpecific(results);
                    callback(jsonHelper.prepareSurroundingsDownUp(resultObj));
                }
            );
        }
    );
}

function prepareResult(result, osmKey, description) {

    //TODO: check if multiple results
    var resultObj = {
        down: {
            empty: true,
            osm_key: osmKey,
            osm_value: null,
            description: description
        },
        up: {
            empty: true,
            osm_key: osmKey,
            osm_value: null,
            description: description
        }
    };

    if(result[0].length) {
        resultObj.down.empty = false;
        resultObj.down.osm_value = result[0][0][osmKey];
    }

    if(result[1].length) {
        resultObj.up.empty = false;
        resultObj.up.osm_value = result[1][0][osmKey];
    }

    return resultObj;
}

function findMostSpecific(results) {

    var resultObj = {
        down: {
            empty: true,
            osm_key: UNKNOWN.osm_key,
            osm_value: UNKNOWN.osm_value,
            description: UNKNOWN.description
        },
        up: {
            empty: true,
            osm_key: UNKNOWN.osm_key,
            osm_value: UNKNOWN.osm_value,
            description: UNKNOWN.description
        }
    };

    for(var i = 0; i < results.length; i++) {

        if(!results[i].down.empty) {
            resultObj.down = results[i].down;
        }

        if(!results[i].up.empty) {
            resultObj.up = results[i].up;
        }
    }

    return resultObj;
}



module.exports = { "getGeographicalSurroundings": getGeographicalSurroundings };