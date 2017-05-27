var velocity = require('./velocity');

function getSpeedCalculation(req, res) {
    velocity.getVelocity(req.body.positions, function (error, result) {

        if(error || result.velocityKilometersPerHour < 0) {
            res.status(500).send('Internal Server Error');
            return;
        }

        if(result.timeSeconds === 0) {
            res.status(400).json({
                statusText: 'Bad Request',
                description: 'All positions have the same time.'
            });
            return;
        }

        res.status(200).json(result);
    })
}


module.exports = {
    "getSpeedCalculation": getSpeedCalculation
};