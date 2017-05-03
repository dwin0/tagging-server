$(window).on('load', function () {
    setMarkers();

    $('input').on('change', setMarkers);
    $('#clearInput').on('click', function () {
        $('input').val(null);
        setMarkers();
    })
});

var markers = new L.FeatureGroup();

function setMarkers() {

    markers.clearLayers();

    for(var i = 1; i <= 8; i++) {
        var longitude = $('#longitude' + i).val();
        var latitude = $('#latitude' + i).val();

        if(longitude === '' || latitude === '') {
            continue;
        }

        var marker = L.marker([latitude, longitude]);
        marker.bindPopup("<p>Punkt " + i + "</p>", {
            showOnMouseOver: true
        });
        markers.addLayer(marker);
    }

    map.addLayer(markers);
}