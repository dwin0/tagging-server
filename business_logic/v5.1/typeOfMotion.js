/**
 * This module returns the type of motion which can be: stationary, pedestrian, vehicular or high-speed-vehicular.
 * @module business_logic/typeOfMotion
 */

const STATIONARY = {
    id: 1,
    name: 'stationary',
    description: '0 km/h to 3 km/h'
};

const PEDESTRIAN = {
    id: 2,
    name: 'pedestrian',
    description: '3 km/h to 15 km/h'
};

const VEHICULAR = {
    id: 3,
    name: 'vehicular',
    description: '15 km/h to 140 km/h'
};

const HIGH_SPEED_VEHICULAR = {
    id: 4,
    name: 'high-speed-vehicular',
    description: '140 km/h to 450km/h'
};

const UNKNOWN = {
    id: -1,
    name: 'unknown',
    description: 'No tagging possible.'
};


/**
 * Function which returns the type of motion for a velocity in kilometers per hour.
 *
 * @param {number} speed - speed in kilometers per hour which should be the result of getVelocity from velocity
 * @see business_logic/velocity
 * @returns {object} an object with id, name and description
 */
function getTypeOfMotion(speed) {

    switch(true) {
        case (speed >= 0 && speed < 3):
            return STATIONARY;
        case (speed >= 3 && speed < 11):
            return PEDESTRIAN;
        case (speed >= 11 && speed < 140):
            return VEHICULAR;
        case (speed >= 140 && speed < 450):
            return HIGH_SPEED_VEHICULAR;
        default:
            return UNKNOWN;
    }
}


module.exports = {
    "getTypeOfMotion": getTypeOfMotion
};