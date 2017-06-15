/**
 * This module chooses the best positions with help of the positionsHelper, passes them on to geographicalSurroundings and
 * populationSurroundings and prepares the answer of those delegations with help of the jsonHelper for the answer to the client.
 * @see business_logic/positionsHelper
 * @see business_logic/geographicalSurroundings
 * @see business_logic/populationSurroundings
 * @module business_logic/surroundingsCommunication
 */

var populationSurroundings = require('./populationSurroundings');
var geographicalSurroundings = require('./geographicalSurroundings');
var parallel = require('async/parallel');
var jsonHelper = require('./jsonHelper');
var positionsHelper = require('./positionsHelper');
var logError = require('./errorLogger').logError;


/**
 * Function which filters the best positions and returns the result of the surroundings calculation.
 *
 * @param {object} req - client request
 * @param {object} res - response which will be sent to the client
 */
function getSurroundings(req, res) {

    positionsHelper.choosePositions(req.body, res, function (positions) {

        //error occurred, but already handled
        if(!positions) {
            return;
        }

        calculateSurroundings(positions, req.body, res);
    });
}


/**
 * Function which starts the calculation of the geographical surroundings as well as the population density and the community type in parallel.
 *
 * @param {Array} positions - the array is expected to have the best three positions in it, positions should be the result of choosePositions from positionsHelper
 * @see business_logic/positionsHelper
 * @param {object} body - part of the request, will only be used in case of an error, so that the body which triggers the error can be logged
 * @param {object} res - response object, will be used to send an error if something went wrong otherwise the result of the
 * geographical surroundings calculation is returned to the client
 */
function calculateSurroundings(positions, body, res) {

    parallel([
            function(callback) {
                geographicalSurroundings.getGeographicalSurroundings(positions, function (error, result) {
                    callback(error, result);
                });
            },
            function(callback) {
                populationSurroundings.getGeoAdminData(positions, function (error, result) {
                    callback(error, result);
                })
            }
        ],
        function(err, results) {

            if(err) {
                res.status(500).json({ error: 'Internal Server Error' });
                logError(500, 'Internal Server Error', err, 'parallel', 'surroundingsCommunication', body);
                return;
            }

            /*Parameters: geographicalSurroundings-result, geoAdmin-result */
            var response = jsonHelper.renderSurroundingsJson(results[0], results[1]);
            res.status(200).json(response);
        }
    );
}


module.exports = {
    "getSurroundings": getSurroundings
};