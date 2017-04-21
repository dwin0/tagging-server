document.getElementById('submitButton').addEventListener('click', sendTaggingRequest);

function sendTaggingRequest() {

    var positions = [];

    for(var i = 1; i <= 3; i++) {
        var longitude = document.getElementById('longitude' + i).value;
        var latitude = document.getElementById('latitude' + i).value;

        positions[i-1] = { longitude: longitude, latitude: latitude };
    }

    var form = document.createElement("form");
    form.setAttribute('method',"post");
    form.setAttribute('action',"/tags/v1/view");

    var input = document.createElement("input");
    input.setAttribute('name',"positions");
    input.setAttribute('type',"hidden");
    input.setAttribute('value', JSON.stringify(positions));

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
}