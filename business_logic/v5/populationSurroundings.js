var db_access= require('../../persistence/dbAccess_v5');
var parallel = require('async/parallel');
var posHelper = require('./positionsHelper');
var queries = require('./dbQueries');
var request = require('request');
var converter = require('./wgs84_ch1903');


//Constants for community types:
const LARGE_CENTRE = {
    id: 1,
    type: 'Grosszentrum',
    description: 'Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)'
};

const NEIGHBORHOOD_CENTRE_OF_LARGE_CENTRE = {
    id: 2,
    type: 'Nebenzentrum eines Grosszentrums',
    description: 'Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)'
};

const BELT_OF_LARGE_CENTRE = {
    id: 3,
    type: 'Gürtel eines Grosszentrums',
    description: 'Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)'
};

const MEDIUM_CENTRE = {
    id: 4,
    type: 'Mittelzentrum',
    description: 'Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)'
};

const BELT_OF_MEDIUM_CENTRE = {
    id: 5,
    type: 'Gürtel eines Mittelzentrums',
    description: 'Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)'
};

const SMALL_CENTRE = {
    id: 6,
    type: 'Kleinzentrum',
    description: 'Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)'
};

const PERI_URBAN = {
    id: 7,
    type: 'Periurbane ländliche Gemeinde',
    description: 'Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)'
};

const AGRICULTURAL = {
    id: 8,
    type: 'Agrargemeinde',
    description: 'Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)'
};

const TOURISTICAL = {
    id: 9,
    type: 'Touristische Gemeinde',
    description: 'Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)'
};

const UNKNOWN = {
    id: -1,
    type: 'unknown',
    osm_key: 'unknown',
    osm_value: 'unknown',
    description: 'No tagging possible.'
};


const GEOADMIN_URL_BEVOELKERUNGSDICHTE = 'https://api3.geo.admin.ch/rest/services/all/MapServer/' +
    'identify?geometry={y},{x}&geometryFormat=geojson&geometryType=esriGeometryPoint&imageDisplay=1,1,1' +
    '&lang=de&layers=all:ch.are.bevoelkerungsdichte&mapExtent=0,0,1,1&returnGeometry=false&tolerance=300';

const GEOADMIN_URL_GEMEINDETYP = 'https://api3.geo.admin.ch/rest/services/all/MapServer/' +
    'identify?geometry={y},{x}&geometryFormat=geojson&geometryType=esriGeometryPoint&imageDisplay=1,1,1' +
    '&lang=de&layers=all:ch.are.gemeindetypen&mapExtent=0,0,1,1&returnGeometry=false&tolerance=0';



function getGeoAdminData(positions, callback) {

    var database = db_access.getDatabase(db_access.SWITZERLAND_DB);
    var queryPositions = posHelper.makeMultipoints(positions);

    db_access.queryMultipleParameterized(database, queries.FIND_MIDDLE_POINT, queryPositions, function (error, result) {

        if(error) {
            callback(error);
            return;
        }

        var urls = [];

        //download
        urls[0] = getGeoAdminURL(result[0][0], GEOADMIN_URL_BEVOELKERUNGSDICHTE);
        urls[1] = getGeoAdminURL(result[0][0], GEOADMIN_URL_GEMEINDETYP);

        //upload
        urls[2] = getGeoAdminURL(result[1][0], GEOADMIN_URL_BEVOELKERUNGSDICHTE);
        urls[3] = getGeoAdminURL(result[1][0], GEOADMIN_URL_GEMEINDETYP);


        var requestFunctions = getGeoAdminRequests(urls);

        parallel(requestFunctions,

            function (err, results) {

                var resultingTags = {
                    download: {
                        population_density: {
                            number: getPopulationDensity(results[0]),
                            description: 'Number of people living in 1ha',
                            probability: null
                        },
                        community_type: getCommunityTypeJSON(results[1])
                    },
                    upload: {
                        population_density: {
                            number: getPopulationDensity(results[2]),
                            description: 'Number of people living in 1ha',
                            probability: null
                        },
                        community_type: getCommunityTypeJSON(results[3])
                    }
                };

                callback(null, resultingTags);
            }
        );
    });
}

function getGeoAdminURL(point, URL) {

    var longitude = point.st_x;
    var latitude = point.st_y;

    var chY = converter.WGStoCHy(latitude, longitude);
    var chX = converter.WGStoCHx(latitude, longitude);

    return URL.replace('{y}', chY).replace('{x}', chX);
}

function getGeoAdminRequests(urls) {

    var requestFunctions = [];

    for(var i = 0; i < urls.length; i++) {

        requestFunctions[i] = (function (i) {
            return function(callback) {
                request.get(
                    urls[i],
                    function (error, response) {
                        if (!error && response.statusCode === 200) {
                            callback(null, JSON.parse(response.body));
                        } else {
                            console.error('error: ' + response.statusCode);
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

function getCommunityTypeJSON(geoAdminResult) {

    if(geoAdminResult.results.length === 0) {

        return {
            id: UNKNOWN.id,
            type: UNKNOWN.type,
            description: UNKNOWN.description,
            community_id: -1,
            community_name: 'unknown',
            canton_id: -1,
            canton_name: 'unknown',
            probability: null
        };
    }

    var community = geoAdminResult.results[0].properties;
    var communityType = getTypeTag(community.typ_code);

    return {
        id: communityType.id,
        type: communityType.type,
        description: communityType.description,
        community_id: community.bfs_no,
        community_name: community.label,
        canton_id: community.kt_no,
        canton_name: community.kt_kz,
        probability: null
    };
}

function getTypeTag(number) {

    switch(number) {
        case '1':
            return LARGE_CENTRE;
        case '2':
            return NEIGHBORHOOD_CENTRE_OF_LARGE_CENTRE;
        case '3':
            return BELT_OF_LARGE_CENTRE;
        case '4':
            return MEDIUM_CENTRE;
        case '5':
            return BELT_OF_MEDIUM_CENTRE;
        case '6':
            return SMALL_CENTRE;
        case '7':
            return PERI_URBAN;
        case '8':
            return AGRICULTURAL;
        case '9':
            return TOURISTICAL;
        default:
            return UNKNOWN;
    }
}



module.exports = {
    "getGeoAdminData": getGeoAdminData
};