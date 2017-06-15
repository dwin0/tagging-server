/**
 * This module checks the validity of the input-values, passes them to velocity and returns the answer to the client.
 * @module business_logic/velocityCommunication
 */


var velocity = require('./velocity');
var logError = require('./errorLogger').logError;


/**
 * Function which starts the speedCalculation.
 * @param {object} req - client request
 * @param {object} res - response which will be sent to the client
 */
function getSpeedCalculation(req, res) {

    if(!checkPositions(req.body.positions)) {
        res.status(400).json({ error: 'Received positions with invalid time value.' });
        return;
    }

    velocity.getVelocity(req.body.positions, function (error, result) {

        if(error || result.velocityKilometersPerHour < 0) {
            res.status(500).json({ error: 'Internal Server Error' });
            logError(500, 'Internal Server Error', error || 'Speed: ' + result.velocityKilometersPerHour + 'km/h',
                'velocity.getVelocity', 'velocityCommunication', req.body);
            return;
        }

        if(result.timeSeconds === 0) {
            res.status(400).json({ error: 'All positions have the same time.' });
            return;
        }

        res.status(200).json(result);
    })
}

/**
 * Function which checks if all input-position have a valid time.
 * @param {array} positions - input-positions from the client
 * @returns {boolean} true if all input-position have a valid time, otherwise false
 */
function checkPositions(positions) {

    for(var i = 0; i < positions.length; i++) {
        if(!Date.parse(positions[i].time)) {
            return false;
        }
    }

    return true;
}


module.exports = {
    "getSpeedCalculation": getSpeedCalculation
};