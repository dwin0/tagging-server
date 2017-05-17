var fs = require('fs');

//TODO: read config only once

var config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'UTF-8'));
var queryConfig = JSON.parse(fs.readFileSync(__dirname + '/queryConfig.json', 'UTF-8'));

module.exports = { "config": config, "queryConfig": queryConfig };