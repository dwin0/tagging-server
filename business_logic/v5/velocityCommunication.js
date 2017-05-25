var velocity = require('./velocity');

function getSpeedCalculation(req, res) {
    velocity.getVelocity_request(req, res, function (res, endDate, startDate, resultingDistance) {

        var response = velocity.prepareJSON(endDate, startDate, resultingDistance);
        res.status(200).json(response);
    })
}


module.exports = {
    "getSpeedCalculation": getSpeedCalculation
};