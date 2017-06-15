/**
 * This module is responsible to send tagging-, speedCalculation-, and surroundings-requests to the server and
 * display the result.
 * @module public/javascripts/sendRequest
 */


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


/**
 * Collects all tagging-form-values and sends these in the required form (TAGGING_SCHEMA in jsonSchemas.js).
 * @param {object} event - event-object of button-click
 */
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

    sendRequest("/api/v5.1/tag", { positions: positions }, renderTaggingResult);
}

/**
 * Collects all speedCalculation-form-values and sends these in the required form (VELOCITY_SCHEMA in jsonSchemas.js).
 * @param {object} event - event-object of button-click
 */
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

    sendRequest("/api/v5.1/calculateSpeed", { positions: positions }, renderSpeedCalculationResult);
}

/**
 * Collects all surroundings-form-values and sends these in the required form (TAGGING_SCHEMA in jsonSchemas.js).
 * @param {object} event - event-object of button-click
 */
function sendSurroundingsRequest(event) {

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

    sendRequest("/api/v5.1/findSurroundings", { positions: positions }, renderSurroundingsResult);
}

/**
 * Displays a white layer and a loading-spinner in the foreground.
 */
function showLoadingView() {
    $('#loading-icon').css('display', 'inline');
    $('#loading-layer').css('display', 'inherit');
}

/**
 * Sends the collected form-data to the specified URL.
 * @param {string} url - URL to send the data to
 * @param {object} sendData - POST-data to send
 * @param {function} successCallback - function which will be called with the result of type object
 */
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

            var response = JSON.parse(request.responseText);

            console.error(response.error);

            $('#loading-icon').css('display', 'none');
            renderError(request.status, request.statusText, response.error);
        }
    });
}



/**
 * Displays the tagging-result received by the server.
 * @param {object} data - tagging-result
 */
function renderTaggingResult(data) {

    var header = $('<li class="collection-header"><h4>Tagging-Resultat:</h4></li>');

    var location = $('<li class="collection-item"><div>Lokation: ' + data.location.name + '<br />' +
        'Gewichtung: ' + data.location.weight + '</div></li>');

    var geographicalSurroundings = $('<li class="collection-item"><div>Geografische Umgebung: ' +
        data.surroundings.download.geographicalSurroundings.osmKey + ':' +
        data.surroundings.download.geographicalSurroundings.osmValue + '</div></li>');

    var populationDensity = $('<li class="collection-item"><div>Bevölkerungsdichte: ' +
        data.surroundings.download.populationDensity.number + ' Personen pro Hektar (Durchschnitt über 300m Radius)</div></li>');

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

/**
 * Displays the speedCalculation-result received by the server.
 * @param {object} data - speedCalculation-result
 */
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

/**
 * Displays the surroundings-result received by the server.
 * @param {object} data - surroundings-result
 */
function renderSurroundingsResult(data) {

    var header = $('<li class="collection-header"><h4>Surroundings-Resultat:</h4></li>');

    var downloadGeographic = $('<li class="collection-item"><div>Download - Geografische Umgebung: ' +
        data.surroundings.download.geographicalSurroundings.osmKey + ':' +
        data.surroundings.download.geographicalSurroundings.osmValue + '</div></li>');

    var downloadPopulation = $('<li class="collection-item"><div>Download - Bevölkerungsdichte: ' +
        data.surroundings.download.populationDensity.number + ' Personen pro Hektar (Durchschnitt über 300m Radius)</div></li>');

    var downloadCommunityName = $('<li class="collection-item"><div>Download - Gemeinde: ' +
        data.surroundings.download.communityType.communityName + '</div></li>');

    var downloadCommunityType = $('<li class="collection-item"><div>Download - Gemeindetyp: ' +
        data.surroundings.download.communityType.type + '</div></li>');

    var uploadGeographic = $('<li class="collection-item"><div>Upload - Geografische Umgebung: ' +
        data.surroundings.upload.geographicalSurroundings.osmKey + ':' +
        data.surroundings.upload.geographicalSurroundings.osmValue + '</div></li>');

    var uploadPopulation = $('<li class="collection-item"><div>Upload - Bevölkerungsdichte: ' +
        data.surroundings.upload.populationDensity.number + ' Personen pro Hektar (Durchschnitt über 300m Radius)</div></li>');

    var uploadCommunityName = $('<li class="collection-item"><div>Upload - Gemeinde: ' +
        data.surroundings.upload.communityType.communityName + '</div></li>');

    var uploadCommunityType = $('<li class="collection-item"><div>Upload - Gemeindetyp: ' +
        data.surroundings.upload.communityType.type + '</div></li>');

    renderResult([header, downloadGeographic, downloadPopulation, downloadCommunityName, downloadCommunityType,
        uploadGeographic, uploadPopulation, uploadCommunityName, uploadCommunityType]);
}

/**
 * Displays the server-error which happend during sendRequest.
 * @param {number} statusCode - status-code received by the server
 * @param {string} statusText - status-text received by the server
 * @param {string} responseText - response-text received by the server
 */
function renderError(statusCode, statusText, responseText) {

    console.log(typeof statusCode + ', ' + typeof statusText + ', ' + typeof responseText);

    var header = $('<li class="collection-header error"><h4>Error:</h4></li>');

    var error = $('<li class="collection-item error"><div>Statuscode: ' + statusCode + ' - ' + statusText + '<br />'
        + responseText + '</div></li>');

    renderResult([header, error]);
}

/**
 * Displays all jQuery-elements in the argument to the result-view.
 * @param {Array} appendArray - array containing all jQuery-elements to display
 */
function renderResult(appendArray) {

    var resultView = $('#result-view').html('<div></div>');
    var resultList = $('<ul class="collection with-header"></ul>');

    appendArray.forEach(function (element) {
        resultList
            .append(element);
    });

    resultView.css('visibility', 'visible').html(resultList);
}


/**
 * Closes the result-view on click outside.
 */
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