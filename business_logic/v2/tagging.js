var db = require('../../persistence/db_access_v2');
var helper = require('./helper');
var parallel = require("async/parallel");


const TRAIN = { id: 1, name: "train", description: null };
const CAR = { id: 2, name: "car", description: null };
const FOOT_INSIDE = { id: 3, name: "foot_inside", description: null };
const FOOT_OUTSIDE = { id: 4, name: "foot_outside", description: null };
const OTHER = { id: 100, name: "other", description: "OSM-tag is defined, but not supported." };
const UNKNOWN = { id: -1, name: "unknown", description: "No tagging possible." };


const SWITZERLAND_NEAREST_BUILDING = 'WITH closest_candidates AS (' +
    'SELECT * FROM public.multipolygons WHERE building IS NOT NULL ' +
    'ORDER BY multipolygons.wkb_geometry <-> ST_GeomFromText(\'POINT({lon} {lat})\', 4326) ' +
    'ASC LIMIT 10) ' +
    'SELECT osm_way_id, name, building, ST_Distance(wkb_geometry::geography, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)::geography) ' +
    'FROM closest_candidates ' +
    'LIMIT 1;';


//TODO: Duplicate (tagging_communication.js) Put in db-requests-file
const OSM_NEAREST_OBJECTS = 'WITH closest_candidates AS (SELECT id, osm_id, osm_name, clazz, geom_way FROM switzerland ' +
    'ORDER BY geom_way <-> ST_GeomFromText(\'POINT({lon} {lat})\', 4326) LIMIT 100) ' +
    'SELECT id, osm_id, osm_name, clazz, ST_Distance(geom_way::geography, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)::geography) FROM closest_candidates ' +
    'WHERE ST_Distance(geom_way::geography, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)::geography) < 10 ORDER BY ST_Distance(geom_way, ST_GeomFromText(\'POINT({lon} {lat})\', 4326)) LIMIT 3;';


function clazzToWayType(clazz) {

    return (clazz > 0 && clazz < 17) ?  CAR : TRAIN;
}

function getTag(nearestWays, typeOfMotion, positions, callback) {

    var tag, probability;

    //VEHICULAR or HIGH_SPEED_VEHICULAR
    //Result is CAR or TRAIN
    if(typeOfMotion.id > 2) {
        //TODO: Check if speed > max. speed allowed on street

        var amountOfCars = 0;
        var amountOfTrains = 0;

        for (var i = 0; i < nearestWays.length; i++){

            for (var j = 0; j < nearestWays[i].length; j++){

                var wayType = clazzToWayType([nearestWays[i][j].clazz]);
                if(wayType === CAR) { amountOfCars++; }
                else { amountOfTrains++; }
            }
        }

        var bigger = amountOfCars > amountOfTrains ? amountOfCars : amountOfTrains;
        var smaller = amountOfCars < amountOfTrains ? amountOfCars : amountOfTrains;

        tag = amountOfCars > amountOfTrains ? CAR : TRAIN;
        probability = bigger / (bigger + smaller);
        callback({ tag: tag, probability: probability });
    }

    //STATIONARY or PEDESTRIAN
    //All Results are possible
    else if (typeOfMotion.id !== -1) {

        var nearestBuildingStatements = helper.getDBStatements(SWITZERLAND_NEAREST_BUILDING, positions);
        var nearestWaysStatements = helper.getDBStatements(OSM_NEAREST_OBJECTS, positions);

        //Get the nearest building of each position (3 positions)
        parallel([
                function(callback) {
                    db.queryMultiple(db.getDatabase(db.SWITZERLAND_DB), nearestBuildingStatements, function (result) {
                        callback(null, result);
                    });
                },
                //TODO: query later
                //Get all railways or streets within 10 meters for each of the 3 points
                function(callback) {
                    db.queryMultiple(db.getDatabase(db.STREETS_DB), nearestWaysStatements, function (result) {
                        callback(null, result);
                    });
                }
            ],
            function(err, results) {

                //TODO: Check if this 3 buildings are the same
                var nearestBuildings = results[0];

                const numberOfBuildings = 3;
                var close_building_count = 0;

                nearestBuildings.forEach(function (building) {
                    //Position within 10 meters to a building
                    if(building[0].st_distance <= 10) {
                        close_building_count++;
                    }
                });

                var probability = close_building_count / numberOfBuildings;

                if(probability >= 2 / 3) {
                    callback({ tag: FOOT_INSIDE, probability: probability });

                } else
                    {
                        var nearestWays = results[1];

                        var totalAmountOfCars = 0;
                        var totalAmountOfTrains = 0;

                        for (var i = 0; i < nearestWays.length; i++){

                            var amountOfCars = 0;
                            var amountOfTrains = 0;

                            for (var j = 0; j < nearestWays[i].length; j++){

                                var wayType = clazzToWayType([nearestWays[i][j].clazz]);
                                if(wayType === CAR) {
                                    if(amountOfCars === 0) {
                                        amountOfCars++;
                                    }
                                }
                                else if (wayType === TRAIN) {
                                    if(amountOfTrains === 0) {
                                        amountOfTrains++;
                                    }
                                }
                            }

                            totalAmountOfCars += amountOfCars;
                            totalAmountOfTrains += amountOfTrains;
                        }

                        var bigger = totalAmountOfCars > totalAmountOfTrains ? totalAmountOfCars : totalAmountOfTrains;
                        tag = totalAmountOfCars > totalAmountOfTrains ? CAR : TRAIN;
                        probability = bigger / 3; //3 points with max. 1 nearest ways

                        if(probability > 0.25) {

                            //Speed < 10 km/h, no building close nearby, close to railway or street
                            callback({ tag: tag, probability: probability });
                        } else {

                            //Speed < 10 km/h, no building close nearby, no railways or streets close nearby
                            callback({ tag: FOOT_OUTSIDE, probability: null });
                        }
                }
            });
    }
}

module.exports = { "getTag": getTag };