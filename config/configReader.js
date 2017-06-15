/**
 * This module is responsible for reading and returning the configuration-files.
 * @module config/configReader
 */


var fs = require('fs');

var config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'UTF-8'));
var queryConfig = JSON.parse(fs.readFileSync(__dirname + '/queryConfig.json', 'UTF-8'));

module.exports = {
    "config": config,
    "queryConfig": queryConfig
};