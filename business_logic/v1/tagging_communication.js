var tagging = require('./tagging');
var dbAccess = require('../../persistence/db_access_v1');

const OSM_NEAREST_OBJECTS = 'WITH closest_candidates AS (SELECT id, osm_id, osm_name, clazz, geom_way FROM switzerland ' +
    'ORDER BY geom_way <-> ST_GeomFromText(\'POINT({lon} {lat})\', 4326) LIMIT 100) ' +
    'SELECT id, osm_id, osm_name, clazz, ST_Distance(geom_way::geography, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)::geography) FROM closest_candidates ' +
    'ORDER BY ST_Distance(geom_way, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)) LIMIT 3;';


String.prototype.replaceAll = function(target, replacement) {
    return this.split(target).join(replacement);
};


function getDbStatements(positions) {

    var statement1 = OSM_NEAREST_OBJECTS.replaceAll("{lon}", positions[0].longitude).replaceAll("{lat}", positions[0].latitude);
    var statement2 = OSM_NEAREST_OBJECTS.replaceAll("{lon}", positions[1].longitude).replaceAll("{lat}", positions[1].latitude);
    var statement3 = OSM_NEAREST_OBJECTS.replaceAll("{lon}", positions[2].longitude).replaceAll("{lat}", positions[2].latitude);

    return [statement1, statement2, statement3];
}

//Get measurement-points 1 (FCTStart), 4 (DownloadEnd) and 8 (RTTEnd)
function filterPositions(positions) {
    return [positions[0], positions[3], positions[7]];
}


function getTagsJSON(req, res) {

    var positions = filterPositions(req.body.positions);
    var statements = getDbStatements(positions);
    dbAccess.queryMultiple(statements[0], statements[1], statements[2], res, null, renderTagJSON);
}

function renderTagJSON(res, results) {

    var tag = tagging.tag(results);

    res.writeHead(200, {"Content-Type": "application/json"});

    var json = JSON.stringify({
        title: "Calculated Tagging",
        location: {
            id: tag.id,
            name: tag.name,
            description: tag.description,
            probability: tag.probability
        },
        typeOfMotion: {
            id: null,
            name: null,
            description: null
        },
        velocity: {
            distanceMeters: null,
            timeSeconds: null,
            velocityMeterPerSecond: null,
            velocityKilometersPerHour: null
        },
        surroundings: {
            geographicalSurroundings: {
                id: null,
                name: null,
                description: null
            },
            populationDensity: {
                id: null,
                name: null,
                description: null
            }
        }
    });

    res.end(json);
}



function getTagsView(req, res) {

    var positions = filterPositions(JSON.parse(req.body.positions));
    var statements = getDbStatements(positions);

    var coordinates = [
        {lat: positions[0].latitude, lon: positions[0].longitude},
        {lat: positions[1].latitude, lon: positions[1].longitude},
        {lat: positions[2].latitude, lon: positions[2].longitude}];

    dbAccess.queryMultiple(statements[0], statements[1], statements[2], res, coordinates, renderTagView);
}

function renderTagView(res, results, coordinates) {

    var tag = tagging.tag(results);

    res.render('nearestView', {
        title: "Calculated Tag",
        results: results,
        tag: tag.name,
        probability: tag.probability,
        coordinates: coordinates
    });
}


module.exports = { "getTagsView": getTagsView, "getTagsJSON": getTagsJSON };