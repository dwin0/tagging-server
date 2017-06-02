var config = require('../../config/configReader').queryConfig;


/*---------- populationSurroundings.js, geographicalSurroundings.js ----------*/

const FIND_MIDDLE_POINT = "WITH middlePoint AS " +
    "(SELECT ST_Centroid(ST_GeomFromText($1, 4326))) " +
    "SELECT ST_AsText(st_centroid), ST_X(st_centroid), ST_Y(st_centroid) FROM middlePoint;";

/*END populationSurroundings.js, geographicalSurroundings.js*/





/*--------- geographicalSurroundings.js --------------------------------------*/

const NATURAL_QUERY = 'SELECT "natural" FROM planet_osm_polygon ' +
    'WHERE "natural" IS NOT NULL AND ST_Within(' +
    'ST_GeomFromText($1, 4326), ' +
    'ST_GeomFromEWKB(way));';

const BOUNDARY_QUERY = 'SELECT boundary FROM planet_osm_polygon ' +
    'WHERE boundary IS NOT NULL AND ST_Within(' +
    'ST_GeomFromText($1, 4326), ' +
    'ST_GeomFromEWKB(way));';

const LEISURE_QUERY = 'SELECT leisure FROM planet_osm_polygon ' +
    'WHERE leisure IS NOT NULL AND ST_Within(' +
    'ST_GeomFromText($1, 4326), ' +
    'ST_GeomFromEWKB(way))';

const LANDUSE_QUERY = 'SELECT landuse FROM planet_osm_polygon ' +
    'WHERE landuse IS NOT NULL AND ST_Within(' +
    'ST_GeomFromText($1, 4326), ' +
    'ST_GeomFromEWKB(way));';

/*END geographicalSurroundings.js*/




/*--------- tagging.js -------------------------------------------------------*/

const SWITZERLAND_NEAREST_BUILDING = 'WITH closest_candidates AS (' +
    'SELECT * FROM planet_osm_polygon WHERE building IS NOT NULL ' +
    'ORDER BY way <-> ST_GeomFromText($1, 4326) ' +
    'ASC LIMIT ' + config.nearestBuilding.numberOfClosestCandidates + ') ' +
    'SELECT osm_id, name, building, ST_Distance(way::geography, ST_GeomFromText($1, 4326)::geography) ' +
    'FROM closest_candidates ' +
    'WHERE ST_Distance(way::geography, ST_GeomFromText($1, 4326)::geography) < ' + config.nearestBuilding.st_distanceToMeasuringLocation + ' ' +
    'LIMIT 1;';

const OSM_NEAREST_WAYS = 'WITH closest_candidates AS (' +
    'SELECT osm_id, name, highway, railway, way FROM planet_osm_line ' +
    'WHERE railway IN (\'rail\', \'light_rail\', \'narrow_gauge\', \'tram\', \'subway\') OR ' +
    'highway IN (\'motorway\', \'motorway_link\', \'trunk\', \'trunk_link\', \'primary\', ' +
    '\'primary_link\', \'secondary\', \'secondary_link\', \'tertiary\', \'tertiary_link\', ' +
    '\'residential\', \'road\', \'unclassified\', \'service\', \'living_street\', \'track\') ' +
    'ORDER BY way <-> ST_GeomFromText($1, 4326) LIMIT ' + config.nearestWays.numberOfClosestCandidates + ') ' +
    'SELECT osm_id, name, highway, railway, ST_Distance(way::geography, ST_GeomFromText($1, 4326)::geography) ' +
    'FROM closest_candidates ' +
    'WHERE ST_Distance(way::geography, ST_GeomFromText($1, 4326)::geography) < ' + config.nearestWays.st_distanceToMeasuringLocation + ' ' +
    'ORDER BY ST_Distance(way, ST_GeomFromText($1, 4326)) ' +
    'LIMIT 3;';

const OSM_NEAREST_RAILWAYS = 'WITH closest_candidates AS (' +
    'SELECT osm_id, name, way FROM planet_osm_line ' +
    'WHERE railway IN (\'rail\', \'light_rail\', \'narrow_gauge\', \'tram\', \'subway\') ' +
    'ORDER BY way <-> ST_GeomFromText($1, 4326) LIMIT ' + config.nearestRailways.numberOfClosestCandidates + ') ' +
    'SELECT osm_id, name, ST_Distance(way::geography, ST_GeomFromText($1, 4326)::geography) ' +
    'FROM closest_candidates ' +
    'WHERE ST_Distance(way::geography, ST_GeomFromText($1, 4326)::geography) < ' + config.nearestRailways.st_distanceToMeasuringLocation + ' ' +
    'ORDER BY ST_Distance(way, ST_GeomFromText($1, 4326)) ' +
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