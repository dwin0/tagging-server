var velocity = require('./velocity');

function getSpeedCalculationJSON(req, res) {
    velocity.getVelocity_request(req, res, function (res, endDate, startDate, resultingDistance) {

        res.writeHead(200, {"Content-Type": "application/json"});
        var json = velocity.prepareJSON(endDate, startDate, resultingDistance);
        res.end( JSON.stringify(json));
    })
}


module.exports = { "getSpeedCalculationJSON": getSpeedCalculationJSON };