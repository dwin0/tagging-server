var converter = require('../business_logic/converter');
var db_access = require('../persistence/db_access');


function getTags(req, res) {
    db_access.queryNearest(res, req.body, renderNearest);
}

function renderNearest(res, results, coordinates) {

    var tag = converter.tag(results);

    res.render('nearestView', {
        title: "Nearest Ways:",
        results: results,
        tag: tag.tagName,
        probability: tag.probability,
        coordinates: coordinates
    });
}


module.exports = { "getTags": getTags };