var velocity = require('./velocity');

function getSpeedCalculation(req, res) {
    velocity.getVelocity_request(req, function (error, endDate, startDate, resultingDistance) {

        if(error) {
            res.status(500).send('Internal Server Error');
            return;
        }

        var response = velocity.prepareJSON(endDate, startDate, resultingDistance);
        res.status(200).json(response);
    })
}


module.exports = {
    "getSpeedCalculation": getSpeedCalculation
};