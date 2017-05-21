//Get measurement-points 1 (FCTStart), 4 (DownloadEnd) and 8 (RTTEnd)
function filterPositions(positions) {

    positions.sort(function (p1, p2) {
        return new Date(p1.time).getTime() - new Date(p2.time).getTime();
    });

    return [positions[0], positions[3], positions[7]];
}


//TODO: newPositions has always 3 Elements -> correct this
//TODO: handle double entries of 1 phase
//Get measurement-points (DownloadStart), (DownloadEnd) and (UploadEnd)
function filterSurroundingsPositions(positions) {
    var newPositions = [];

    positions.forEach(function (element) {
        var lowerCase = element.phase.toLowerCase();
        if(lowerCase === 'downloadstart') {
            newPositions[0] = element;
        } else if(lowerCase === 'downloadend') {
            newPositions[1] = element;
        } else if(lowerCase === 'uploadend') {
            newPositions[2] = element;
        }
    });

    return newPositions;
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
    "filterPositions": filterPositions,
    "filterSurroundingsPositions": filterSurroundingsPositions,
    "makePoints": makePoints,
    "makeMultipoints": makeMultipoints
};