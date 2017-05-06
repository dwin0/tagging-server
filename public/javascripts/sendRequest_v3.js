$(document).on('ready', function () {

    $('#submitButton').on('click', sendTaggingRequest);

    //Close result-view on click outside
    $(document).mouseup(function(e) {
        var container = $('#tagging-result');

        // if the target of the click isn't the container nor a descendant of the container
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            container.css('visibility', 'hidden');
            $('#darkLayer').css('display', 'none');
        }
    });
});


//Send POST-Request in specific format: taggingSchema_v1 in jsonSchemas.js
function sendTaggingRequest(event) {
    event.preventDefault();

    //show loading-spinner
    $('#loading-icon').css('display', 'inline');
    $('#darkLayer').css('display', 'inherit');

    var positions = [];

    for(var i = 1; i <= 8; i++) {
        var longitude = Number($('#longitude' + i).val());
        var latitude = Number($('#latitude' + i).val());
        var time = $('#time' + i).val();
        var phase = $('#phase' + i).val();

        positions[i-1] = { longitude: longitude, latitude: latitude, time: time, phase: phase };
    }

    $.ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ positions: positions }),
        url: "/api/v3.0/tag",
        success: function(data, text){
            renderResult(data);
        },
        error: function (request, status, error) {
            console.log(request.responseText);
        }
    });
}

function renderResult(data) {

    console.log(data);

    //hide loading-spinner
    $('#loading-icon').css('display', 'none');


    var taggingResult = $('#tagging-result').html('<div></div>');

    var resultList = $('<ul class="collection with-header"></ul>');
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

    resultList
        .append(header)
        .append(location)
        //.append(geographicalSurroundings)
        //.append(populationDensity)
        //.append(communityType)
        .append(typeOfMotion)
        .append(velocity);
    taggingResult.css('visibility', 'visible').html(resultList);
}