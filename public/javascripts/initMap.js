/**
 * This module is responsible to load the leaflet map.
 * @module public/javascripts/initMap
 */

var map;

(function setupMap() {

    map = new L.Map('map');

    // create the tile layer with correct attribution
    var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.TileLayer(osmUrl, {minZoom: 1, maxZoom: 20, attribution: osmAttrib});

    map.setView(new L.LatLng(47.3, 8.55),9);
    map.addLayer(osm);
})();