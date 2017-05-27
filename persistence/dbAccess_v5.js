var pg = require('pg');
var options = require('../config/configReader').config;
var parallel = require('async/parallel');


var config = {
    user: options.database_user,
    database: options.database_streets,
    password: options.database_password,
    host: options.database_host,
    port: options.database_port,
    max: options.max_database_connections,
    idleTimeoutMillis: options.database_idleTimeoutMillis
};

const STREETS_DB = 'streets';
const SWITZERLAND_DB = 'switzerland';

var streetDB_pool, switzerlandDB_pool;

/**
 * Connect only at the first request to the database
 *
 * @param dbName
 * @returns {pg.Pool|*}
 */
function getDatabase(dbName) {

    switch(dbName) {
        case STREETS_DB:
            if(streetDB_pool) {
                return streetDB_pool;
            }

            streetDB_pool = new pg.Pool(config);
            return streetDB_pool;

        case SWITZERLAND_DB:
            if(switzerlandDB_pool) {
                return switzerlandDB_pool;
            }

            //copy config
            var newConfig = JSON.parse(JSON.stringify(config));
            newConfig.database = options.database_switzerland;
            switzerlandDB_pool = new pg.Pool(newConfig);
            return switzerlandDB_pool;
    }
}



/**
 * @param database
 * @param statement
 * @param variables: Use formatPositions to fit the required form
 * @param callback
 */
function queryMultiple(database, statement, variables, callback) {

    var dbRequests = [];

    for(var i = 0; i < variables.length; i++) {

        dbRequests[i] = (function (i) {
            return function(callback) {
                
                database.query(statement, [variables[i]], function (err, result) {
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
        });
}



function singleQuery(database, statement, variables, callback) {

    database.query(statement, variables, function (err, result) {
        if (err) {
            console.error('error happened during query', err);
            callback(err);
            return;
        }

        callback(null, result.rows);
    });
}



module.exports = {
    "SWITZERLAND_DB": SWITZERLAND_DB,
    "STREETS_DB": STREETS_DB,
    "getDatabase": getDatabase,
    "singleQuery": singleQuery,
    "queryMultiple": queryMultiple
};