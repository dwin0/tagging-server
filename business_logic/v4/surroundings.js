var db_access= require('../../persistence/db_access_v4');
var parallel = require("async/parallel");
var converter = require('./wgs84_ch1903');
var posHelper = require('./positionsHelper');
var request = require('request');


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

const OTHER = {
    id: 100,
    name:"other",
    osm_key: '',
    osm_value: '',
    description: "OSM-tag is defined, but not supported."
};

const UNKNOWN = {
    id: -1,
    name: "unknown",
    osm_key: 'unknown',
    osm_value: 'unknown',
    description: "No tagging possible."
};



const FIND_MIDDLE_POINT2 = "WITH middlePoint AS " +
    "(SELECT ST_Centroid(ST_GeomFromText($1, 4326))) " +
    "SELECT ST_AsText(st_centroid), ST_X(st_centroid), ST_Y(st_centroid) FROM middlePoint;";



//TODO: create Table where the not null part is precalculated
const NATURAL_QUERY = 'SELECT "natural" FROM surroundings ' +
                    'WHERE "natural" IS NOT NULL AND ST_Within(' +
                    'ST_GeomFromText((\'{point}\'), 4326), ' +
                    'ST_GeomFromEWKB(wkb_geometry));';

const BOUNDARY_QUERY = 'SELECT boundary FROM surroundings ' +
                    'WHERE boundary IS NOT NULL AND ST_Within(' +
                    'ST_GeomFromText((\'{point}\'), 4326), ' +
                    'ST_GeomFromEWKB(wkb_geometry));';

const LEISURE_QUERY = 'SELECT leisure FROM surroundings ' +
                    'WHERE leisure IS NOT NULL AND ST_Within(' +
                    'ST_GeomFromText((\'{point}\'), 4326), ' +
                    'ST_GeomFromEWKB(wkb_geometry))';

const LANDUSE_QUERY = 'SELECT landuse FROM surroundings ' +
                    'WHERE landuse IS NOT NULL AND ST_Within(' +
                    'ST_GeomFromText((\'{point}\'), 4326), ' +
                    'ST_GeomFromEWKB(wkb_geometry));';

//TODO: 2 Abfragen daraus erstellen
const GEOADMIN_URL = 'https://api3.geo.admin.ch/rest/services/all/MapServer/identify?geometry={y},{x}' +
    '&geometryFormat=geojson&geometryType=esriGeometryPoint&imageDisplay=1,1,1&lang=de&layers=all:ch.are.bevoelkerungsdichte,' +
    'ch.are.gemeindetypen&mapExtent=0,0,1,1&returnGeometry=false&tolerance=5';

function getGeographicalSurroundings(positions, callback) {

    var database = db_access.getDatabase(db_access.SWITZERLAND_DB);
    var queryPositions = posHelper.makeMultipoints(positions);

    parallel([
            function(callback) {
                db_access.queryMultipleParameterized(database, FIND_MIDDLE_POINT2, queryPositions, function (result) {
                    callback(null, result);
                });
            }
        ],
        function (err, results) {

            //TODO: make 1 function for all cases
            //TODO: put in parallel-call
            //TODO: x and y as arguments / remove st_asText from FIND_MIDDLE_POINT
            var naturalQueries = prepareNaturalDbStatements(NATURAL_QUERY, results);
            var boundaryQueries = prepareBoundaryAndLeisureDbStatements(BOUNDARY_QUERY, results);
            var leisureQueries = prepareBoundaryAndLeisureDbStatements(LEISURE_QUERY, results);
            var landuseQueries = prepareLanduseDbStatements(LANDUSE_QUERY, results);


            parallel([
                    function(callback) {
                        db_access.queryMultiple(db_access.getDatabase(db_access.SWITZERLAND_DB), boundaryQueries, function (result) {
                            callback(null, result);
                        });
                    },
                    function(callback) {
                        db_access.queryMultiple(db_access.getDatabase(db_access.SWITZERLAND_DB), leisureQueries, function (result) {
                            callback(null, result);
                        });
                    },
                    function(callback) {
                        db_access.queryMultiple(db_access.getDatabase(db_access.SWITZERLAND_DB), landuseQueries, function (result) {
                           callback(null, result);
                        });
                    },
                    function(callback) {
                        db_access.queryMultiple(db_access.getDatabase(db_access.SWITZERLAND_DB), naturalQueries, function (result) {
                            callback(null, result);
                        });
                    }
                ],
                function (err, results) { //TODO: check if multiple results

                    var resultingTagDownload = JSON.parse(JSON.stringify(UNKNOWN));
                    var resultingTagUpload = JSON.parse(JSON.stringify(UNKNOWN));

                    //TODO: Put in a separate function
                    //boundary
                    var boundaryDownload = results[0][0];
                    var boundaryUpload = results[0][1];

                    if(boundaryDownload.length) {
                        resultingTagDownload.osm_key = 'boundary';
                        resultingTagDownload.osm_value = boundaryDownload[0].boundary;
                        resultingTagDownload.description = null; //TODO
                    }
                    if(boundaryUpload.length) {
                        resultingTagUpload.osm_key = 'boundary';
                        resultingTagUpload.osm_value = boundaryUpload[0].boundary;
                        resultingTagUpload.description = null; //TODO
                    }


                    //natural
                    var naturalDownload = results[3][0];
                    var naturalUpload = results[3][1];

                    if(naturalDownload.length) {
                        resultingTagDownload.osm_key = 'natural';
                        resultingTagDownload.osm_value = naturalDownload[0].natural;
                        resultingTagDownload.description = null; //TODO
                    }
                    if(naturalUpload.length) {
                        resultingTagUpload.osm_key = 'natural';
                        resultingTagUpload.osm_value = naturalUpload[0].natural;
                        resultingTagUpload.description = null; //TODO
                    }


                   //leisure
                    var leisureDownload = results[1][0];
                    var leisureUpload = results[1][1];

                    if(leisureDownload.length) {
                        resultingTagDownload.osm_key = 'leisure';
                        resultingTagDownload.osm_value = leisureDownload[0].leisure;
                        resultingTagDownload.description = null; //TODO
                    }
                    if(leisureUpload.length) {
                        resultingTagUpload.osm_key = 'leisure';
                        resultingTagUpload.osm_value = leisureUpload[0].leisure;
                        resultingTagUpload.description = null; //TODO
                    }


                    //landuse
                    var landuseDownload = results[2][0];
                    var landuseUpload = results[2][1];

                    if(landuseDownload.length) {
                        resultingTagDownload.osm_key = 'landuse';
                        resultingTagDownload.osm_value = landuseDownload[0].landuse;
                        resultingTagDownload.description = null; //TODO
                    }
                    if(landuseUpload.length) {
                        resultingTagUpload.osm_key = 'landuse';
                        resultingTagUpload.osm_value = landuseUpload[0].landuse;
                        resultingTagUpload.description = null; //TODO
                    }

                    returnSurroundingsTag(resultingTagDownload, resultingTagUpload, callback);
                }
            );
        }
    );
}

function getGeoAdminData(positions, callback) {

    var database = db_access.getDatabase(db_access.SWITZERLAND_DB);
    var queryPositions = posHelper.makeMultipoints(positions);

    parallel([
            function(callback) {
                db_access.queryMultipleParameterized(database, FIND_MIDDLE_POINT2, queryPositions, function (result) {
                    callback(null, result);
                });
            }
        ],
        function (err, results) {
            var lonDownload = results[0][0][0].st_x;
            console.log(results[0][0][0].st_x);
            var latDownload = results[0][0][0].st_y;
            console.log(results[0][0][0].st_y);

            var lonUpload = results[0][1][0].st_x;
            var latUpload = results[0][1][0].st_y;

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
                            { number: populationDensityDownload, description: 'Number of people living in 1ha' },
                        type: { tag: communityTagDownload, res: communityTypeDownload }
                    }, upload: {
                        pop:
                            { number: populationDensityUpload, description: 'Number of people living in 1ha' },
                        type: { tag: communityTagUpload, res: communityTypeUpload }
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



//TODO: make one dbStatement --> multiple queries are now used to test whether query is working right with default values
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
    var result = {
        download: { osm_key: downloadTag.osm_key, osm_value: downloadTag.osm_value, description: downloadTag.description },
        upload: { osm_key: uploadTag.osm_key, osm_value: uploadTag.osm_value, description: uploadTag.description } };
    callback(result);
}

module.exports = { "getGeographicalSurroundings": getGeographicalSurroundings, "getGeoAdminData": getGeoAdminData };