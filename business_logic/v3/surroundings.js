var dbAccess= require('../../persistence/db_access_v3');
var helper = require('./helper');
var parallel = require("async/parallel");
var converter = require('./wgs84_ch1903');
var request = require('request');

//Constants for geographical surroundings:
const GRASSLAND = {
    id: 1,
    name: "grassland",
    osmValue: '',
    description: "Includes OpenStreetMap-Key: landuse with the values: meadow, farmland, grass, farmyard, allotments, greenhouse_horticulture, " +
    "plant_nursery, recreation_ground, village_green, greenfield and conservation. Includes OpenStreetMap-Key: natural with the values: scrub, " +
    "grassland, wetland, fell, heath, meadow and grass. Includes OpenStreetMap-Key: protected_area, national_park and nature_reserve. Includes " +
    "OpenStreetMap-Key: leisure with the values: garden, park, nature_reserve, golf_course, miniature_golf, recreation_ground and dog_park."
};

const TREES = {
    id: 2,
    name: "trees",
    osmValue: '',
    description: "Includes OpenStreetMap-Key: landuse with the values: forest, vineyard and orchard. Includes OpenStreetMap-Key: natural with the " +
    "values: wood, tree and tree_row."
};

const CONSTRUCTEDAREA = {
    id: 3,
    name: "constructedArea",
    osmValue: '',
    description: "Includes OpenStreetMap-Key: landuse with the values: residential, industrial, construction, commercial, quarry, railway, military, " +
    "retail, landfill, brownfield and garages. Includes OpenStreetMap-Key: leisure with the values: sports_centre and stadium."
};

const WATER = {
    id: 4,
    name: "water",
    osmValue: '',
    description: "Includes OpenStreetMap-Key: landuse with the values: basin and reservoir. Includes OpenStreetMap-Key: natural with the value: water. " +
    "Includes OpenStreetMap-Key: leisure with the values: swimming_pool, marina, water_park and slipway."
};

const ROCKS = {
    id: 5,
    name: "rocks",
    osmValue: '',
    description: "Includes OpenStreetMap-Key: natural with the values: scree, bare_rock, shingle, cliff, rock and stone."
};

const OTHER = {
    id: 100,
    name:"other",
    osmValue: '',
    description: "OSM-tag is defined, but not supported."
};

const UNKNOWN = {
    id: -1,
    name: "unknown",
    osmValue: 'unknown',
    description: "No tagging possible."
};


//Constants for community types:
const LARGECENTRE = {
    id: 1,
    name: 'Grosszentrum',
    description: 'Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)'
};

const BESIDESCENTREOFLARGECENTRE = {
    id: 2,
    name: 'Nebenzentrum eines Grosszentrums',
    description: 'Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)'
};

const BELTOFLARGECENTRE = {
    id: 3,
    name: 'Gürtel eines Grosszentrums',
    description: 'Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)'
};

const MEDIUMCENTRE = {
    id: 4,
    name: 'Mittelzentrum',
    description: 'Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)'
};

const BELTOFMEDIUMCENTRE = {
    id: 5,
    name: 'Gürtel eines Mittelzentrums',
    description: 'Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)'
};

const SMALLCENTRE = {
    id: 6,
    name: 'Kleinzentrum',
    description: 'Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)'
};

const PERIURBAN = {
    id: 7,
    name: 'Periurbane ländliche Gemeinde',
    description: 'Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)'
};

const AGRICULTURAL = {
    id: 8,
    name: 'Agrargemeinde',
    description: 'Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)'
};

const TOURISTICAL = {
    id: 9,
    name: 'Touristische Gemeinde',
    description: 'Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)'
};


const FIND_MIDDLE_POINT = "SELECT ST_AsText(ST_Centroid(ST_GeomFromText(('MULTIPOINT ( {lon1} {lat1}, {lon2} {lat2})'), 4326)));";


const NATURAL_QUERY = 'SELECT "natural" FROM multipolygons ' +
                    'WHERE "natural" IS NOT NULL AND ST_Within(' +
                    'ST_GeomFromText((\'{point}\'), 4326), ' +
                    'ST_GeomFromEWKB(wkb_geometry));';

const BOUNDARY_QUERY = 'SELECT boundary FROM multipolygons ' +
                    'WHERE boundary IS NOT NULL AND boundary != \'administrative\' AND ST_Within(' +
                    'ST_GeomFromText((\'{point}\'), 4326), ' +
                    'ST_GeomFromEWKB(wkb_geometry));';

const LEISURE_QUERY = 'SELECT leisure FROM multipolygons ' +
                    'WHERE leisure IS NOT NULL AND ST_Within(' +
                    'ST_GeomFromText((\'{point}\'), 4326), ' +
                    'ST_GeomFromEWKB(wkb_geometry))';

const LANDUSE_QUERY = 'SELECT landuse FROM multipolygons ' +
                    'WHERE landuse IS NOT NULL AND ST_Within(' +
                    'ST_GeomFromText((\'{point}\'), 4326), ' +
                    'ST_GeomFromEWKB(wkb_geometry));';

const GEOADMIN_URL = 'https://api3.geo.admin.ch/rest/services/all/MapServer/identify?geometry={y},{x}' +
    '&geometryFormat=geojson&geometryType=esriGeometryPoint&imageDisplay=1,1,1&lang=de&layers=all:ch.are.bevoelkerungsdichte,' +
    'ch.are.gemeindetypen&mapExtent=0,0,1,1&returnGeometry=false&tolerance=5';



function getGeographicalSurroundings(positions, callback) {
    var middlePointQueries = prepareMiddlePointDbStatements(FIND_MIDDLE_POINT, positions);

    parallel([
            function(callback) {
                dbAccess.queryMultiple(dbAccess.getDatabase(dbAccess.SWITZERLAND_DB), middlePointQueries, function (result) {
                    callback(null, result);
                });
            }
        ],
        function (err, results) {
            var naturalQueries = prepareNaturalDbStatements(NATURAL_QUERY, results);
            var boundaryQueries = prepareBoundaryAndLeisureDbStatements(BOUNDARY_QUERY, results);
            var leisureQueries = prepareBoundaryAndLeisureDbStatements(LEISURE_QUERY, results);
            var landuseQueries = prepareLanduseDbStatements(LANDUSE_QUERY, results);
            //console.log(naturalQueries);
            //console.log(boundaryQueries);
            //console.log(leisureQueries);
            //console.log(landuseQueries);

            parallel([
                    function(callback) {
                        dbAccess.queryMultiple(dbAccess.getDatabase(dbAccess.SWITZERLAND_DB), boundaryQueries, function (result) {
                            callback(null, result);
                        });
                    },
                    function(callback) {
                        dbAccess.queryMultiple(dbAccess.getDatabase(dbAccess.SWITZERLAND_DB), leisureQueries, function (result) {
                            callback(null, result);
                        });
                    },
                    function(callback) {
                        dbAccess.queryMultiple(dbAccess.getDatabase(dbAccess.SWITZERLAND_DB), landuseQueries, function (result) {
                           callback(null, result);
                        });
                    },
                    function(callback) {
                        dbAccess.queryMultiple(dbAccess.getDatabase(dbAccess.SWITZERLAND_DB), naturalQueries, function (result) {
                            callback(null, result);
                        });
                    }
                ],
                function (err, results) {
                    var resultingTagDownload = UNKNOWN;
                    var resultingTagUpload = UNKNOWN;

                    //console.log('boundary');
                    var boundaryDownload = results[0][0];
                    var boundaryUpload = results[0][1];
                    if(boundaryDownload.length > 0) {
                        resultingTagDownload = getBoundaryTag(boundaryDownload[0].boundary);
                    }
                    if(boundaryUpload.length > 0) {
                        resultingTagUpload = getBoundaryTag(boundaryUpload[0].boundary);
                    }
                    //console.log(resultingTagDownload);
                    //console.log(resultingTagUpload);


                    //console.log('leisure');
                    var leisureDownload = results[1][0];
                    var leisureUpload = results[1][1];
                    if(leisureDownload.length > 0) {
                        resultingTagDownload = getLeisureTag(leisureDownload[0].leisure);
                    }
                    if(leisureUpload.length > 0) {
                        resultingTagUpload = getLeisureTag(leisureUpload[0].leisure);
                    }
                    //console.log(resultingTagDownload);
                    //console.log(resultingTagUpload);


                    //console.log('landuse');
                    var landuseDownload = results[2][0];
                    var landuseUpload = results[2][1];
                    if(landuseDownload.length > 0) {
                        resultingTagDownload = getLanduseTag(landuseDownload[0].landuse);
                    }
                    if(landuseUpload.length > 0) {
                        resultingTagUpload = getLanduseTag(landuseUpload[0].landuse);
                    }
                    //console.log(resultingTagDownload);
                    //console.log(resultingTagUpload);


                    //console.log('natural');
                    var naturalDownload = results[3][0];
                    var naturalUpload = results[3][1];
                    if(naturalDownload.length > 0) {
                        resultingTagDownload = getNaturalTag(naturalDownload[0].natural);
                    }
                    if(naturalUpload.length > 0) {
                        resultingTagUpload = getNaturalTag(naturalUpload[0].natural);
                    }
                    //console.log(resultingTagDownload);
                    //console.log(resultingTagUpload);

                    returnSurroundingsTag(resultingTagDownload, resultingTagUpload, callback);
                }
            );
        }
    );
}

function getGeoAdminData(positions, callback) {
    var middlePointQueries = prepareMiddlePointDbStatements(FIND_MIDDLE_POINT, positions);

    parallel([
            function(callback) {
                dbAccess.queryMultiple(dbAccess.getDatabase(dbAccess.SWITZERLAND_DB), middlePointQueries, function (result) {
                    callback(null, result);
                });
            }
        ],
        function (err, results) {
            var pointDownload = results[0][0][0].st_astext;
            var pointUpload = results[0][1][0].st_astext;
            var lonDownload = pointDownload.substring(6, pointDownload.indexOf(' '));
            var latDownload = pointDownload.substring(pointDownload.indexOf(' ') + 1, pointDownload.length - 1);
            var lonUpload = pointUpload.substring(6, pointUpload.indexOf(' '));
            var latUpload = pointUpload.substring(pointUpload.indexOf(' ') + 1, pointUpload.length - 1);
            var chyDownload = converter.WGStoCHy(latDownload, lonDownload);
            var chxDownload = converter.WGStoCHx(latDownload, lonDownload);
            var chyUpload = converter.WGStoCHy(latUpload, lonUpload);
            var chxUpload = converter.WGStoCHx(latUpload, lonUpload);
            var urlDownload = GEOADMIN_URL.replace('{y}', chyDownload).replace('{x}', chxDownload);
            var urlUpload = GEOADMIN_URL.replace('{y}', chyUpload).replace('{x}', chxUpload);

            parallel([
                    function(callback) {
                        request.get(
                            urlDownload,
                            function (error, response) {
                                if (!error && response.statusCode === 200) {
                                    callback(null, JSON.parse(response.body));
                                } else {
                                    console.error("error: " + response.statusCode);
                                }
                            }
                        );
                    },
                    function(callback) {
                        request.get(
                            urlUpload,
                            function (error, response) {
                                if (!error && response.statusCode === 200) {
                                    callback(null, JSON.parse(response.body));
                                } else {
                                    console.error("error: " + response.statusCode);
                                }
                            }
                        );
                    }
                ],
                function (err, results) {
                    var downloadResult = results[0];
                    var uploadResult = results[1];

                    var populationDensityDownload;
                    var populationDensityDownloadTotal = 0;
                    var communityTagDownload = UNKNOWN;
                    var communityTypeDownload = { comId: -1, comName: 'unknown', canId: -1, canName: 'unknown' };

                    var populationDensityUpload;
                    var populationDensityUploadTotal = 0;
                    var communityTagUpload = UNKNOWN;
                    var communityTypeUpload = { comId: -1, comName: 'unknown', canId: -1, canName: 'unknown' };

                    var i = 0;
                    var j = 0;

                    downloadResult.results.forEach(function (element) {
                        if(element.layerBodId === 'ch.are.bevoelkerungsdichte') {
                            i++;
                            populationDensityDownloadTotal += element.properties.popt_ha;
                        } else if(element.layerBodId === 'ch.are.gemeindetypen') {
                            communityTagDownload = getCommunityTypeTag(element.properties.typ_code);
                            communityTypeDownload.canName = element.properties.kt_kz;
                            communityTypeDownload.canId = element.properties.kt_no;
                            communityTypeDownload.comName = element.properties.label;
                            communityTypeDownload.comId = element.properties.bfs_no;
                        }
                    });

                    populationDensityDownload = i > 0 ? populationDensityDownloadTotal / i : populationDensityDownloadTotal;

                    uploadResult.results.forEach(function (element) {
                        if(element.layerBodId === 'ch.are.bevoelkerungsdichte') {
                            j++;
                            populationDensityUploadTotal += element.properties.popt_ha;
                        } else if(element.layerBodId === 'ch.are.gemeindetypen') {
                            communityTagUpload = getCommunityTypeTag(element.properties.typ_code);
                            communityTypeUpload.canName = element.properties.kt_kz;
                            communityTypeUpload.canId = element.properties.kt_no;
                            communityTypeUpload.comName = element.properties.label;
                            communityTypeUpload.comId = element.properties.bfs_no;
                        }
                    });

                    populationDensityUpload = j > 0 ? populationDensityUploadTotal / i : populationDensityUploadTotal;

                    var resultingTags = { download: {
                        pop:
                            {
                                number: Math.round(populationDensityDownload),
                                description: 'Number of people living in 1ha'
                            },
                        type: {
                            tag: communityTagDownload,
                            res: communityTypeDownload
                        }
                    }, upload: {
                        pop:
                            {
                                number: Math.round(populationDensityUpload),
                                description: 'Number of people living in 1ha'
                            },
                        type: {
                            tag: communityTagUpload,
                            res: communityTypeUpload
                        }
                    }};
                    callback(resultingTags);
                }
            );
        }
    );
}

function getCommunityTypeTag(number) {
    switch(number) {
        case "1":
            return LARGECENTRE;
        case "2":
            return BESIDESCENTREOFLARGECENTRE;
        case "3":
            return BELTOFLARGECENTRE;
        case "4":
            return MEDIUMCENTRE;
        case "5":
            return BELTOFMEDIUMCENTRE;
        case "6":
            return SMALLCENTRE;
        case "7":
            return PERIURBAN;
        case "8":
            return AGRICULTURAL;
        case "9":
            return TOURISTICAL;
        default:
            return UNKNOWN;
    }
}

function getBoundaryTag(designation) {
    var tagGrassland = GRASSLAND;
    var tagOther = OTHER;

    switch(designation) {
        case 'protected_area':
        case 'national_park':
        case 'nature_reserve':
            tagGrassland.osmValue = designation;
            return tagGrassland;
        default:
            tagOther.osmValue = designation;
            return tagOther;
    }
}

function getLeisureTag(designation) {
    var tagGrassland = GRASSLAND;
    var tagConstArea = CONSTRUCTEDAREA;
    var tagWater = WATER;
    var tagOther = OTHER;

    switch(designation) {
        case 'garden':
        case 'park':
        case 'nature_reserve':
        case 'golf_course':
        case 'miniature_golf':
        case 'recreation_ground':
        case 'dog_park':
            tagGrassland.osmValue = designation;
            return tagGrassland;
        case 'sports_centre':
        case 'stadium':
            tagConstArea.osmValue = designation;
            return tagConstArea;
        case 'swimming_pool':
        case 'marina':
        case 'water_park':
        case 'slipway':
            tagWater.osmValue = designation;
            return tagWater;
        default:
            tagOther.osmValue = designation;
            return tagOther;
    }
}

function getLanduseTag(designation) {
    var tagGrassland = GRASSLAND;
    var tagTrees = TREES;
    var tagConstArea = CONSTRUCTEDAREA;
    var tagWater = WATER;
    var tagOther = OTHER;

    switch(designation) {
        case 'meadow':
        case 'farmland':
        case 'grass':
        case 'farmyard':
        case 'allotments':
        case 'greenhouse_horticulture':
        case 'plant_nursery':
        case 'recreation_ground':
        case 'village_green':
        case 'greenfield':
        case 'conservation':
            tagGrassland.osmValue = designation;
            return tagGrassland;
        case 'forest':
        case 'vineyard':
        case 'orchard':
            tagTrees.osmValue = designation;
            return tagTrees;
        case 'residential':
        case 'industrial':
        case 'construction':
        case 'commercial':
        case 'quarry':
        case 'railway':
        case 'military':
        case 'retail':
        case 'landfill':
        case 'brownfield':
        case 'garages':
            tagConstArea.osmValue = designation;
            return tagConstArea;
        case 'basin':
        case 'reservoir':
            tagWater.osmValue = designation;
            return tagWater;
        default:
            tagOther.osmValue = designation;
            return tagOther;
    }
}

function getNaturalTag(designation) {
    var tagGrassland = GRASSLAND;
    var tagTrees = TREES;
    var tagWater = WATER;
    var tagRocks = ROCKS;
    var tagOther = OTHER;

    switch(designation) {
        case 'scrub':
        case 'grassland':
        case 'wetland':
        case 'fell':
        case 'heath':
        case 'meadow':
        case 'grass':
            tagGrassland.osmValue = designation;
            return tagGrassland;
        case 'wood':
        case 'tree':
        case 'tree_row':
            tagTrees.osmValue = designation;
            return tagTrees;
        case 'water':
            tagWater.osmValue = designation;
            return tagWater;
        case 'scree':
        case 'bare_rock':
        case 'shingle':
        case 'cliff':
        case 'rock':
        case 'stone':
            tagRocks.osmValue = designation;
            return tagRocks;
        default:
            tagOther.osmValue = designation;
            return tagOther;
    }
}

function prepareMiddlePointDbStatements(statement, positions) {
    var statements = [];

    var statement1 = statement
        .replace('{lat1}', positions[0].latitude)
        .replace('{lon1}', positions[0].longitude)
        .replace('{lat2}', positions[1].latitude)
        .replace('{lon2}', positions[1].longitude);

    var statement2 = statement
        .replace('{lat1}', positions[1].latitude)
        .replace('{lon1}', positions[1].longitude)
        .replace('{lat2}', positions[2].latitude)
        .replace('{lon2}', positions[2].longitude);

    statements.push(statement1, statement2);
    return statements;
}

function prepareNaturalDbStatements(statement, points) {
    var queries = [];

    var query1 = statement.replace('{point}', 'POINT(8.7048 47.3611)'); //sollte natural: wetland liefern
    var query2 = statement.replace('{point}', points[0][1][0].st_astext);

    queries.push(query1, query2);
    return queries;
}

function prepareLanduseDbStatements(statement, points) {
    var queries = [];

    var query1 = statement.replace('{point}', 'POINT(8.6875 47.2157)'); //sollte landuse: forest liefern
    var query2 = statement.replace('{point}', points[0][1][0].st_astext);

    queries.push(query1, query2);
    return queries;
}

function prepareBoundaryAndLeisureDbStatements(statement, points) {
    var queries = [];

    var query1 = statement.replace('{point}', 'POINT(8.55777 47.2495)'); //sollte boundary: protected_area und leisure: nature_reserve liefern
    var query2 = statement.replace('{point}', points[0][1][0].st_astext);

    queries.push(query1, query2);
    return queries;
}


function returnSurroundingsTag(downloadTag, uploadTag, callback) {
    var result = { download: { geo: downloadTag, osmValue: downloadTag.osmValue }, upload: { geo: uploadTag, osmValue: uploadTag.osmValue } };
    callback(result);
}

module.exports = { "getGeographicalSurroundings": getGeographicalSurroundings, "getGeoAdminData": getGeoAdminData };