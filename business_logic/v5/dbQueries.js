var config = require('../../config/configReader').queryConfig;


/*---------- populationSurroundings.js, geographicalSurroundings.js ----------*/

const FIND_MIDDLE_POINT = "WITH middlePoint AS " +
    "(SELECT ST_Centroid(ST_GeomFromText($1, 4326))) " +
    "SELECT ST_AsText(st_centroid), ST_X(st_centroid), ST_Y(st_centroid) FROM middlePoint;";

/*END populationSurroundings.js, geographicalSurroundings.js*/





/*--------- geographicalSurroundings.js --------------------------------------*/

const NATURAL_QUERY = 'SELECT "natural" FROM surroundings ' +
    'WHERE "natural" IS NOT NULL AND ST_Within(' +
    'ST_GeomFromText($1, 4326), ' +
    'ST_GeomFromEWKB(wkb_geometry));';

const BOUNDARY_QUERY = 'SELECT boundary FROM surroundings ' +
    'WHERE boundary IS NOT NULL AND ST_Within(' +
    'ST_GeomFromText($1, 4326), ' +
    'ST_GeomFromEWKB(wkb_geometry));';

const LEISURE_QUERY = 'SELECT leisure FROM surroundings ' +
    'WHERE leisure IS NOT NULL AND ST_Within(' +
    'ST_GeomFromText($1, 4326), ' +
    'ST_GeomFromEWKB(wkb_geometry))';

const LANDUSE_QUERY = 'SELECT landuse FROM surroundings ' +
    'WHERE landuse IS NOT NULL AND ST_Within(' +
    'ST_GeomFromText($1, 4326), ' +
    'ST_GeomFromEWKB(wkb_geometry));';

/*END geographicalSurroundings.js*/




/*--------- tagging.js -------------------------------------------------------*/

const SWITZERLAND_NEAREST_BUILDING = 'WITH closest_candidates AS (' +
    'SELECT * FROM multipolygons WHERE building IS NOT NULL ' +
    'ORDER BY multipolygons.wkb_geometry <-> ST_GeomFromText($1, 4326) ' +
    'ASC LIMIT ' + config.nearestBuilding.numberOfClosestCandidates + ') ' +
    'SELECT osm_way_id ' +
    'FROM closest_candidates ' +
    'WHERE ST_Distance(wkb_geometry::geography, ST_GeomFromText($1, 4326)::geography) < ' + config.nearestBuilding.st_distanceToMeasuringLocation + ' ' +
    'LIMIT 1;';


const OSM_NEAREST_WAYS = 'WITH closest_candidates AS (' +
    'SELECT id, osm_id, clazz, geom_way FROM switzerland ' +
    'ORDER BY geom_way <-> ST_GeomFromText($1, 4326) LIMIT ' + config.nearestWays.numberOfClosestCandidates + ') ' +
    'SELECT id, osm_id, clazz ' +
    'FROM closest_candidates ' +
    'WHERE ST_Distance(geom_way::geography, ST_GeomFromText($1, 4326)::geography) < ' + config.nearestWays.st_distanceToMeasuringLocation + ' ' +
    'LIMIT 3;';

const OSM_NEAREST_RAILWAYS = 'WITH closest_candidates AS (' +
    'SELECT id, osm_id, clazz, geom_way FROM switzerland ' +
    'WHERE clazz >= 50 ' +
    'ORDER BY geom_way <-> ST_GeomFromText($1, 4326) LIMIT ' + config.nearestRailways.numberOfClosestCandidates + ') ' +
    'SELECT id, osm_id, clazz ' +
    'FROM closest_candidates ' +
    'WHERE ST_Distance(geom_way::geography, ST_GeomFromText($1, 4326)::geography) < ' + config.nearestRailways.st_distanceToMeasuringLocation + ' ' +
    'LIMIT 1;';

/*END tagging.js --------*/





/*--------- velocity.js ------------------------------------------------------*/

const OSM_QUERY_DISTANCE = 'SELECT ST_Distance(ST_GeomFromText($1,4326)::geography, ' +
    'ST_GeomFromText($2, 4326)::geography);';

/*END velocity.js ------------------------------------------------------*/





module.exports = {
    "FIND_MIDDLE_POINT": FIND_MIDDLE_POINT,
    "NATURAL_QUERY": NATURAL_QUERY,
    "BOUNDARY_QUERY": BOUNDARY_QUERY,
    "LEISURE_QUERY": LEISURE_QUERY,
    "LANDUSE_QUERY": LANDUSE_QUERY,
    "SWITZERLAND_NEAREST_BUILDING": SWITZERLAND_NEAREST_BUILDING,
    "OSM_NEAREST_WAYS": OSM_NEAREST_WAYS,
    "OSM_NEAREST_RAILWAYS": OSM_NEAREST_RAILWAYS,
    "OSM_QUERY_DISTANCE": OSM_QUERY_DISTANCE
};