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
 * @param statement
 * @param variables: Use makePoints or makeMultipoints to fit the required form
 * @param callback
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