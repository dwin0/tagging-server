var converter = require('./converter');
var db_access = require('../../persistence/db_access');



String.prototype.replaceAll = function(target, replacement) {
    return this.split(target).join(replacement);
};


//TODO: Prepared Statements


const osmQuery = 'WITH closest_candidates AS (SELECT id, osm_id, osm_name, clazz, geom_way FROM switzerland ' +
    'ORDER BY geom_way <-> ST_GeomFromText(\'POINT({lon} {lat})\', 4326) LIMIT 100) ' +
    'SELECT id, osm_id, osm_name, clazz, ST_Distance(geom_way::geography, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)::geography) FROM closest_candidates ' +
    'ORDER BY ST_Distance(geom_way, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)) LIMIT 3;';


function getTags(req, res) {

    var position1 = req.body.positions[0];
    var position2 = req.body.positions[1];
    var position3 = req.body.positions[2];

    var statement1 = osmQuery.replaceAll("{lon}", position1.longitude).replaceAll("{lat}", position1.latitude);
    var statement2 = osmQuery.replaceAll("{lon}", position2.longitude).replaceAll("{lat}", position2.latitude);
    var statement3 = osmQuery.replaceAll("{lon}", position3.longitude).replaceAll("{lat}", position3.latitude);

    var coordinates = [{lat: position1.latitude, lon: position1.longitude}, {lat: position2.latitude, lon: position2.longitude},
        {lat: position3.latitude, lon: position3.longitude}];


    db_access.queryMultiple(statement1, statement2, statement3, res, coordinates, renderNearest);
}

function renderNearest(res, results, coordinates) {

    var tag = converter.tag(results);

    res.render('nearestView', {
        title: "Nearest Ways:",
        results: results,
        tag: tag.tagName,
        probability: tag.probability,
        coordinates: coordinates
    });
}


module.exports = { "getTags": getTags };