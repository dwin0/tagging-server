var db_access= require('../../persistence/db_access_v4');
var parallel = require("async/parallel");
var posHelper = require('./positionsHelper');
var queries = require('./dbQueries');
var request = require('request');
var converter = require('./wgs84_ch1903');


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

const UNKNOWN = {
    id: -1,
    name: "unknown",
    osm_key: 'unknown',
    osm_value: 'unknown',
    description: "No tagging possible."
};


//TODO: in doku -> wenn gemeindetyp [], sehr wahrscheinlich see
const GEOADMIN_URL_BEVOELKERUNGSDICHTE = 'https://api3.geo.admin.ch/rest/services/all/MapServer/identify?geometry={y},{x}' +
    '&geometryFormat=geojson&geometryType=esriGeometryPoint&imageDisplay=1,1,1&lang=de&layers=all:ch.are.bevoelkerungsdichte' +
    '&mapExtent=0,0,1,1&returnGeometry=false&tolerance=300';

const GEOADMIN_URL_GEMEINDETYP = 'https://api3.geo.admin.ch/rest/services/all/MapServer/identify?geometry={y},{x}' +
    '&geometryFormat=geojson&geometryType=esriGeometryPoint&imageDisplay=1,1,1&lang=de&layers=all:ch.are.gemeindetypen' +
    '&mapExtent=0,0,1,1&returnGeometry=false&tolerance=0';



function getGeoAdminData(positions, callback) {

    var database = db_access.getDatabase(db_access.SWITZERLAND_DB);
    var queryPositions = posHelper.makeMultipoints(positions);

    parallel([
            function(callback) {
                db_access.queryMultipleParameterized(database, queries.FIND_MIDDLE_POINT, queryPositions, function (result) {
                    callback(null, result);
                });
            }
        ],
        function (err, results) {

            var requests = [];

            //download
            requests[0] = getGeoAdminURL(results[0][0][0], GEOADMIN_URL_BEVOELKERUNGSDICHTE);
            requests[1] = getGeoAdminURL(results[0][0][0], GEOADMIN_URL_GEMEINDETYP);

            //upload
            requests[2] = getGeoAdminURL(results[0][1][0], GEOADMIN_URL_BEVOELKERUNGSDICHTE);
            requests[3] = getGeoAdminURL(results[0][1][0], GEOADMIN_URL_GEMEINDETYP);


            var requestFunctions = getGeoAdminRequests(requests);

            parallel(requestFunctions,

                function (err, results) {

                    var resultingTags = {
                        download: {
                            pop: {
                                number: getPopulationDensity(results[0]),
                                description: 'Number of people living in 1ha'
                            },
                            type: getCommunityType(results[1])
                        },
                        upload: {
                            pop: {
                                number: getPopulationDensity(results[2]),
                                description: 'Number of people living in 1ha'
                            },
                            type: getCommunityType(results[3])
                        }
                    };

                    callback(resultingTags);
                }
            );
        }
    );
}


function getGeoAdminURL(point, URL) {

    var longitude = point.st_x;
    var latitude = point.st_y;

    var chY = converter.WGStoCHy(latitude, longitude);
    var chX = converter.WGStoCHx(latitude, longitude);

    return URL.replace('{y}', chY).replace('{x}', chX);
}

function getGeoAdminRequests(requests) {

    var requestFunctions = [];

    for(var i = 0; i < requests.length; i++) {

        requestFunctions[i] = (function (i) {
            return function(callback) {
                request.get(
                    requests[i],
                    function (error, response) {
                        if (!error && response.statusCode === 200) {
                            callback(null, JSON.parse(response.body));
                        } else {
                            console.error("error: " + response.statusCode);
                        }
                    }
                );
            };
        })(i);
    }

    return requestFunctions;
}



function getPopulationDensity(geoAdminResult) {

    var total = 0;

    geoAdminResult.results.forEach(function (res) {
        total += res.properties.popt_ha;
    });

    return Math.round(total / geoAdminResult.results.length);
}

function getCommunityType(geoAdminResult) {

    if(geoAdminResult.results.length === 0) {

        return {
            tag: UNKNOWN,
            res: {
                cantonName: 'unknown',
                cantonId: -1,
                communityName: 'unknown',
                communityId: -1
            }
        };
    }

    var community = geoAdminResult.results[0].properties;

    return {
        tag: getCommunityTypeTag(community.typ_code),
        res: {
            cantonName: community.kt_kz,
            cantonId: community.kt_no,
            communityName: community.label,
            communityId: community.bfs_no
        }
    };
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



module.exports = { "getGeoAdminData": getGeoAdminData };