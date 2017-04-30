var router = require('express').Router();
var validate = require('express-jsonschema').validate;
var tagging_v2 = require('../../business_logic/v2/tagging_communication');
var velocity_v2 = require('../../business_logic/v2/velocity_communication');
var jsonSchema = require('../jsonSchemas');


//Tagging:

router.get('/tag', function (req, res) {
    res.render('index_v2', { title: 'Tagging-Prototype 2.0', version: 'v2.0' });
});

// This route validates req.body against the taggingSchema
router.post('/tag', validate({body: jsonSchema.taggingSchema_v2}), function (req, res) {
    // At this point req.body has been validated
    tagging_v2.getTagsJSON(req, res);
});

//TODO: Send form with application/json
router.post('/tag/view', validate({body: jsonSchema.taggingSchema_v2}), function (req, res) {
    tagging_v2.getTagsView(req, res);
});



//SpeedCalculation:

router.get('/calculateSpeed', function (req, res) {
    res.render('speedIndex', { title: 'Geschwindigkeitsberechnung', version: 'v2' });
});

router.post('/calculateSpeed', validate({body: jsonSchema.velocitySchema_v1}), function (req, res) {
    velocity_v2.getSpeedCalculationJSON(req, res);
});

router.post('/calculateSpeed/view', validate({body: jsonSchema.velocitySchema_v1}), function (req, res) {
    velocity_v2.getSpeedCalculationView(req, res);
});



module.exports = router;