/**
 * Exceptions which are caught in the code and which are answered with a status code 500 are logged with this errorLogger.
 * @module business_logic/errorLogger
 */


var fs = require('fs');
var Log = require('log');
var path = require('path');


const LOG_DIRECTORY = path.join(__dirname, '\\..\\..\\log\\');
fs.existsSync(LOG_DIRECTORY) || fs.mkdirSync(LOG_DIRECTORY);
var logger = new Log('error', fs.createWriteStream(LOG_DIRECTORY + 'error.log', {'flags': 'a'}));


/**
 * Writes the error in a log file.
 *
 * @param {number} statusCode - status code which was returned to the client
 * @param {string} statusText - status text which was returned to the client
 * @param {object} error - error which was returned from the system
 * @param {string} functionCall - name of the function in which the exception was thrown
 * @param {string} fileName - name of the file in which the exception was thrown
 * @param {object} body - the request body which led to the exception
 */
function logError(statusCode, statusText, error, functionCall, fileName, body) {

    logger.error(statusCode + ' - ' + statusText + '\n' +
        'Function-Call: ' + functionCall + ' in file ' + fileName +
        '\n' + error +
        '\nRequest-Body: \n' + JSON.stringify(body, null, 4) + '\n\n');
}


module.exports = {
    "logError": logError
};