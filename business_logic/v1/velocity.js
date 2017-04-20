var db_access = require('../../persistence/db_access');


function getSpeedCalculation(req, res) {
    db_access.queryDistance(req.body, res, renderVelocity);
}

function renderVelocity(res, endDate, startDate, resultingDistance) {

    resultingDistance = resultingDistance.st_distance;

    var resultingTime = (endDate - startDate) / 1000;
    var resultingVelocityMS = resultingDistance / resultingTime;
    var resultingVelocityKMH = (resultingDistance / 1000) / (resultingTime / 3600);

    res.render('speedView', {
        title: "Calculated Distance:",
        distance: resultingDistance,
        time: resultingTime,
        velocity_ms: resultingVelocityMS,
        velocity_kmh: resultingVelocityKMH
    });
}

module.exports = { "getSpeedCalculation": getSpeedCalculation };