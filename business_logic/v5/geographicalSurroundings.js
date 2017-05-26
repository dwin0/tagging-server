var db_access= require('../../persistence/db_access_v4');
var parallel = require("async/parallel");
var posHelper = require('./positionsHelper');
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
             boundary: POINT(8.55777 47.2495) -> protected_area
             natural: POINT(8.7048 47.3611) -> wetland
             leisure: POINT(8.55777 47.2495) -> nature_reserve
             landuse: POINT(8.6875 47.2157) -> forest

             multiple entries: POINT(8.73956 47.54351) -> natural: scrub / leisure: natural_reserve
             */
            var middlePoints = [
                {longitude: results[0][0].st_x, latitude: results[0][0].st_y},
                {longitude: results[1][0].st_x, latitude: results[1][0].st_y } ];

            queryPositions = posHelper.makePoints(middlePoints);
            var switzerlandDB = db_access.getDatabase(db_access.SWITZERLAND_DB);

            db_access.queryMultipleParameterized(switzerlandDB, queries.GEOGRAPHICAL_QUERY, queryPositions, function (result) {

                var downloadResult = result[0][0];
                var uploadResult = result[1][0];

                var resultObj = {
                    download: prepareResult(downloadResult),
                    upload: prepareResult(uploadResult)
                };

                callback(resultObj);
            });

        }
    );
}


function prepareResult(dbResult) {

    const DESCRIPTION = 'TODO';//TODO

    var prepared = {
        osm_key: UNKNOWN.osm_key,
        osm_value: UNKNOWN.osm_value,
        description: UNKNOWN.description,
        probability: null
    };

    for (var entry in dbResult) {

        if (dbResult.hasOwnProperty(entry) && dbResult[entry] !== null) {

            prepared.osm_key = entry;
            prepared.osm_value = dbResult[entry];
            prepared.description = DESCRIPTION;
        }
    }

    return prepared;
}


module.exports = {
    "getGeographicalSurroundings": getGeographicalSurroundings
};