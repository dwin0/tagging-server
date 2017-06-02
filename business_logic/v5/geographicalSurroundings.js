var dbAccess= require('../../persistence/dbAccess_v5');
var queries = require('./dbQueries');


const UNKNOWN = {
    osmKey: 'unknown',
    osmValue: 'unknown',
    description: 'No tagging possible.'
};


function getGeographicalSurroundings(positions, callback) {

    var queryPositions = queries.makeMultipoints(positions);

    dbAccess.queryMultiple(queries.FIND_MIDDLE_POINT, queryPositions, function (error, result) {

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

        queryPositions = [result[0][0].st_astext, result[1][0].st_astext];

        dbAccess.queryMultiple(queries.GEOGRAPHICAL_QUERY, queryPositions, function (error, result) {

            if(error) {
                callback(error);
                return;
            }

            var downloadResult = [];
            var uploadResult = [];

            if(result[0].length) {
                downloadResult = result[0][0];
            }

            if(result[1].length) {
                uploadResult = result[1][0];
            }

            var resultObj = {
                download: prepareResult(downloadResult),
                upload: prepareResult(uploadResult)
            };

            callback(null, resultObj);
        });
    });
}

function prepareResult(dbResult) {

    const DESCRIPTION = 'Tag comes from: OpenStreetMap';

    var prepared = {
        osmKey: UNKNOWN.osmKey,
        osmValue: UNKNOWN.osmValue,
        description: UNKNOWN.description
    };

    for (var entry in dbResult) {

        if (dbResult.hasOwnProperty(entry) && dbResult[entry] !== null) {

            prepared.osmKey = entry;
            prepared.osmValue = dbResult[entry];
            prepared.description = DESCRIPTION;
        }
    }

    return prepared;
}


module.exports = {
    "getGeographicalSurroundings": getGeographicalSurroundings
};