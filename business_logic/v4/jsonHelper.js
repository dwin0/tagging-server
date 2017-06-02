function renderTagJson(taggingRes, typeOfMotion, speedResult, geographicalSurroundingsResult, geoAdminResults) {

    var jsonSurrounding = renderSurroundingsJson(geographicalSurroundingsResult, geoAdminResults);

    return {
        title: "Calculated Tagging",
        location: {
            id: taggingRes.tag.id,
            name: taggingRes.tag.name,
            description: taggingRes.tag.description,
            weight: taggingRes.probability,
            allWeights: taggingRes.allProbabilities
        },
        typeOfMotion: {
            id: typeOfMotion.id,
            name: typeOfMotion.name,
            description: typeOfMotion.description
        },
        velocity: {
            distanceMeters: speedResult.distanceMeters,
            timeSeconds: speedResult.timeSeconds,
            velocityMeterPerSecond: speedResult.velocityMeterPerSecond,
            velocityKilometersPerHour: speedResult.velocityKilometersPerHour
        },
        surroundings: jsonSurrounding.surroundings
    }
}


function renderSurroundingsJson(geographicalSurroundingsResult, geoAdminResults) {

    return {
        title: "Calculated Surroundings",
        surroundings: {
            download: {
                populationDensity: {
                    number: geoAdminResults.download.pop.number,
                    description: geoAdminResults.download.pop.description
                },
                communityType: {
                    id: geoAdminResults.download.type.tag.id,
                    type: geoAdminResults.download.type.tag.name,
                    description: geoAdminResults.download.type.tag.description,
                    communityId: geoAdminResults.download.type.res.communityId,
                    communityName: geoAdminResults.download.type.res.communityName,
                    cantonId: geoAdminResults.download.type.res.cantonId,
                    cantonName: geoAdminResults.download.type.res.cantonName

                },
                geographicalSurroundings: {
                    osmKey: geographicalSurroundingsResult.download.osmKey,
                    osmValue: geographicalSurroundingsResult.download.osmValue,
                    description: geographicalSurroundingsResult.download.description
                }
            },
            upload: {
                populationDensity: {
                    number: geoAdminResults.upload.pop.number,
                    description: geoAdminResults.upload.pop.description
                },
                communityType: {
                    id: geoAdminResults.upload.type.tag.id,
                    type: geoAdminResults.upload.type.tag.name,
                    description: geoAdminResults.upload.type.tag.description,
                    communityId: geoAdminResults.upload.type.res.communityId,
                    communityName: geoAdminResults.upload.type.res.communityName,
                    cantonId: geoAdminResults.upload.type.res.cantonId,
                    cantonName: geoAdminResults.upload.type.res.cantonName
                },
                geographicalSurroundings: {
                    osmKey: geographicalSurroundingsResult.upload.osmKey,
                    osmValue: geographicalSurroundingsResult.upload.osmValue,
                    description: geographicalSurroundingsResult.upload.description
                }
            }
        }
    }
}


function prepareSurroundingsDownUp(resultObj) {

    return {
        download: {
            osmKey: resultObj.down.osmKey,
            osmValue: resultObj.down.osmValue,
            description: resultObj.down.description
        },
        upload: {
            osmKey: resultObj.up.osmKey,
            osmValue: resultObj.up.osmValue,
            description: resultObj.up.description
        }
    };
}


module.exports = {
    "renderSurroundingsJson": renderSurroundingsJson,
    "renderTagJson": renderTagJson,
    "prepareSurroundingsDownUp": prepareSurroundingsDownUp
};