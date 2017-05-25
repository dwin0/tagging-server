var db_access= require('../../persistence/db_access_v4');
var queries = require('./dbQueries');


/**
 * Filters the 8 input-positions for the 3 bests.
 * Positions 1-3, 4-5 and 6-8 are close to each other. This methods chooses the best position out of each group.
 *
 * @param positions
 * @param res
 */
function choosePositions(positions, res) {

    if(typeof positions === 'string') {
        positions = JSON.parse(positions);
    }

    positions.sort(function (p1, p2) {
        return new Date(p1.time).getTime() - new Date(p2.time).getTime();
    });

    var beforeDownload = chooseForPhase([positions[0], positions[1], positions[2]], res, chooseBeforeDownload);
    var beforeUpload = chooseForPhase([positions[3], positions[4]], res, chooseBeforeUpload);
    var afterUpload = chooseForPhase([positions[5], positions[6], positions[7]], res, chooseAfterUpload);

    if(!beforeDownload || !beforeUpload || !afterUpload) {
        return;
    }

    if(!checkValidHorizontalAccuracy([beforeDownload, beforeUpload, afterUpload], res)) {
        return;
    }

    return [beforeDownload, beforeUpload, afterUpload];
}


function chooseForPhase(phaseCandidates, res, phaseSelectionMethod) {

    var validCandidates = filterValidLatLon(phaseCandidates, res);
    if(!validCandidates) {
        return;
    }
    return phaseSelectionMethod(validCandidates);
}

function checkValidHorizontalAccuracy(positions, res) {

    var result = false;

    positions.forEach(function (pos) {

        if(pos.horizontal_accuracy <= 200) {
            result = true;
        }
    });

    if(result) {
        return true;
    }
    else {

        res.status(400).json({
            statusText: 'Bad Request',
            description: 'Cannot tag positions less accurate than 200 meters.'
        });

        return false;
    }
}

function filterValidLatLon(posArray, res) {

    var validPositions = [];

    posArray.forEach(function (pos) {

        if(pos.latitude !== 0 && pos.longitude !== 0) {
            validPositions.push(pos);
        }
    });

    if(validPositions.length === 0) {

        res.status(400).json({
            statusText: 'Bad Request',
            description: 'Cannot tag positions with multiple occurrences of longitude or latitude 0.'
        });

        return;
    }

    return validPositions;
}




function chooseBeforeDownload(posArray) {

    /*
     Choose the best of the following positions:
     Position 1: FCTStart
     Position 2: FCTEnd
     Position 3: DownloadStart

     In the case of a long FCT-Phase, Position 1 and 2 could be far away from each other.
     Position 2 and 3 are always close to each other.
     */

    if(posArray.length === 1) {
        /*
        In the worst case, only position 1 is valid and the FCT-Phase has a long duration. This could tamper the
        download-surroundings-result.
         */
        return posArray[0];
    }
    else {
        /*
        Chose the lowest position possible (1 or 2) which is more accurate than the highest (normally 3)
        and 100ms or less time away from the highest. This guarantees in the case of a long FCT-Phase,
        that the more accurate position of 2 or 3 is chosen and position 1 cant tamper the surrounding-query.
        The surrounding-query returns the surrounding during the download and the upload-phase separately.
        */

        var bestPosition = posArray[posArray.length - 1];

        for(var i = posArray.length - 2; i >= 0; i--) {

            var pos = posArray[i];
            var posTime = new Date(pos.time).getTime();
            var bestPositionTime = new Date(bestPosition.time).getTime();

            if(bestPositionTime - posTime <= 100) {
                bestPosition = findMoreAccurate(bestPosition, pos);
            }
        }

        return bestPosition;
    }
}

function chooseBeforeUpload(posArray) {

    /*
     Choose the best of the following positions:
     Position 4: DownloadEnd
     Position 5: UploadStart

     Both positions are always close to each other.
     */

    if(posArray.length === 1) {
        return posArray[0];
    }
    else {
        return findMoreAccurate(posArray[0], posArray[1]);
    }
}

function chooseAfterUpload(posArray) {

    /*
     Choose the best of the following positions:
     Position 6: UploadEnd
     Position 7: RTTStart
     Position 8: RTTEnd

     In the case of a long RTT-Phase, Position 7 and 8 could be far away from each other.
     Position 6 and 7 are always close to each other.
     */

    if(posArray.length === 1) {
        /*
         In the worst case, only position 8 is valid and the RTT-Phase has a long duration. This could tamper the
         upload-surroundings-result.
         */
        return posArray[0];
    }
    else {
        /*
         Chose the highest position possible (7 or 8) which is more accurate than the lowest (normally 6)
         and 100ms or less time away from the lowest. This guarantees in the case of a long RTT-Phase,
         that the more accurate position of 6 or 7 is chosen and position 8 cant tamper the surrounding-query.
         The surrounding-query returns the surrounding during the download and the upload-phase separately.
         */

        var bestPosition = posArray[0];

        for(var i = 1; i <= posArray.length - 1; i++) {

            var pos = posArray[i];
            var posTime = new Date(pos.time).getTime();
            var bestPositionTime = new Date(bestPosition.time).getTime();

            if(posTime - bestPositionTime <= 100) {
                bestPosition = findMoreAccurate(bestPosition, pos);
            }
        }

        return bestPosition;
    }
}

function findMoreAccurate(pos1, pos2) {
    return pos2.horizontal_accuracy < pos1.horizontal_accuracy ? pos2 : pos1;
}





function checkIfSwitzerland(positions, callback) {

    var database = db_access.getDatabase(db_access.SWITZERLAND_DB);
    var queryPositions = makePoints(positions);

    db_access.singleQueryParameterized(database, queries.INSIDE_SWITZERLAND, queryPositions, function (result) {
        callback(result.length);
    });
}





//Returns positions in the required format for parametrized queries
function makePoints(positions) {

    var posArray = [];
    const POINT = 'POINT({lon} {lat})';

    for(var i = 0; i < positions.length; i++) {

        posArray[i] = POINT
            .replace('{lon}', positions[i].longitude)
            .replace('{lat}', positions[i].latitude);
    }

    return posArray;
}

function makeMultipoints(positions) {

    const MULTIPOINT = 'MULTIPOINT ({lon1} {lat1}, {lon2} {lat2})';
    var posArray = [];

    for(var i = 0; i < positions.length - 1; i++) {

        posArray[i] = MULTIPOINT
            .replace('{lon1}', positions[i].longitude)
            .replace('{lat1}', positions[i].latitude)
            .replace('{lon2}', positions[i + 1].longitude)
            .replace('{lat2}', positions[i + 1].latitude);
    }

    return posArray;
}



module.exports = {
    "choosePositions": choosePositions,
    "checkIfSwitzerland": checkIfSwitzerland,
    "makePoints": makePoints,
    "makeMultipoints": makeMultipoints
};