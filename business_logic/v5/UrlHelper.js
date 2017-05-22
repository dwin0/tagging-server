var converter = require('./wgs84_ch1903');
var request = require('request');


function getGeoAdminURL(point, URL) {

    var longitude = point.st_x;
    var latitude = point.st_y;

    var chY = converter.WGStoCHy(latitude, longitude);
    var chX = converter.WGStoCHx(latitude, longitude);

    return URL.replace('{y}', chY).replace('{x}', chX);
}


function getGeoAdminRequests(requests) {

    var requestFunctions = [];

    for(var i = 0; i < requests.length; i++) {

        requestFunctions[i] = (function (i) {
            return function(callback) {
                request.get(
                    requests[i],
                    function (error, response) {
                        if (!error && response.statusCode === 200) {
                            callback(null, JSON.parse(response.body));
                        } else {
                            console.error("error: " + response.statusCode);
                        }
                    }
                );
            };
        })(i);
    }

    return requestFunctions;
}


module.exports = {
    "getGeoAdminURL": getGeoAdminURL,
    "getGeoAdminRequests": getGeoAdminRequests
};