$(document).on('ready', function () {

    var title = $(document).find("title").text();
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


//Send POST-Request in specific format: TAGGING_SCHEMA_V4 in jsonSchemas.js
function sendTaggingRequest(event) {

    event.preventDefault();
    showLoadingView();

    var positions = [];
    var numberOfPositions = getNumberOfPositions();

    for(var i = 1; i <= numberOfPositions; i++) {
        var longitude = Number($('#longitude' + i).val());
        var latitude = Number($('#latitude' + i).val());
        var horizontalAccuracy = Number($('#horizontalAccuracy' + i).val());
        var time = $('#time' + i).val();

        positions[i-1] = {
            longitude: longitude,
            latitude: latitude,
            horizontalAccuracy: horizontalAccuracy,
            time: time };
    }

    sendRequest("/api/v5.0/tag", { positions: positions }, renderTaggingResult);
}

//Send POST-Request in specific format: VELOCITY_SCHEMA_V3 in jsonSchemas.js
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

    sendRequest("/api/v5.0/calculateSpeed", { positions: positions }, renderSpeedCalculationResult);
}

//Send POST-Request in specific format: SURROUNDINGS_SCHEMA_V3 in jsonSchemas.js
function sendSurroundingsRequest(event) {

    event.preventDefault();
    showLoadingView();

    var positions = [];
    var numberOfPositions = getNumberOfPositions();

    for(var i = 1; i <= numberOfPositions; i++) {
        var longitude = Number($('#longitude' + i).val());
        var latitude = Number($('#latitude' + i).val());
        var horizontalAccuracy = Number($('#horizontalAccuracy' + i).val());
        var phase = $('#phase' + i).val();

        positions[i-1] = { longitude: longitude, latitude: latitude, horizontalAccuracy:horizontalAccuracy, phase: phase };
    }

    sendRequest("/api/v5.0/findSurroundings", { positions: positions }, renderSurroundingsResult);
}

function showLoadingView() {
    $('#loading-icon').css('display', 'inline');
    $('#loading-layer').css('display', 'inherit');
}

function sendRequest(url, sendData, successCallback) {

    $.ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(sendData),
        url: url,
        success: function(data){

            console.log(data);

            //hide loading-spinner
            $('#loading-icon').css('display', 'none');

            successCallback(data);
        },
        error: function (request) {

            console.error(request.responseText);

            $('#loading-icon').css('display', 'none');
            renderError(request.status, request.statusText, request.responseText);
        }
    });
}




function renderTaggingResult(data) {

    var header = $('<li class="collection-header"><h4>Tagging-Resultat:</h4></li>');

    var location = $('<li class="collection-item"><div>Lokation: ' + data.location.name + '<br />' +
        'Gewichtung: ' + data.location.weight + '</div></li>');

    var geographicalSurroundings = $('<li class="collection-item"><div>Geografische Umgebung: ' +
        data.surroundings.download.geographicalSurroundings.osmKey + ':' +
        data.surroundings.download.geographicalSurroundings.osmValue + '</div></li>');

    var populationDensity = $('<li class="collection-item"><div>Bevölkerungsdichte: ' +
        data.surroundings.download.populationDensity.number + '</div></li>');

    var communityName = $('<li class="collection-item"><div>Gemeinde: ' +
        data.surroundings.download.communityType.communityName + '</div></li>');

    var communityType = $('<li class="collection-item"><div>Gemeinde-Typ: ' +
        data.surroundings.download.communityType.type + '</div></li>');

    var typeOfMotion = $('<li class="collection-item"><div>Fortbewegungs-Typ: ' +
        data.typeOfMotion.name + '</div></li>');

    var velocity = $('<li class="collection-item"><div>Geschwindigkeit: ' +
        data.velocity.velocityKilometersPerHour + ' km/h</div></li>');

    renderResult([header, location, geographicalSurroundings, populationDensity, communityName, communityType,
        typeOfMotion, velocity]);
}

function renderSpeedCalculationResult(data) {

    var header = $('<li class="collection-header"><h4>Geschwindigkeits-Resultat:</h4></li>');

    var distanceMeters =
        $('<li class="collection-item"><div>Distanz: ' + data.distanceMeters + ' m</div></li>');
    var timeSeconds =
        $('<li class="collection-item"><div>Zeit: ' + data.timeSeconds + ' s</div></li>');
    var velocityMeterPerSecond =
        $('<li class="collection-item"><div>Geschwindigkeit: ' + data.velocityMeterPerSecond + ' m/s</div></li>');
    var velocityKilometersPerHour =
        $('<li class="collection-item"><div>Geschwindigkeit: ' + data.velocityKilometersPerHour + ' km/h</div></li>');

    renderResult([header, distanceMeters, timeSeconds, velocityMeterPerSecond, velocityKilometersPerHour]);
}

function renderSurroundingsResult(data) {

    var header = $('<li class="collection-header"><h4>Surroundings-Resultat:</h4></li>');

    var downloadGeographic = $('<li class="collection-item"><div>Download - Geografische Umgebung: ' +
        data.surroundings.download.geographicalSurroundings.osmKey + ':' +
        data.surroundings.download.geographicalSurroundings.osmValue + '</div></li>');

    var downloadPopulation = $('<li class="collection-item"><div>Download - Bevölkerungsdichte: ' +
        data.surroundings.download.populationDensity.number + '</div></li>');

    var downloadCommunityName = $('<li class="collection-item"><div>Download - Gemeinde: ' +
        data.surroundings.download.communityType.communityName + '</div></li>');

    var downloadCommunityType = $('<li class="collection-item"><div>Download - Gemeindetyp: ' +
        data.surroundings.download.communityType.type + '</div></li>');

    var uploadGeographic = $('<li class="collection-item"><div>Upload - Geografische Umgebung: ' +
        data.surroundings.upload.geographicalSurroundings.osmKey + ':' +
        data.surroundings.upload.geographicalSurroundings.osmValue + '</div></li>');

    var uploadPopulation = $('<li class="collection-item"><div>Upload - Bevölkerungsdichte: ' +
        data.surroundings.upload.populationDensity.number + '</div></li>');

    var uploadCommunityName = $('<li class="collection-item"><div>Upload - Gemeinde: ' +
        data.surroundings.upload.communityType.communityName + '</div></li>');

    var uploadCommunityType = $('<li class="collection-item"><div>Upload - Gemeindetyp: ' +
        data.surroundings.upload.communityType.type + '</div></li>');

    renderResult([header, downloadGeographic, downloadPopulation, downloadCommunityName, downloadCommunityType,
        uploadGeographic, uploadPopulation, uploadCommunityName, uploadCommunityType]);
}

function renderError(statusCode, statusText, responseText) {

    var header = $('<li class="collection-header error"><h4>Error:</h4></li>');

    var error = $('<li class="collection-item error"><div>Statuscode: ' + statusCode + ' - ' + statusText + '<br />'
        + responseText + '</div></li>');

    renderResult([header, error]);
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



function addResultViewListener() {

    //Close result-view on click outside
    $(document).mouseup(function(e) {
        var container = $('#result-view');
        var map = $('#map');

        //if the target of the click isn't the container nor a descendant of the container
        if (!container.is(e.target) && container.has(e.target).length === 0
        && !map.is(e.target) && map.has(e.target).length === 0) {
            container.css('visibility', 'hidden');
            $('#loading-layer').css('display', 'none');
        }
    });
}