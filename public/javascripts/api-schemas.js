$(document).on('ready', function () {

    $.ajax({
        type: "GET",
        url: "/schemas",
        success: function(data, text){

            //Insert schemas, possible input-values and possible output-values
            //Schema is loaded from server, possible values are static values
            insertJSON(data.taggingSchema, '#tagging-schema > p');
            insertJSON(data.speedCalculationSchema, '#speedCalculation-schema > p');
            insertJSON(data.surroundingsSchema, '#surroundings-schema > p');
            insertJSON(possibleTaggingInput, '#possible-tagging-input > p');
            insertJSON(possibleSpeedCalculationInput, '#possible-speedCalculation-input > p');
            insertJSON(possibleSurroundingsInput, '#possible-surroundings-input > p');
            insertJSON(possibleTaggingOutput, '#possible-tagging-output > p');
            insertJSON(possibleSpeedCalculationOutput, '#possible-speedCalculation-output > p');
            insertJSON(possibleSurroundingsOutput, '#possible-surroundings-output > p');
        },
        error: function (request, status, error) {
            console.error(request.responseText);
        }
    });

});

function insertJSON(json, id) {
    var jsonString = JSON.stringify(json, undefined, 4);
    $('<pre></pre>').insertAfter(id).html(syntaxHighlight(jsonString));
}

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


const possibleTaggingInput = {
    "positions": [
        {
            "longitude": 8.7095882,
            "latitude": 47.3589998,
            "time": "2017-03-28 07:31:44.0",
            "phase": "FCTStart"
        },
        {
            "longitude": 8.7095882,
            "latitude": 47.3589998,
            "time": "2017-03-28 07:31:44.0",
            "phase": "FCTEnd"
        },
        {
            "longitude": 8.7095882,
            "latitude": 47.3589998,
            "time": "2017-03-28 07:31:44.0",
            "phase": "DownloadStart"
        },
        {
            "longitude": 8.7135701,
            "latitude": 47.3530638,
            "time": "2017-03-28 07:31:54.0",
            "phase": "DownloadEnd"
        },
        {
            "longitude": 8.7135701,
            "latitude": 47.3530638,
            "time": "2017-03-28 07:31:54.0",
            "phase": "UploadStart"
        },
        {
            "longitude": 8.7165203,
            "latitude": 47.3516764,
            "time": "2017-03-28 07:32:06.0",
            "phase": "UploadEnd"
        },
        {
            "longitude": 8.7165203,
            "latitude": 47.3516764,
            "time": "2017-03-28 07:32:06.0",
            "phase": "RTTStart"
        },
        {
            "longitude": 8.7165203,
            "latitude": 47.3516764,
            "time": "2017-03-28 07:32:07.0",
            "phase": "RTTEnd"
        }
    ]
};
const possibleTaggingOutput = {
    "title": "Calculated Tagging",
    "location": {
        "id": 1,
        "name": "railway",
        "description": "Includes OpenStreetMap-Key:railway, Values: rail, light_rail, narrow_gauge, tram and subway.",
        "probability": 0.3333333333333333,
        "allProbabilities": {
            "railway": {
                "probability": 0.3333333333333333,
                "location": {
                    "id": 1,
                    "name": "railway",
                    "description": "Includes OpenStreetMap-Key:railway, Values: rail, light_rail, narrow_gauge, tram and subway."
                }
            }
        }
    },
    "type_of_motion": {
        "id": 4,
        "name": "high-speed_vehicular",
        "description": "120 km/h to 350km/h",
        "probability": null
    },
    "velocity": {
        "time_s": 23,
        "velocity_ms": 43.31952685695652,
        "velocity_kmh": 155.95029668504347,
        "probability": null
    },
    "surroundings": {
        "download": {
            "geographical_surroundings": {
                "id": 1,
                "name": "grassland",
                "osm_tag": "wetland",
                "description": "Includes OpenStreetMap-Key: landuse with the values: meadow, farmland, grass, farmyard, allotments, " +
                "greenhouse_horticulture, plant_nursery, recreation_ground, village_green, greenfield and conservation. Includes " +
                "OpenStreetMap-Key: natural with the values: scrub, grassland, wetland, fell, heath, meadow and grass. Includes " +
                "OpenStreetMap-Key: protected_area, national_park and nature_reserve. Includes OpenStreetMap-Key: leisure with the " +
                "values: garden, park, nature_reserve, golf_course, miniature_golf, recreation_ground and dog_park.",
                "probability": null
            },
            "population_density": {
                "number": 66.5,
                "description": "Number of people living in 1ha",
                "probability": null
            },
            "community_type": {
                "id": 2,
                "type": "Nebenzentrum eines Grosszentrums",
                "community_id": "198",
                "community_name": "Uster",
                "canton_id": "1",
                "canton_name": "ZH",
                "description": "Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)",
                "probability": null
            }
        },
        "upload": {
            "geographical_surroundings": {
                "id": 3,
                "name": "constructedArea",
                "osm_tag": "residential",
                "description": "Includes OpenStreetMap-Key: landuse with the values: residential, industrial, construction, commercial, " +
                "quarry, railway, military, retail, landfill, brownfield and garages. Includes OpenStreetMap-Key: leisure with the values: " +
                "sports_centre and stadium.",
                "probability": null
            },
            "population_density": {
                "number": 58,
                "description": "Number of people living in 1ha",
                "probability": null
            },
            "community_type": {
                "id": 2,
                "type": "Nebenzentrum eines Grosszentrums",
                "community_id": "198",
                "community_name": "Uster",
                "canton_id": "1",
                "canton_name": "ZH",
                "description": "Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)",
                "probability": null
            }
        }
    }
};

const possibleSpeedCalculationInput = {
    "positions": [
        {
            "longitude": 8.7135701,
            "latitude": 47.3530638,
            "time": "2017-03-28 07:31:54.0",
        },
        {
            "longitude": 8.7165203,
            "latitude": 47.3516764,
            "time": "2017-03-28 07:32:07.0",
        }
    ]
};


const possibleSpeedCalculationOutput = {
    "title": "Calculated velocity:",
    "distance_m": 271.06690764,
    "time_s": 13,
    "velocity_ms": 20.851300587692307,
    "velocity_kmh": 75.06468211569232,
    "probability": null
};

const possibleSurroundingsInput = {
    "positions": [
        {
            "longitude": 8.7095882,
            "latitude": 47.3589998,
            "phase": "FCTStart"
        },
        {
            "longitude": 8.7095882,
            "latitude": 47.3589998,
            "phase": "FCTEnd"
        },
        {
            "longitude": 8.7095882,
            "latitude": 47.3589998,
            "phase": "DownloadStart"
        },
        {
            "longitude": 8.7135701,
            "latitude": 47.3530638,
            "phase": "DownloadEnd"
        },
        {
            "longitude": 8.7135701,
            "latitude": 47.3530638,
            "phase": "UploadStart"
        },
        {
            "longitude": 8.7165203,
            "latitude": 47.3516764,
            "phase": "UploadEnd"
        },
        {
            "longitude": 8.7165203,
            "latitude": 47.3516764,
            "phase": "RTTStart"
        },
        {
            "longitude": 8.7165203,
            "latitude": 47.3516764,
            "phase": "RTTEnd"
        }
    ]
};
const possibleSurroundingsOutput = {
    "title": "Calculated Surroundings",
    "surroundings": {
        "download": {
            "geographical_surroundings": {
                "id": 1,
                "name": "grassland",
                "osm_tag": "wetland",
                "description": "Includes OpenStreetMap-Key: landuse with the values: meadow, farmland, grass, farmyard, allotments, " +
                "greenhouse_horticulture, plant_nursery, recreation_ground, village_green, greenfield and conservation. Includes " +
                "OpenStreetMap-Key: natural with the values: scrub, grassland, wetland, fell, heath, meadow and grass. Includes " +
                "OpenStreetMap-Key: protected_area, national_park and nature_reserve. Includes OpenStreetMap-Key: leisure with the " +
                "values: garden, park, nature_reserve, golf_course, miniature_golf, recreation_ground and dog_park.",
                "probability": null
            },
            "population_density": {
                "number": 66.5,
                "description": "Number of people living in 1ha",
                "probability": null
            },
            "community_type": {
                "id": 2,
                "type": "Nebenzentrum eines Grosszentrums",
                "community_id": "198",
                "community_name": "Uster",
                "canton_id": "1",
                "canton_name": "ZH",
                "description": "Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)",
                "probability": null
            }
        },
        "upload": {
            "geographical_surroundings": {
                "id": 3,
                "name": "constructedArea",
                "osm_tag": "residential",
                "description": "Includes OpenStreetMap-Key: landuse with the values: residential, industrial, construction, commercial, " +
                "quarry, railway, military, retail, landfill, brownfield and garages. Includes OpenStreetMap-Key: leisure with the values: " +
                "sports_centre and stadium.",
                "probability": null
            },
            "population_density": {
                "number": 58,
                "description": "Number of people living in 1ha",
                "probability": null
            },
            "community_type": {
                "id": 2,
                "type": "Nebenzentrum eines Grosszentrums",
                "community_id": "198",
                "community_name": "Uster",
                "canton_id": "1",
                "canton_name": "ZH",
                "description": "Tag is derived from: Gemeindetypologie ARE (Bundesamt für Raumentwicklung)",
                "probability": null
            }
        }
    }
};