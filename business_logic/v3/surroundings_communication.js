var surroundings = require('./surroundings');
var parallel = require("async/parallel");

function getSurroundingsJSON(req, res) {

    var positions = req.body.positions;

    if(typeof positions === 'string') {
        positions = JSON.parse(positions);
    }

    positions = filterPositions(positions);


    parallel([
            function(callback) {
                surroundings.getGeographicalSurroundings(positions, function (result) {
                    callback(null, result);
                });
            }
        ],
        function(err, results) {
            console.log(results);
            var geographicalSurroundingsResult = results[0];
            res.writeHead(200, {"Content-Type": "application/json"});

            var json = JSON.stringify({
                title: "Calculated Surroundings",
                surroundings: {
                    download: {
                        geographical_surroundings: {
                            id: geographicalSurroundingsResult.download.tag.id,
                            name: geographicalSurroundingsResult.download.tag.name,
                            osm_tag: geographicalSurroundingsResult.download.osm_tag,
                            description: geographicalSurroundingsResult.download.tag.description,
                            probability: null
                        },
                        population_density: {
                            number: null,
                            description: null,
                            probability: null
                        },
                        community_type: {
                            id: null,
                            type: null,
                            community_id: null,
                            postal_code: null,
                            community_name: null,
                            canton_id: null,
                            canton_name: null,
                            description: null,
                            probability: null
                        }
                    },
                    upload: {
                        geographical_surroundings: {
                            id: geographicalSurroundingsResult.upload.tag.id,
                            name: geographicalSurroundingsResult.upload.tag.name,
                            osm_tag: geographicalSurroundingsResult.upload.osm_tag,
                            description: geographicalSurroundingsResult.upload.tag.description,
                            probability: null
                        },
                        population_density: {
                            number: null,
                            description: null,
                            probability: null
                        },
                        community_type: {
                            id: null,
                            type: null,
                            community_id: null,
                            postal_code: null,
                            community_name: null,
                            canton_id: null,
                            canton_name: null,
                            description: null,
                            probability: null
                        }
                    }
                }
            });

            res.end(json);
        }
    );
}


//Get measurement-points (DownloadStart), (DownloadEnd) and (UploadEnd)
function filterPositions(positions) {
    var newPositions = [];

    positions.forEach(function (element) {
        var lowerCase = element.phase.toLowerCase();
        if(lowerCase === 'downloadstart' || lowerCase === 'downloadend' || lowerCase === 'uploadend') {
            newPositions.push(element);
        }
    });

    return newPositions;
}



module.exports = { "getSurroundingsJSON": getSurroundingsJSON };