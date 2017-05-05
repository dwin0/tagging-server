$(document).on('ready', function () {

    $('#submitButton').on('click', sendTaggingRequest);
});


//Send POST-Request in specific format: taggingSchema_v1 in jsonSchemas.js
function sendTaggingRequest(event) {
    event.preventDefault();

    var positions = [];

    for(var i = 1; i <= 8; i++) {
        var longitude = Number($('#longitude' + i).val());
        var latitude = Number($('#latitude' + i).val());
        var time = $('#time' + i).val();
        var phase = $('#phase' + i).val();

        //TODO: Check if any value is null
        //TODO: automatische zuweisung der 8 phasen

        positions[i-1] = { longitude: longitude, latitude: latitude, time: time, phase: phase };
    }

    $.ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ positions: positions }),
        url: "/api/v3.0/tag",
        success: function(data, text){
            console.log(data);
        },
        error: function (request, status, error) {
            console.log(request.responseText);
        }
    });
}