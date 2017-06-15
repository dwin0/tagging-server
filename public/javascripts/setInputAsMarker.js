/**
 * This module is responsible to display and clear form-input on the leaflet map.
 * @module public/javascripts/setInputAsMarker
 */


$(window).load(function () {
    setMarkers();

    addClearListener();

    //Draw new markers on input-change
    $('input').on('change', setMarkers);

});


var markers = new L.FeatureGroup();

/**
 * Collects all input-coordinates and displays these on the leaflet map.
 */
function setMarkers() {

    markers.clearLayers();

    var numberOfPositions = getNumberOfPositions();

    for(var i = 1; i <= numberOfPositions; i++) {
        var longitude = $('#longitude' + i).val();
        var latitude = $('#latitude' + i).val();
        var horizontalAccuracy = $('#horizontalAccuracy' + i).val();

        if(longitude === '' || latitude === '') {
            continue;
        }

        var marker = L.marker([latitude, longitude]);
        marker.bindPopup("<p>Punkt " + i + "</p>", {
            showOnMouseOver: true
        });
        markers.addLayer(marker);

        if(horizontalAccuracy) {

            var circle = L.circle([parseFloat(latitude), parseFloat(longitude)], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.1,
                radius: parseFloat(horizontalAccuracy)
            });
            markers.addLayer(circle);
        }
    }

    map.addLayer(markers);

    // zoom in on last point on the osm map
    map.setView(new L.LatLng(latitude, longitude), 15);
}

/**
 * Clears all form-input-fields and removes the markers on the leaflet map.
 */
function addClearListener() {
    $('#clearInput').on('click', function () {
        $('input').val(null);
        setMarkers();
    })
}


/**
 * Returns the number of all form-input-fields.
 * @returns {number} number of all form-input-fields
 */
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