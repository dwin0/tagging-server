var db_access= require('../../persistence/dbAccess_v5');
var posHelper = require('./positionsHelper');
var queries = require('./dbQueries');


const UNKNOWN = {
    osm_key: 'unknown',
    osm_value: 'unknown',
    description: 'No tagging possible.'
};


function getGeographicalSurroundings(positions, callback) {

    var database = db_access.getDatabase(db_access.SWITZERLAND_DB);
    var queryPositions = posHelper.makeMultipoints(positions);

    db_access.queryMultipleParameterized(database, queries.FIND_MIDDLE_POINT, queryPositions, function (error, result) {

        if(error) {
            callback(error);
            return;
        }

        /*DEMO-Points
         boundary: POINT(8.55777 47.2495) -> protected_area
         natural: POINT(8.7048 47.3611) -> wetland
         leisure: POINT(8.55777 47.2495) -> nature_reserve
         landuse: POINT(8.6875 47.2157) -> forest
         multiple entries: POINT(8.73956 47.54351) -> natural: scrub / leisure: natural_reserve
         */
        var middlePoints = [
            {longitude: result[0][0].st_x, latitude: result[0][0].st_y},
            {longitude: result[1][0].st_x, latitude: result[1][0].st_y } ];

        queryPositions = posHelper.makePoints(middlePoints);
        var switzerlandDB = db_access.getDatabase(db_access.SWITZERLAND_DB);

        db_access.queryMultipleParameterized(switzerlandDB, queries.GEOGRAPHICAL_QUERY, queryPositions, function (error, result) {

            if(error) {
                callback(error);
                return;
            }

            var downloadResult = result[0][0];
            var uploadResult = result[1][0];

            var resultObj = {
                download: prepareResult(downloadResult),
                upload: prepareResult(uploadResult)
            };

            callback(null, resultObj);
        });
    });
}

function prepareResult(dbResult) {

    const DESCRIPTION = 'TODO';

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