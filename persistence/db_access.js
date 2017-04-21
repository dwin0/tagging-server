var pg = require('pg');
var options = require('../config/configReader');
var parallel = require("async/parallel");


var config = {
    user: options.config.database_user,
    database: options.config.database,
    password: options.config.database_password,
    host: options.config.database_host,
    port: options.config.database_port,
    max: options.config.max_database_connections,
    idleTimeoutMillis: options.config.database_idleTimeoutMillis
};

const pool = new pg.Pool(config);

function queryMultiple(statement1, statement2, statement3, res, coordinates, callback) {
    parallel([
            function(callback) {
                pool.query(statement1, function (err, result) {
                    callback(null, result.rows);
                });
            },
            function(callback) {
                pool.query(statement2, function (err, result) {
                    callback(null, result.rows);
                });
            },
            function(callback) {
                pool.query(statement3, function (err, result) {
                    callback(null, result.rows);
                });
            }
        ],
        function(err, results) {
            callback(res, results, coordinates)
        });
}



function singleQuery(queryStatement, res, startDate, endDate, callback) {

    pool.query(queryStatement, function (err, result) {
        if (err) {
            return console.error('error happened during query', err)
        }

        var resultingDistance =  result.rows[0].st_distance;
        callback(res, endDate, startDate, resultingDistance);
    });
}


module.exports = { "queryMultiple": queryMultiple, "singleQuery": singleQuery };