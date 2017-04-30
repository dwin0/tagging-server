document.getElementById('submitButton').addEventListener('click', sendTaggingRequest);

//Send POST-Request in specific format: taggingSchema_v1 in jsonSchemas.js
function sendTaggingRequest() {

    var positions = [];

    for(var i = 1; i <= 8; i++) {
        var longitude = document.getElementById('longitude' + i).value;
        var latitude = document.getElementById('latitude' + i).value;
        var time = document.getElementById('time' + i).value;

        positions[i-1] = { longitude: longitude, latitude: latitude, time: time };
    }

    var form = document.createElement("form");
    form.setAttribute('method',"post");
    form.setAttribute('action',"/api/v2.1/tag/view");

    var input = document.createElement("input");
    input.setAttribute('name',"positions");
    input.setAttribute('type',"hidden");
    input.setAttribute('value', JSON.stringify(positions));

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
}