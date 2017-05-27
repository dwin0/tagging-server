var config = require('../../config/configReader').queryConfig;


/*---------- populationSurroundings.js, geographicalSurroundings.js ----------*/

/*
 Example:

 WITH middlePoint AS
 (SELECT ST_Centroid(ST_GeomFromText('MULTIPOINT (8.7095882 47.3589998, 8.7135701 47.3530638)', 4326)))
 SELECT ST_AsText(st_centroid), ST_X(st_centroid), ST_Y(st_centroid) FROM middlePoint;
 */

const FIND_MIDDLE_POINT = 'WITH middlePoint AS ' +
    '(SELECT ST_Centroid(ST_GeomFromText($1, 4326))) ' +
    'SELECT ST_AsText(st_centroid), ST_X(st_centroid), ST_Y(st_centroid) FROM middlePoint;';

/*END populationSurroundings.js, geographicalSurroundings.js*/





/*--------- geographicalSurroundings.js --------------------------------------*/

/*
 Example:

 SELECT boundary, "natural", leisure, landuse
 FROM multipolygons
 WHERE ST_Within(ST_GeomFromText('POINT(8.71157915 47.3560318)', 4326), wkb_geometry)
 AND (
     (boundary IS NOT NULL AND boundary != 'administrative')
     OR "natural" IS NOT NULL
     OR leisure IS NOT NULL
     OR landuse IS NOT NULL);
 */

const GEOGRAPHICAL_QUERY = 'SELECT boundary, "natural", leisure, landuse ' +
    'FROM multipolygons WHERE ST_Within(ST_GeomFromText($1, 4326), wkb_geometry) ' +
    'AND (' +
        '(boundary IS NOT NULL AND boundary != \'administrative\') OR ' +
        '"natural" IS NOT NULL OR ' +
        'leisure IS NOT NULL OR ' +
        'landuse IS NOT NULL);';

/*END geographicalSurroundings.js*/





/*--------- tagging.js -------------------------------------------------------*/

/*
 Example:

 WITH closest_candidates AS (
     SELECT * FROM multipolygons
     WHERE building IS NOT NULL
     ORDER BY multipolygons.wkb_geometry <-> ST_GeomFromText('POINT(8.71157915 47.3560318)', 4326)
     LIMIT 10)
 SELECT osm_way_id
 FROM closest_candidates
 WHERE ST_Distance(wkb_geometry::geography, ST_GeomFromText('POINT(8.71157915 47.3560318)', 4326)::geography) < 15
 LIMIT 1;
 */

const SWITZERLAND_NEAREST_BUILDING = 'WITH closest_candidates AS (' +
        'SELECT * FROM multipolygons ' +
        'WHERE building IS NOT NULL ' +
        'ORDER BY multipolygons.wkb_geometry <-> ST_GeomFromText($1, 4326) ' +
        'LIMIT ' + config.nearestBuilding.numberOfClosestCandidates + ') ' +
    'SELECT osm_way_id ' +
    'FROM closest_candidates ' +
    'WHERE ST_Distance(wkb_geometry::geography, ST_GeomFromText($1, 4326)::geography) < ' +
    config.nearestBuilding.st_distanceToMeasuringLocation + ' ' +
    'LIMIT 1;';



/*
 Example:

 WITH closest_candidates AS (
     SELECT clazz, geom_way
     FROM switzerland
     ORDER BY geom_way <-> ST_GeomFromText('POINT(8.71157915 47.3560318)', 4326)
     LIMIT 100)
 SELECT clazz
 FROM closest_candidates
 WHERE ST_Distance(geom_way::geography, ST_GeomFromText('POINT(8.71157915 47.3560318)', 4326)::geography) < 10
 LIMIT 3;
 */

const OSM_NEAREST_WAYS = 'WITH closest_candidates AS (' +
        'SELECT clazz, geom_way ' +
        'FROM switzerland ' +
        'ORDER BY geom_way <-> ST_GeomFromText($1, 4326) ' +
        'LIMIT ' + config.nearestWays.numberOfClosestCandidates + ') ' +
    'SELECT clazz ' +
    'FROM closest_candidates ' +
    'WHERE ST_Distance(geom_way::geography, ST_GeomFromText($1, 4326)::geography) < ' +
    config.nearestWays.st_distanceToMeasuringLocation + ' ' +
    'LIMIT 3;';



/*
 Example:

 WITH closest_candidates AS (
     SELECT clazz, geom_way
     FROM switzerland
     WHERE clazz >= 50
     ORDER BY geom_way <-> ST_GeomFromText('POINT(8.71157915 47.3560318)', 4326)
     LIMIT 100)
 SELECT clazz
 FROM closest_candidates
 WHERE ST_Distance(geom_way::geography, ST_GeomFromText('POINT(8.7165203 47.3516764)', 4326)::geography) < 10
 LIMIT 1;
 */

const OSM_NEAREST_RAILWAYS = 'WITH closest_candidates AS (' +
        'SELECT clazz, geom_way ' +
        'FROM switzerland ' +
        'WHERE clazz >= 50 ' +
        'ORDER BY geom_way <-> ST_GeomFromText($1, 4326) ' +
        'LIMIT ' + config.nearestRailways.numberOfClosestCandidates + ') ' +
    'SELECT clazz ' +
    'FROM closest_candidates ' +
    'WHERE ST_Distance(geom_way::geography, ST_GeomFromText($1, 4326)::geography) < ' +
    config.nearestRailways.st_distanceToMeasuringLocation + ' ' +
    'LIMIT 1;';

/*END tagging.js*/





/*--------- velocity.js ------------------------------------------------------*/

/*
 Example:

 SELECT ST_Distance(
                ST_GeomFromText('POINT(8.7095882 47.3589998)', 4326)::geography,
                ST_GeomFromText('POINT(8.7165203 47.3516764)', 4326)::geography);
 */

const OSM_QUERY_DISTANCE = 'SELECT ST_Distance' +
                                '(ST_GeomFromText($1, 4326)::geography, ' +
                                'ST_GeomFromText($2, 4326)::geography);';

/*END velocity.js*/





/*--------- positionsHelper.js -----------------------------------------------*/

/*
 Example:

 SELECT osm_id FROM multipolygons
 WHERE ST_Within(ST_GeomFromText('POINT(8.7095882 47.3589998)', 4326), wkb_geometry)
   AND ST_Within(ST_GeomFromText('POINT(8.7135701 47.3530638)', 4326), wkb_geometry)
   AND ST_Within(ST_GeomFromText('POINT(8.7115791 47.3560318)', 4326), wkb_geometry)
   AND osm_id = '51701';
 */

const INSIDE_SWITZERLAND = 'SELECT osm_id FROM multipolygons ' +
    'WHERE ST_Within(ST_GeomFromText($1, 4326), wkb_geometry) ' +
      'AND ST_Within(ST_GeomFromText($2, 4326), wkb_geometry) ' +
      'AND ST_Within(ST_GeomFromText($3, 4326), wkb_geometry) ' +
      'AND osm_id = \'51701\';';

/*END positionsHelper.js*/




module.exports = {
    "FIND_MIDDLE_POINT": FIND_MIDDLE_POINT,
    "GEOGRAPHICAL_QUERY": GEOGRAPHICAL_QUERY,
    "SWITZERLAND_NEAREST_BUILDING": SWITZERLAND_NEAREST_BUILDING,
    "OSM_NEAREST_WAYS": OSM_NEAREST_WAYS,
    "OSM_NEAREST_RAILWAYS": OSM_NEAREST_RAILWAYS,
    "OSM_QUERY_DISTANCE": OSM_QUERY_DISTANCE,
    "INSIDE_SWITZERLAND": INSIDE_SWITZERLAND
};