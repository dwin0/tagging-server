var surroundings = require('./surroundings');
var parallel = require("async/parallel");

function getSurroundingsJSON(req, res) {

    var positions = req.body.positions;

    if(typeof positions === 'string') {
        positions = JSON.parse(positions);
    }

    positions = filterPositions(positions);

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
                //console.log(results);
                var geographicalSurroundingsResult = results[0];
                var geoAdminResults = results[1];
                res.writeHead(200, {"Content-Type": "application/json"});

                var json = JSON.stringify({
                    title: "Calculated Surroundings",
                    surroundings: {
                        download: {
                            geographical_surroundings: {
                                id: geographicalSurroundingsResult.download.geo.id,
                                name: geographicalSurroundingsResult.download.geo.name,
                                osm_tag: geographicalSurroundingsResult.download.osm_tag,
                                description: geographicalSurroundingsResult.download.geo.description,
                                probability: null
                            },
                            population_density: {
                                number: geoAdminResults.download.pop.number,
                                description: geoAdminResults.download.pop.description,
                                probability: null
                            },
                            community_type: {
                                id: geoAdminResults.download.type.tag.id,
                                type: geoAdminResults.download.type.tag.name,
                                community_id: geoAdminResults.download.type.res.comId,
                                community_name: geoAdminResults.download.type.res.comName,
                                canton_id: geoAdminResults.download.type.res.canId,
                                canton_name: geoAdminResults.download.type.res.canName,
                                description: geoAdminResults.download.type.tag.description,
                                probability: null
                            }
                        },
                        upload: {
                            geographical_surroundings: {
                                id: geographicalSurroundingsResult.upload.geo.id,
                                name: geographicalSurroundingsResult.upload.geo.name,
                                osm_tag: geographicalSurroundingsResult.upload.osm_tag,
                                description: geographicalSurroundingsResult.upload.geo.description,
                                probability: null
                            },
                            population_density: {
                                number: geoAdminResults.upload.pop.number,
                                description: geoAdminResults.upload.pop.description,
                                probability: null
                            },
                            community_type: {
                                id: geoAdminResults.upload.type.tag.id,
                                type: geoAdminResults.upload.type.tag.name,
                                community_id: geoAdminResults.upload.type.res.comId,
                                community_name: geoAdminResults.upload.type.res.comName,
                                canton_id: geoAdminResults.upload.type.res.canId,
                                canton_name: geoAdminResults.upload.type.res.canName,
                                description: geoAdminResults.upload.type.tag.description,
                                probability: null
                            }
                        }
                    }
                });

                res.end(json);
            }
        );
    }
}


//Get measurement-points (DownloadStart), (DownloadEnd) and (UploadEnd)
function filterPositions(positions) {
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



module.exports = { "getSurroundingsJSON": getSurroundingsJSON };