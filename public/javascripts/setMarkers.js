window.onload = function () {
    setMarkers();
};


function setMarkers() {

    var coordinates = document.getElementsByClassName('coordinate');

    for(var i = 0; i < coordinates.length; i++) {

        var stringCoordinates = coordinates[i].innerHTML.split(',');

        var lat = Number(stringCoordinates[0]);
        var lon = Number(stringCoordinates[1]);

        L.marker([lat, lon]).addTo(map);
    }
}