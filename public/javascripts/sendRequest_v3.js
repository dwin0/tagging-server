$(document).on('ready', function () {

    var title = $('#title').html();
    var submitButton = $('#submitButton');

    switch (title) {
        case 'Tagging-Server':
            submitButton.on('click', sendTaggingRequest);
            break;
        case 'Geschwindigkeitsberechnung':
            submitButton.on('click', sendSpeedCalculationRequest);
            break;
        case 'Umgebungsabfrage':
            submitButton.on('click', sendSurroundingsRequest);
            break;
    }

    addResultViewListener();
});


//Send POST-Request in specific format: taggingSchema_v3 in jsonSchemas.js
function sendTaggingRequest(event) {

    event.preventDefault();
    showLoadingView();

    var positions = [];
    var numberOfPositions = getNumberOfPositions();

    for(var i = 1; i <= numberOfPositions; i++) {
        var longitude = Number($('#longitude' + i).val());
        var latitude = Number($('#latitude' + i).val());
        var time = $('#time' + i).val();
        var phase = $('#phase' + i).val();

        positions[i-1] = { longitude: longitude, latitude: latitude, time: time, phase: phase };
    }

    sendRequest("/api/v3.0/tag", { positions: positions }, renderTaggingResult);
}

//Send POST-Request in specific format: velocitySchema_v3 in jsonSchemas.js
function sendSpeedCalculationRequest(event) {

    event.preventDefault();
    showLoadingView();

    var positions = [];
    var numberOfPositions = getNumberOfPositions();

    for(var i = 1; i <= numberOfPositions; i++) {
        var longitude = Number($('#longitude' + i).val());
        var latitude = Number($('#latitude' + i).val());
        var time = $('#time' + i).val();

        positions[i-1] = { longitude: longitude, latitude: latitude, time: time };
    }

    sendRequest("/api/v3.0/calculateSpeed", { positions: positions }, renderSpeedCalculationResult);
}

//Send POST-Request in specific format: surroundingsSchema_v3 in jsonSchemas.js
function sendSurroundingsRequest(event) {

    event.preventDefault();
    showLoadingView();

    var positions = [];
    var numberOfPositions = getNumberOfPositions();

    for(var i = 1; i <= numberOfPositions; i++) {
        var longitude = Number($('#longitude' + i).val());
        var latitude = Number($('#latitude' + i).val());
        var phase = $('#phase' + i).val();

        positions[i-1] = { longitude: longitude, latitude: latitude, phase: phase };
    }

    sendRequest("/api/v3.0/findSurroundings", { positions: positions }, renderSurroundingsResult);
}

function sendRequest(url, sendData, successCallback) {

    $.ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(sendData),
        url: url,
        success: function(data, text){

            console.log(data);

            //hide loading-spinner
            $('#loading-icon').css('display', 'none');

            successCallback(data);
        },
        error: function (request, status, error) {
            console.log(request.responseText);
        }
    });
}




function renderTaggingResult(data) {

    var header = $('<li class="collection-header"><h4>Tagging-Resultat:</h4></li>');

    var location = $('<li class="collection-item"><div>Lokation: ' + data.location.name + '<br />' +
        'Wahrscheinlichkeit: ' + data.location.probability + '</div></li>');

    /*TODO: Un-Comment
    var geographicalSurroundings = $('<li class="collection-item"><div>Geografische Umgebung: ' + data.surroundings.surroundings_download.geographical_surroundings.name + '<br />' +
        'Wahrscheinlichkeit: ' + data.surroundings.surroundings_download.geographical_surroundings.probability + '</div></li>');

    var populationDensity = $('<li class="collection-item"><div>Bevölkerungsdichte: ' + data.surroundings.surroundings_download.population_density.number + '<br />' +
        'Wahrscheinlichkeit: ' + data.surroundings.surroundings_download.population_density.probability + '</div></li>');

    var communityType = $('<li class="collection-item"><div>Gemeinde-Typ: ' + data.surroundings.surroundings_download.community_type.type + '<br />' +
        'Wahrscheinlichkeit: ' + data.surroundings.surroundings_download.community_type.probability + '</div></li>');
    */

    var typeOfMotion = $('<li class="collection-item"><div>Fortbewegungs-Typ: ' + data.type_of_motion.name + '<br />' +
        'Wahrscheinlichkeit: ' + data.type_of_motion.probability + '</div></li>');

    var velocity = $('<li class="collection-item"><div>Geschwindigkeit: ' + data.velocity.velocity_kmh + ' km/h<br />' +
        'Wahrscheinlichkeit: ' + data.velocity.probability + '</div></li>');

    renderResult([header, location, typeOfMotion, velocity]);
}

function renderSpeedCalculationResult(data) {

    var header = $('<li class="collection-header"><h4>Geschwindigkeits-Resultat:</h4></li>');

    var distance_m = $('<li class="collection-item"><div>Distanz: ' + data.distance_m + ' m</div></li>');
    var time_s = $('<li class="collection-item"><div>Zeit: ' + data.time_s + ' s</div></li>');
    var velocity_ms = $('<li class="collection-item"><div>Geschwindigkeit: ' + data.velocity_ms + ' m/s</div></li>');
    var velocity_kmh = $('<li class="collection-item"><div>Geschwindigkeit: ' + data.velocity_kmh + ' km/h</div></li>');
    var probability = $('<li class="collection-item"><div>Wahrscheinlichkeit: ' + data.probability + '</div></li>');

    renderResult([distance_m, time_s, velocity_ms, velocity_kmh, probability]);
}

function renderSurroundingsResult(data) {

    var header = $('<li class="collection-header"><h4>Surroundings-Resultat:</h4></li>');

    var download_geographic = $('<li class="collection-item"><div>Download - Geografische Umgebung: ' + data.surroundings.download.geographical_surroundings.name + '<br />' +
        'Wahrscheinlichkeit: ' + data.surroundings.download.geographical_surroundings.probability + '</div></li>');

    var download_population = $('<li class="collection-item"><div>Download - Bevölkerungsdichte: ' + data.surroundings.download.population_density.number + '<br />' +
        'Wahrscheinlichkeit: ' + data.surroundings.download.population_density.probability + '</div></li>');

    var download_community = $('<li class="collection-item"><div>Download - Gemeindetyp: ' + data.surroundings.download.community_type.type + '<br />' +
        'Wahrscheinlichkeit: ' + data.surroundings.download.community_type.probability + '</div></li>');

    var upload_geographic = $('<li class="collection-item"><div>Upload - Geografische Umgebung: ' + data.surroundings.upload.geographical_surroundings.name + '<br />' +
        'Wahrscheinlichkeit: ' + data.surroundings.upload.geographical_surroundings.probability + '</div></li>');

    var upload_population = $('<li class="collection-item"><div>Upload - Bevölkerungsdichte: ' + data.surroundings.upload.population_density.number + '<br />' +
        'Wahrscheinlichkeit: ' + data.surroundings.upload.population_density.probability + '</div></li>');

    var upload_community = $('<li class="collection-item"><div>Upload - Gemeindetyp: ' + data.surroundings.upload.community_type.type + '<br />' +
        'Wahrscheinlichkeit: ' + data.surroundings.upload.community_type.probability + '</div></li>');

    renderResult([header,
        download_geographic, download_population, download_community,
        upload_geographic, upload_population, upload_community]);
}

function renderResult(appendArray) {

    var resultView = $('#result-view').html('<div></div>');
    var resultList = $('<ul class="collection with-header"></ul>');

    appendArray.forEach(function (element) {
        resultList
            .append(element);
    });

    resultView.css('visibility', 'visible').html(resultList);
}




function showLoadingView() {
    $('#loading-icon').css('display', 'inline');
    $('#darkLayer').css('display', 'inherit');
}

function addResultViewListener() {

    //Close result-view on click outside
    $(document).mouseup(function(e) {
        var container = $('#result-view');

        // if the target of the click isn't the container nor a descendant of the container
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            container.css('visibility', 'hidden');
            $('#darkLayer').css('display', 'none');
        }
    });
}




function getNumberOfPositions() {

    var numberOfPositions = 0;
    var morePositions = true;
    while(morePositions) {
        //check for positions with id 'longitude1'
        if($('#longitude' + (numberOfPositions + 1)).length) {
            numberOfPositions++;
        } else {
            morePositions = false;
        }
    }

    return numberOfPositions;
}