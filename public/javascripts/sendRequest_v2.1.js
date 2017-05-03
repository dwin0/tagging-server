$(document).on('ready', function () {

    $('#submitButton').on('click', sendTaggingRequest);
});


//Send POST-Request in specific format: taggingSchema_v1 in jsonSchemas.js
function sendTaggingRequest(event) {
    event.preventDefault();

    var positions = [];

    for(var i = 1; i <= 8; i++) {
        var longitude = $('#longitude' + i).val();
        var latitude = $('#latitude' + i).val();
        var time = $('#time' + i).val();

        positions[i-1] = { longitude: longitude, latitude: latitude, time: time };
    }

    var form = $("<form></form>");
    form.attr('method',"post");
    form.attr('action',"/api/v2.1/tag/view");

    var input = $("<input />");
    input.attr('name',"positions");
    input.attr('type',"hidden");
    input.attr('value', JSON.stringify(positions));

    form.append(input);
    $(document.body).append(form);
    form.submit();
}