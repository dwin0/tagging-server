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

    var body = req.body;

    var statement1 = osmQuery.replaceAll("{lon}", body.longitude1).replaceAll("{lat}", body.latitude1);
    var statement2 = osmQuery.replaceAll("{lon}", body.longitude2).replaceAll("{lat}", body.latitude2);
    var statement3 = osmQuery.replaceAll("{lon}", body.longitude3).replaceAll("{lat}", body.latitude3);

    var coordinates = [{lat: body.latitude1, lon: body.longitude1}, {lat: body.latitude2, lon: body.longitude2},
        {lat: body.latitude3, lon: body.longitude3}];


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