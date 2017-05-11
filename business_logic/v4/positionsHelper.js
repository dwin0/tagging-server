
//Get measurement-points 1 (FCTStart), 4 (DownloadEnd) and 8 (RTTEnd)
function filterPositions(positions) {

    positions.sort(function (p1, p2) {
        return new Date(p1.time).getTime() - new Date(p2.time).getTime();
    });

    return [positions[0], positions[3], positions[7]];
}


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



module.exports = {
    "filterPositions": filterPositions,
    "filterSurroundingsPositions": filterSurroundingsPositions
};