$(window).load(function () {
    setMarkers();

    addClearListener();

    //Draw new markers on input-change
    $('input').on('change', setMarkers);

});


var markers = new L.FeatureGroup();

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
}

function addClearListener() {
    $('#clearInput').on('click', function () {
        $('input').val(null);
        setMarkers();
    })
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