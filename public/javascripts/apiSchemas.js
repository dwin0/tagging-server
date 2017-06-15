/**
 * This module is responsible to load and display all json-schemas, possible input values and possible output values
 * in the api description.
 * @module public/javascripts/apiSchemas
 */


$(document).ready(function () {

    $.ajax({
        type: "GET",
        url: "/schemas",
        success: function(data) {

            //Insert schemas, possible input-values and possible output-values
            //Schema is loaded from server, possible values are static values
            insertJSON(data.taggingSchema, '#tagging-schema > p');
            insertJSON(data.speedCalculationSchema, '#speedCalculation-schema > p');
            insertJSON(data.surroundingsSchema, '#surroundings-schema > p');
            insertJSON(POSSIBLE_TAGGING_INPUT, '#possible-tagging-input > p');
            insertJSON(POSSIBLE_SPEED_CALCULATION_INPUT, '#possible-speedCalculation-input > p');
            insertJSON(POSSIBLE_TAGGING_INPUT, '#possible-surroundings-input > p');
            insertJSON(POSSIBLE_TAGGING_OUTPUT, '#possible-tagging-output > p');
            insertJSON(POSSIBLE_SPEED_CALCULATION_OUTPUT, '#possible-speedCalculation-output > p');
            insertJSON(POSSIBLE_SURROUNDINGS_OUTPUT, '#possible-surroundings-output > p');
        },
        error: function (request) {
            console.error(request.responseText);
        }
    });

});

/**
 * Syntax-Highlights the json-object and inserts it.
 * @param {object} json - json-object to insert
 * @param {string} id - id of element after which the json is inserted
 */
function insertJSON(json, id) {
    var jsonString = JSON.stringify(json, null, 4);
    $('<pre></pre>').insertAfter(id).html(syntaxHighlight(jsonString));
}

/**
 * Highlights json-keywords and json-types with separate colours. Uses span-elements and CSS-classes.
 * @param {object} json - object to highlight
 * @returns {string} syntax-highlighted json as string that includes HTML-Elements
 */
function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}


const POSSIBLE_TAGGING_INPUT = {
    "positions": [
        {
            "longitude": 8.7095882,
            "latitude": 47.3589998,
            "horizontalAccuracy": 800,
            "time": "2017-03-28 07:31:44.0"
        },
        {
            "longitude": 8.7095882,
            "latitude": 47.3589998,
            "horizontalAccuracy": 800,
            "time": "2017-03-28 07:31:44.0"
        },
        {
            "longitude": 8.7095882,
            "latitude": 47.3589998,
            "horizontalAccuracy": 800,
            "time": "2017-03-28 07:31:44.0"
        },
        {
            "longitude": 8.7135701,
            "latitude": 47.3530638,
            "horizontalAccuracy": 98.4000015258789,
            "time": "2017-03-28 07:31:54.0"
        },
        {
            "longitude": 8.7135701,
            "latitude": 47.3530638,
            "horizontalAccuracy": 98.4000015258789,
            "time": "2017-03-28 07:31:54.0"
        },
        {
            "longitude": 8.7165203,
            "latitude": 47.3516764,
            "horizontalAccuracy": 82.5,
            "time": "2017-03-28 07:32:06.0"
        },
        {
            "longitude": 8.7165203,
            "latitude": 47.3516764,
            "horizontalAccuracy": 82.5,
            "time": "2017-03-28 07:32:06.0"
        },
        {
            "longitude": 8.7165203,
            "latitude": 47.3516764,
            "horizontalAccuracy": 82.5,
            "time": "2017-03-28 07:32:07.0"
        }
    ]
};

const POSSIBLE_TAGGING_OUTPUT = {
    "title": "Calculated Tagging",
    "location": {
        "id": 1,
        "name": "railway",
        "description": "Includes OpenStreetMap-Key: railway, Values: rail, light_rail, narrow_gauge, tram and subway.",
        "weight": 0.52,
        "allWeights": {
            "railway": {
                "weight": 0.52
            },
            "street": {
                "weight": 0
            },
            "building": {
                "weight": 0
            }
        }
    },
    "typeOfMotion": {
        "id": 4,
        "name": "high-speed-vehicular",
        "description": "140 km/h to 450km/h"
    },
    "velocity": {
        "distanceMeters": 996,
        "timeSeconds": 22,
        "velocityMeterPerSecond": 45,
        "velocityKilometersPerHour": 163
    },
    "surroundings": {
        "download": {
            "populationDensity": {
                "number": 73,
                "description": "Average of persons living in 1ha based on a radius-search of 300 meters."
            },
            "communityType": {
                "id": 2,
                "type": "Nebenzentrum eines Grosszentrums",
                "description": "Tag comes from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)",
                "communityId": "198",
                "communityName": "Uster",
                "cantonId": "1",
                "cantonName": "ZH"
            },
            "geographicalSurroundings": {
                "osmKey": "landuse",
                "osmValue": "residential",
                "description": "Tag comes from: OpenStreetMap"
            }
        },
        "upload": {
            "populationDensity": {
                "number": 64,
                "description": "Average of persons living in 1ha based on a radius-search of 300 meters."
            },
            "communityType": {
                "id": 2,
                "type": "Nebenzentrum eines Grosszentrums",
                "description": "Tag comes from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)",
                "communityId": "198",
                "communityName": "Uster",
                "cantonId": "1",
                "cantonName": "ZH"
            },
            "geographicalSurroundings": {
                "osmKey": "landuse",
                "osmValue": "residential",
                "description": "Tag comes from: OpenStreetMap"
            }
        }
    }
};



const POSSIBLE_SPEED_CALCULATION_INPUT = {
    "positions": [
        {
            "longitude": 8.7135701,
            "latitude": 47.3530638,
            "time": "2017-03-28 07:31:54.0"
        },
        {
            "longitude": 8.7165203,
            "latitude": 47.3516764,
            "time": "2017-03-28 07:32:07.0"
        }
    ]
};

const POSSIBLE_SPEED_CALCULATION_OUTPUT = {
    "distanceMeters": 271,
    "timeSeconds": 13,
    "velocityMeterPerSecond": 21,
    "velocityKilometersPerHour": 75
};



const POSSIBLE_SURROUNDINGS_OUTPUT = {
    "title": "Calculated Surroundings",
    "surroundings": {
        "download": {
            "populationDensity": {
                "number": 73,
                "description": "Average of persons living in 1ha based on a radius-search of 300 meters."
            },
            "communityType": {
                "id": 2,
                "type": "Nebenzentrum eines Grosszentrums",
                "description": "Tag comes from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)",
                "communityId": "198",
                "communityName": "Uster",
                "cantonId": "1",
                "cantonName": "ZH"
            },
            "geographicalSurroundings": {
                "osmKey": "landuse",
                "osmValue": "residential",
                "description": "Tag comes from: OpenStreetMap"
            }
        },
        "upload": {
            "populationDensity": {
                "number": 64,
                "description": "Average of persons living in 1ha based on a radius-search of 300 meters."
            },
            "communityType": {
                "id": 2,
                "type": "Nebenzentrum eines Grosszentrums",
                "description": "Tag comes from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)",
                "communityId": "198",
                "communityName": "Uster",
                "cantonId": "1",
                "cantonName": "ZH"
            },
            "geographicalSurroundings": {
                "osmKey": "landuse",
                "osmValue": "residential",
                "description": "Tag comes from: OpenStreetMap"
            }
        }
    }
};