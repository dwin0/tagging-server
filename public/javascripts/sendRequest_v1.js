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
    }

    addResultViewListener();
});


function sendTaggingRequest(event) {

    event.preventDefault();
    showLoadingView();

    var positions = [];
    var numberOfPositions = getNumberOfPositions();

    for(var i = 1; i <= numberOfPositions; i++) {
        var longitude = Number($('#longitude' + i).val());
        var latitude = Number($('#latitude' + i).val());

        positions[i-1] = { longitude: longitude, latitude: latitude };
    }

    sendRequest("/api/v1.0/tag", { positions: positions }, renderTaggingResult);
}

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

    sendRequest("/api/v1.0/calculateSpeed", { positions: positions }, renderSpeedCalculationResult);
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

    renderResult([header, location]);
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




function showLoadingView() {
    $('#loading-icon').css('display', 'inline');
    $('#loading-layer').css('display', 'inherit');
}

function addResultViewListener() {

    //Close result-view on click outside
    $(document).mouseup(function(e) {
        var container = $('#result-view');

        // if the target of the click isn't the container nor a descendant of the container
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            container.css('visibility', 'hidden');
            $('#loading-layer').css('display', 'none');
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