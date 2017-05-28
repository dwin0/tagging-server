var surroundings = require('./surroundings');
var parallel = require("async/parallel");

function getSurroundingsJSON(req, res) {

    var positions = req.body.positions;

    if(typeof positions === 'string') {
        positions = JSON.parse(positions);
    }

    positions = filterSurroundingsPositions(positions);

    if(positions.length < 3) {
        res.writeHead(400, {"Content-Type": "application/json"});
        var json = JSON.stringify({
            statusText: 'Bad Request',
            description: 'Phases DownloadStart, DownloadEnd and UploadEnd where expected. At least one phase is missing.',
            receivedElements: positions
        });
        res.end(json);
    } else {
        parallel([
                function(callback) {
                    surroundings.getGeographicalSurroundings(positions, function (result) {
                        callback(null, result);
                    });
                },
                function(callback) {
                    surroundings.getGeoAdminData(positions, function (result) {
                        callback(null, result);
                    })
                }
            ],
            function(err, results) {

                var geographicalSurroundingsResult = results[0];
                var geoAdminResults = results[1];
                res.writeHead(200, {"Content-Type": "application/json"});

                var json = JSON.stringify(renderSurroundingsJson(geographicalSurroundingsResult, geoAdminResults));

                res.end(json);
            }
        );
    }
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

function renderSurroundingsJson(geographicalSurroundingsResult, geoAdminResults) {

    return {
        title: "Calculated Surroundings",
        surroundings: {
            download: {
                geographicalSurroundings: {
                    id: geographicalSurroundingsResult.download.geo.id,
                    name: geographicalSurroundingsResult.download.geo.name,
                    osmValue: geographicalSurroundingsResult.download.osmValue,
                    description: geographicalSurroundingsResult.download.geo.description
                },
                populationDensity: {
                    number: geoAdminResults.download.pop.number,
                    description: geoAdminResults.download.pop.description
                },
                communityType: {
                    id: geoAdminResults.download.type.tag.id,
                    type: geoAdminResults.download.type.tag.name,
                    description: geoAdminResults.download.type.tag.description,
                    communityId: geoAdminResults.download.type.res.comId,
                    communityName: geoAdminResults.download.type.res.comName,
                    cantonId: geoAdminResults.download.type.res.canId,
                    cantonName: geoAdminResults.download.type.res.canName
                }
            },
            upload: {
                geographicalSurroundings: {
                    id: geographicalSurroundingsResult.upload.geo.id,
                    name: geographicalSurroundingsResult.upload.geo.name,
                    osmValue: geographicalSurroundingsResult.upload.osmValue,
                    description: geographicalSurroundingsResult.upload.geo.description
                },
                populationDensity: {
                    number: geoAdminResults.upload.pop.number,
                    description: geoAdminResults.upload.pop.description
                },
                communityType: {
                    id: geoAdminResults.upload.type.tag.id,
                    type: geoAdminResults.upload.type.tag.name,
                    description: geoAdminResults.upload.type.tag.description,
                    communityId: geoAdminResults.upload.type.res.comId,
                    communityName: geoAdminResults.upload.type.res.comName,
                    cantonId: geoAdminResults.upload.type.res.canId,
                    cantonName: geoAdminResults.upload.type.res.canName
                }
            }
        }
    }
}


module.exports = { "getSurroundingsJSON": getSurroundingsJSON,
                    "filterSurroundingsPositions": filterSurroundingsPositions,
                    "renderSurroundingsJson": renderSurroundingsJson };