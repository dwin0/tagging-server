function renderTagJson(taggingRes, typeOfMotion, velocityJSON, geographicalSurroundingsResult, geoAdminResults) {

    var surroundingsJson = renderSurroundingsJson(geographicalSurroundingsResult, geoAdminResults);

    return {
        title: 'Calculated Tagging',
        location: taggingRes,
        typeOfMotion: typeOfMotion,
        velocity: velocityJSON,
        surroundings: surroundingsJson.surroundings
    }
}

function renderSurroundingsJson(geographicalSurroundingsResult, geoAdminResults) {

    return {
        title: 'Calculated Surroundings',
        surroundings: {
            download: {
                populationDensity: geoAdminResults.download.populationDensity,
                communityType: geoAdminResults.download.communityType,
                geographicalSurroundings: geographicalSurroundingsResult.download
            },
            upload: {
                populationDensity: geoAdminResults.upload.populationDensity,
                communityType: geoAdminResults.upload.communityType,
                geographicalSurroundings: geographicalSurroundingsResult.upload
            }
        }
    }
}



module.exports = {
    "renderTagJson": renderTagJson,
    "renderSurroundingsJson": renderSurroundingsJson
};