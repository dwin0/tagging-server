var velocity = require('./velocity');

function getSpeedCalculationJSON(req, res) {
    velocity.getVelocity_request(req, res, function (res, endDate, startDate, resultingDistance) {

        res.writeHead(200, {"Content-Type": "application/json"});
        var json = velocity.prepareJSON(endDate, startDate, resultingDistance);
        res.end( JSON.stringify(json));
    })
}

function getSpeedCalculationView(req, res) {
    velocity.getVelocity_request(req, res, function (res, endDate, startDate, resultingDistance) {

        var json = velocity.prepareJSON(endDate, startDate, resultingDistance);
        res.render('speedView', json);
    })
}




module.exports = { "getSpeedCalculationView": getSpeedCalculationView, "getSpeedCalculationJSON": getSpeedCalculationJSON };