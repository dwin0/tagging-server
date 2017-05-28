var velocity = require('./velocity');

function getSpeedCalculation(req, res) {

    if(!checkPositions(req.body.positions)) {
        res.status(400).json({
            statusText: 'Bad Request',
            description: 'Received positions without time value.'
        });
        return;
    }

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

function checkPositions(positions) {

    for(var i = 0; i < positions.length; i++) {
        if(positions[i].time === '') {
            return false;
        }
    }

    return true;
}


module.exports = {
    "getSpeedCalculation": getSpeedCalculation
};