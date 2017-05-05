var db = require('../../persistence/db_access_v3');
var helper = require('./helper');
var parallel = require("async/parallel");


function getGeographicalSurroundings(positions, callback) {
    console.log(positions);
    callback(null, positions);
}


module.exports = { "getGeographicalSurroundings": getGeographicalSurroundings };