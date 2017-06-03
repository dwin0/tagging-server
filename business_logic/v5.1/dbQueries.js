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
 FROM planet_osm_polygon
 WHERE ST_Within(ST_GeomFromText('POINT(8.71157915 47.3560318)', 4326), way)
 AND (
     (boundary IS NOT NULL AND boundary != 'administrative')
     OR "natural" IS NOT NULL
     OR leisure IS NOT NULL
     OR landuse IS NOT NULL);
 */

const GEOGRAPHICAL_QUERY = 'SELECT boundary, "natural", leisure, landuse ' +
    'FROM planet_osm_polygon WHERE ST_Within(ST_GeomFromText($1, 4326), way) ' +
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
     SELECT osm_id, way FROM planet_osm_polygon
     WHERE building IS NOT NULL OR tourism IN ('resort', 'bed_and_breakfast', 'wilderness_hut', 'motel', 'guest_house',
     'chalet', 'apartment', 'mountain_hut', 'castle', 'restaurant', 'casino', 'alpine_hut', 'hotel', 'hut')
     ORDER BY way <-> ST_GeomFromText('POINT(8.71157915 47.3560318)', 4326)
     LIMIT 10)
 SELECT osm_id
 FROM closest_candidates
 WHERE ST_Distance(way::geography, ST_GeomFromText('POINT(8.71157915 47.3560318)', 4326)::geography) < 15
 LIMIT 1;
 */

const SWITZERLAND_NEAREST_BUILDING = 'WITH closest_candidates AS (' +
        'SELECT osm_id, way FROM planet_osm_polygon ' +
        'WHERE building IS NOT NULL OR tourism IN (\'resort\', \'bed_and_breakfast\', \'wilderness_hut\', \'motel\', ' +
        '\'guest_house\', \'chalet\', \'apartment\', \'mountain_hut\', \'castle\', \'restaurant\', \'casino\', ' +
        '\'alpine_hut\', \'hotel\', \'hut\') ' +
        'ORDER BY way <-> ST_GeomFromText($1, 4326) ' +
        'LIMIT ' + config.nearestBuilding.numberOfClosestCandidates + ') ' +
    'SELECT osm_id ' +
    'FROM closest_candidates ' +
    'WHERE ST_Distance(way::geography, ST_GeomFromText($1, 4326)::geography) < ' +
    config.nearestBuilding.st_distanceToMeasuringLocation + ' ' +
    'LIMIT 1;';



/*
 Example:

 WITH closest_candidates AS (
     SELECT highway, railway, way
     FROM planet_osm_line
     WHERE railway IN ('rail', 'light_rail', 'narrow_gauge', 'tram', 'subway') OR
     highway IN ('motorway', 'motorway_link', 'trunk', 'trunk_link', 'primary',
     'primary_link', 'secondary', 'secondary_link', 'tertiary', 'tertiary_link',
     'residential', 'road', 'unclassified', 'service', 'living_street', 'track')
     ORDER BY way <-> ST_GeomFromText('POINT(8.7148 47.35268)', 4326)
     LIMIT 100)
 SELECT highway, railway
 FROM closest_candidates
 WHERE ST_Distance(way::geography, ST_GeomFromText('POINT(8.7148 47.35268)', 4326)::geography) < 10
 LIMIT 3;
 */

const OSM_NEAREST_WAYS = 'WITH closest_candidates AS (' +
        'SELECT highway, railway, way ' +
        'FROM planet_osm_line ' +
        'WHERE railway IN (\'rail\', \'light_rail\', \'narrow_gauge\', \'tram\', \'subway\') OR ' +
        'highway IN (\'motorway\', \'motorway_link\', \'trunk\', \'trunk_link\', \'primary\', ' +
        '\'primary_link\', \'secondary\', \'secondary_link\', \'tertiary\', \'tertiary_link\', ' +
        '\'residential\', \'road\', \'unclassified\', \'service\', \'living_street\', \'track\') ' +
        'ORDER BY way <-> ST_GeomFromText($1, 4326) ' +
        'LIMIT ' + config.nearestWays.numberOfClosestCandidates + ') ' +
    'SELECT highway, railway ' +
    'FROM closest_candidates ' +
    'WHERE ST_Distance(way::geography, ST_GeomFromText($1, 4326)::geography) < ' +
    config.nearestWays.st_distanceToMeasuringLocation + ' ' +
    'LIMIT 3;';



/*
 Example:

 WITH closest_candidates AS (
     SELECT osm_id, way
     FROM planet_osm_line
     WHERE railway IN ('rail', 'light_rail', 'narrow_gauge', 'tram', 'subway')
     ORDER BY way <-> ST_GeomFromText('POINT(8.71157915 47.3560318)', 4326)
     LIMIT 100)
 SELECT osm_id
 FROM closest_candidates
 WHERE ST_Distance(way::geography, ST_GeomFromText('POINT(8.7165203 47.3516764)', 4326)::geography) < 10
 LIMIT 1;
 */

const OSM_NEAREST_RAILWAYS = 'WITH closest_candidates AS (' +
        'SELECT osm_id, way ' +
        'FROM planet_osm_line ' +
        'WHERE railway IN (\'rail\', \'light_rail\', \'narrow_gauge\', \'tram\', \'subway\') ' +
        'ORDER BY way <-> ST_GeomFromText($1, 4326) ' +
        'LIMIT ' + config.nearestRailways.numberOfClosestCandidates + ') ' +
    'SELECT osm_id ' +
    'FROM closest_candidates ' +
    'WHERE ST_Distance(way::geography, ST_GeomFromText($1, 4326)::geography) < ' +
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

 SELECT osm_id FROM planet_osm_polygon
 WHERE ST_Within(ST_GeomFromText('POINT(8.7095882 47.3589998)', 4326), way)
     AND ST_Within(ST_GeomFromText('POINT(8.7135701 47.3530638)', 4326), way)
     AND ST_Within(ST_GeomFromText('POINT(8.7115791 47.3560318)', 4326), way)
     AND osm_id = '-51701';

 51701 is the OSM-ID for the boundary of Switzerland.
 */

const INSIDE_SWITZERLAND = 'SELECT osm_id FROM planet_osm_polygon ' +
    'WHERE ST_Within(ST_GeomFromText($1, 4326), way) ' +
        'AND ST_Within(ST_GeomFromText($2, 4326), way) ' +
        'AND ST_Within(ST_GeomFromText($3, 4326), way) ' +
        'AND osm_id = \'-51701\';';

/*END positionsHelper.js*/





//Returns positions in the required format for parametrized queries
function makePoints(positions) {

    var posArray = [];
    const POINT = 'POINT({lon} {lat})';

    for(var i = 0; i < positions.length; i++) {

        posArray[i] = POINT
            .replace('{lon}', positions[i].longitude)
            .replace('{lat}', positions[i].latitude);
    }

    return posArray;
}

function makeMultipoints(positions) {

    const MULTIPOINT = 'MULTIPOINT ({lon1} {lat1}, {lon2} {lat2})';
    var posArray = [];

    for(var i = 0; i < positions.length - 1; i++) {

        posArray[i] = MULTIPOINT
            .replace('{lon1}', positions[i].longitude)
            .replace('{lat1}', positions[i].latitude)
            .replace('{lon2}', positions[i + 1].longitude)
            .replace('{lat2}', positions[i + 1].latitude);
    }

    return posArray;
}




module.exports = {
    "FIND_MIDDLE_POINT": FIND_MIDDLE_POINT,
    "GEOGRAPHICAL_QUERY": GEOGRAPHICAL_QUERY,
    "SWITZERLAND_NEAREST_BUILDING": SWITZERLAND_NEAREST_BUILDING,
    "OSM_NEAREST_WAYS": OSM_NEAREST_WAYS,
    "OSM_NEAREST_RAILWAYS": OSM_NEAREST_RAILWAYS,
    "OSM_QUERY_DISTANCE": OSM_QUERY_DISTANCE,
    "INSIDE_SWITZERLAND": INSIDE_SWITZERLAND,
    "makePoints": makePoints,
    "makeMultipoints": makeMultipoints
};