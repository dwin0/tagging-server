/**
 * This module is responsible for querying the postgres-database.
 * @module persistence/dbAccess
 */


var pg = require('pg');
var options = require('../config/configReader').config;
var parallel = require('async/parallel');


var config = {
    user: options.database_user,
    database: options.database_name,
    password: options.database_password,
    host: options.database_host,
    port: options.database_port,
    max: options.max_database_connections,
    idleTimeoutMillis: options.database_idleTimeoutMillis
};

var databasePool = new pg.Pool(config);


/**
 * queries the database with multiple variations of a single statement in parallel.
 * @param {string} statement - statement a placeholder like $1
 * @param {Array} variables - array containing a value for every query like [ VAR_1, VAR_2, VAR3 ]
 * which returns in 3 queries. Use makePoints or makeMultipoints to fit the required form.
 * @param {function} callback - function which will be called with the result of type (error, array)
 */
function queryMultiple(statement, variables, callback) {

    var dbRequests = [];

    for(var i = 0; i < variables.length; i++) {

        dbRequests[i] = (function (i) {
            return function(callback) {
                
                databasePool.query(statement, [variables[i]], function (err, result) {
                    if (err) {
                        console.error('error happened during query', err);
                        callback(err);
                        return;
                    }
                    callback(null, result.rows);
                });
            };
        })(i);
    }

    parallel(dbRequests,
        function(err, results) {
            if(err) {
                callback(err);
                return;
            }

            callback(null, results);
        }
    );
}



function singleQuery(statement, variables, callback) {

    databasePool.query(statement, variables, function (err, result) {
        if (err) {
            console.error('error happened during query', err);
            callback(err);
            return;
        }

        callback(null, result.rows);
    });
}



module.exports = {
    "singleQuery": singleQuery,
    "queryMultiple": queryMultiple
};