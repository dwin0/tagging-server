var fs = require('fs');
var Log = require('log');
var logger = new Log('error', fs.createWriteStream('./log/error.log', {'flags': 'a'}));


function logError(statusCode, statusText, error, functionCall, fileName, body) {

    logger.error(statusCode + ' - ' + statusText + '\n' +
        'Function-Call: ' + functionCall + ' in file ' + fileName +
        '\n' + error +
        '\nRequest-Body: \n' + JSON.stringify(body, null, 4) + '\n\n');
}


module.exports = {
    "logError": logError
};