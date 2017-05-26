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

var osmdb_pool, switzerland_osm_pool;

/**
 * Connect only at the first request to the database
 *
 * @param dbName
 * @returns {pg.Pool|*}
 */
function getDatabase(dbName) {

    switch(dbName) {
        case STREETS_DB:
            if(osmdb_pool) {
                return osmdb_pool;
            }

            osmdb_pool = new pg.Pool(config);
            return osmdb_pool;

        case SWITZERLAND_DB:
            if(switzerland_osm_pool) {
                return switzerland_osm_pool;
            }

            //copy config
            var newConfig = JSON.parse(JSON.stringify(config));
            newConfig.database = options.database_switzerland;
            switzerland_osm_pool = new pg.Pool(newConfig);
            return switzerland_osm_pool;
    }
}



/**
 * @param database
 * @param statement
 * @param positions: Use formatPositions to fit the required form
 * @param callback
 */
function queryMultipleParameterized(database, statement, positions, callback) {

    var dbRequests = [];

    for(var i = 0; i < positions.length; i++) {

        dbRequests[i] = (function (i) {
            return function(callback) {
                
                database.query(statement, [positions[i]], function (err, result) {
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



function singleQueryParameterized(database, statement, positions, callback) {

    database.query(statement, positions, function (err, result) {
        if (err) {
            console.error('error happened during query', err);
            callback(err, null);
            return;
        }

        callback(null, result.rows);
    });
}



module.exports = {
    "SWITZERLAND_DB": SWITZERLAND_DB,
    "STREETS_DB": STREETS_DB,
    "getDatabase": getDatabase,
    "singleQueryParameterized": singleQueryParameterized,
    "queryMultipleParameterized": queryMultipleParameterized
};