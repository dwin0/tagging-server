function renderTagJson(taggingRes, typeOfMotion, speedResult, geographicalSurroundingsResult, geoAdminResults) {

    var surroundingsJson = renderSurroundingsJson(geographicalSurroundingsResult, geoAdminResults);

    return {
        title: 'Calculated Tagging',
        location: taggingRes,
        type_of_motion: typeOfMotion,
        velocity: speedResult,
        surroundings: surroundingsJson.surroundings
    }
}

function renderSurroundingsJson(geographicalSurroundingsResult, geoAdminResults) {

    return {
        title: 'Calculated Surroundings',
        surroundings: {
            download: {
                population_density: geoAdminResults.download.population_density,
                community_type: geoAdminResults.download.community_type,
                geographical_surroundings: geographicalSurroundingsResult.download
            },
            upload: {
                population_density: geoAdminResults.upload.population_density,
                community_type: geoAdminResults.upload.community_type,
                geographical_surroundings: geographicalSurroundingsResult.upload
            }
        }
    }
}



module.exports = {
    "renderTagJson": renderTagJson,
    "renderSurroundingsJson": renderSurroundingsJson
};