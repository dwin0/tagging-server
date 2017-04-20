var pg = require('pg');
var options = require('../config/configReader');
var parallel = require("async/parallel");

var connectionString = options.config.connectionString;

//TODO: Prepared Statements
//TODO: DB-Pool --> https://github.com/brianc/node-postgres



String.prototype.replaceAll = function(target, replacement) {
    return this.split(target).join(replacement);
};


const osmQuery = 'WITH closest_candidates AS (SELECT id, osm_id, osm_name, clazz, geom_way FROM switzerland ' +
    'ORDER BY geom_way <-> ST_GeomFromText(\'POINT({lon} {lat})\', 4326) LIMIT 100) ' +
    'SELECT id, osm_id, osm_name, clazz, ST_Distance(geom_way::geography, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)::geography) FROM closest_candidates ' +
    'ORDER BY ST_Distance(geom_way, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)) LIMIT 3;';



function queryNearest(res, body, callback) {

    var statement1 = osmQuery.replaceAll("{lon}", body.longitude1).replaceAll("{lat}", body.latitude1);
    var statement2 = osmQuery.replaceAll("{lon}", body.longitude2).replaceAll("{lat}", body.latitude2);
    var statement3 = osmQuery.replaceAll("{lon}", body.longitude3).replaceAll("{lat}", body.latitude3);

    var coordinates = [{lat: body.latitude1, lon: body.longitude1}, {lat: body.latitude2, lon: body.longitude2},
        {lat: body.latitude3, lon: body.longitude3}];


    pg.connect(connectionString, function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err)
        }
        done();

        parallel([
                function(callback) {
                    client.query(statement1, function (err, result) {
                        callback(null, result.rows);
                    });
                },
                function(callback) {
                    client.query(statement2, function (err, result) {
                        callback(null, result.rows);
                    });
                },
                function(callback) {
                    client.query(statement3, function (err, result) {
                        callback(null, result.rows);
                    });
                }
            ],
            function(err, results) {
                callback(res, results, coordinates);
            });
    })
}




const osmQueryDistance = 'SELECT ST_Distance(ST_GeomFromText(\'POINT({lon1} {lat1})\',4326)::geography, ' +
    'ST_GeomFromText(\'POINT({lon2} {lat2})\', 4326)::geography);';


function queryDistance(body, res, renderVelocity) {


    var lat1 = body.latitude1;
    var lat2 = body.latitude2;

    var lon1 = body.longitude1;
    var lon2 = body.longitude2;

    var startDate = new Date(body.start);
    var endDate = new Date(body.end);


    var queryStatement = osmQueryDistance
        .replaceAll("{lon1}", lon1)
        .replaceAll("{lat1}", lat1)
        .replaceAll("{lon2}", lon2)
        .replaceAll("{lat2}", lat2);



    pg.connect(connectionString, function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err)
        }
        done();

        client.query(queryStatement, function (err, result) {
            if (err) {
                return console.error('error happened during query', err)
            }

            var resultingDistance =  result.rows[0];
            renderVelocity(res, endDate, startDate, resultingDistance);
        });
    });
}


module.exports = { "queryNearest": queryNearest, "queryDistance": queryDistance };