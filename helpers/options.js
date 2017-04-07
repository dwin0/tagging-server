var fs = require('fs');
var parsed = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'UTF-8'));
exports.storageConfig =  parsed;