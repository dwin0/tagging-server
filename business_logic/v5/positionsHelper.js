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

    var beforeDownloadCandidates = [positions[0], positions[1], positions[2]];
    beforeDownloadCandidates = filterValidLatLon(beforeDownloadCandidates, res);
    var beforeDownload = chooseBeforeDownload(beforeDownloadCandidates);

    var beforeUploadCandidates = [positions[3], positions[4]];
    beforeUploadCandidates = filterValidLatLon(beforeUploadCandidates, res);
    var beforeUpload = chooseBeforeUpload(beforeUploadCandidates);

    var afterUploadCandidates = [positions[5], positions[6], positions[7]];
    afterUploadCandidates = filterValidLatLon(afterUploadCandidates, res);
    var afterUpload = chooseAfterUpload(afterUploadCandidates);

    return [beforeDownload, beforeUpload, afterUpload];
}


function filterValidLatLon(posArray, res) {

    var validPositions = [];

    posArray.forEach(function (pos) {

        if(pos.longitude !== 0 && pos.latitude !== 0) {
            validPositions.push(pos);
        }
    });

    if(validPositions.length === 0) {

        res.json(400, {
            statusText: 'Bad Request',
            description: 'Cannot tag positions with multiple occurrences of longitude or latitude 0.',
            receivedElements: posArray
        });

    }

    return validPositions;
}

function findMoreAccurate(pos1, pos2) {
    return pos1.horizontal_accuracy < pos2.horizontal_accuracy ? pos1 : pos2;
}


//TODO: Unit-Tests
function chooseBeforeDownload(posArray) {

    if(posArray.length === 1) {

        /*In the worst case, only position 1 is valid and the FCT-Phase has a long duration. This could tamper the
        download-surroundings-result.
         */
        return posArray[0];
    }
    else {

        /*
        Position 1: FCTStart
        Position 2: FCTEnd
        Position 3: DownloadStart

        In the case of a long FCT-Phase, Position 1 and 2 could be far away from each other.
        Position 2 and 3 are always close to each other.

        Chose the lowest position possible (1 or 2) which is more accurate than the highest (normally 3)
        and 100ms or less time away from the highest. This guarantees in the case of a long FCT-Phase,
        that the more accurate position of 2 or 3 is chosen and position 1 cant tamper the surrounding-query.
        The surrounding-query returns the surrounding during the download and the upload-phase separately.
        */

        var bestPosition = posArray[posArray.length -1];

        for(var i = posArray.length -2; i >= 0; i--) {

            var pos = posArray[i];
            var posTime = new Date(pos.time).getTime();
            var bestPositionTime = new Date(bestPosition.time).getTime();

            if(bestPositionTime - posTime <= 100) {

                bestPosition = findMoreAccurate(pos, bestPosition);
            }
        }

        return bestPosition;
    }
}

function chooseBeforeUpload(posArray) {

    /*
     Position 4: DownloadEnd
     Position 5: UploadStart

     Both positions are always close to each other.
     */

    if(posArray.length === 1) {

        return posArray[0];
    }
    else {

        return findMoreAccurate(posArray[1], posArray[0]);
    }
}

function chooseAfterUpload(posArray) {

    if(posArray.length === 1) {
        /*In the worst case, only position 8 is valid and the RTT-Phase has a long duration. This could tamper the
         upload-surroundings-result.
         */
        return posArray[0];
    }
    else {

        /*
         Position 6: UploadEnd
         Position 7: RTTStart
         Position 8: RTTEnd

         In the case of a long RTT-Phase, Position 7 and 8 could be far away from each other.
         Position 6 and 7 are always close to each other.

         Chose the highest position possible (7 or 8) which is more accurate than the lowest (normally 6)
         and 100ms or less time away from the lowest. This guarantees in the case of a long RTT-Phase,
         that the more accurate position of 6 or 7 is chosen and position 8 cant tamper the surrounding-query.
         The surrounding-query returns the surrounding during the download and the upload-phase separately.
         */

        var bestPosition = posArray[0];

        for(var i = 1; i <= posArray.length -1; i++) {

            var pos = posArray[i];
            var posTime = new Date(pos.time).getTime();
            var bestPositionTime = new Date(bestPosition.time).getTime();

            if(posTime - bestPositionTime <= 100) {

                bestPosition = findMoreAccurate(pos, bestPosition);
            }
        }

        return bestPosition;
    }
}









//Returns positions in the required format for parametrized queries
function makePoints(positions) {

    var posArray = [];

    for(var i = 0; i < positions.length; i++) {
        posArray[i] = "POINT(" + positions[i].longitude + " "  + positions[i].latitude + ")";
    }

    return posArray;
}


function makeMultipoints(positions) {

    var posArray = [];

    for(var i = 0; i < positions.length -1; i++) {
        posArray[i] = "MULTIPOINT (" + positions[i].longitude + " " + positions[i].latitude + ", " +
            positions[i+1].longitude + " " + positions[i+1].latitude + ")";
    }

    return posArray;
}



module.exports = {
    "choosePositions": choosePositions,
    "makePoints": makePoints,
    "makeMultipoints": makeMultipoints
};