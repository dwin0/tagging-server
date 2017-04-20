//TODO: Add JQuery

window.onload = function () {
    setMarkers();
};

document.getElementById('submitButton').addEventListener('click', sendTaggingRequest);


function setMarkers() {

    var coordinates = document.getElementsByClassName('coordinate');

    for(var i = 0; i < coordinates.length; i++) {

        var stringCoordinates = coordinates[i].innerHTML.split(',');

        var lat = Number(stringCoordinates[0]);
        var lon = Number(stringCoordinates[1]);

        L.marker([lat, lon]).addTo(map);
    }
}


function sendTaggingRequest() {

    for(var i = 0; i < 3; i++) {


    }

}
















