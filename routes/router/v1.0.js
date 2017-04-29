var router = require('express').Router();
var validate = require('express-jsonschema').validate;
var tagging_v1 = require('../../business_logic/v1/tagging_communication');
var velocity_v1 = require('../../business_logic/v1/velocity');
var jsonSchema = require('../jsonSchemas');


//Tagging:

router.get('/tag', function (req, res) {
    res.render('index_v1', { title: 'Tagging-Prototype 1.0', version: 'v1' });
});

// This route validates req.body against the taggingSchema
router.post('/tag', validate({body: jsonSchema.taggingSchema_v1}), function (req, res) {
    // At this point req.body has been validated
    tagging_v1.getTagsJSON(req, res);
});

router.post('/tag/view', validate({body: jsonSchema.taggingSchema_v1}), function (req, res) {
    tagging_v1.getTagsView(req, res);
});



//SpeedCalculation:

router.get('/calculateSpeed', function (req, res) {
    res.render('speedIndex', { title: 'Geschwindigkeitsberechnung', version: 'v1' });
});

router.post('/calculateSpeed', validate({body: jsonSchema.velocitySchema_v1}), function (req, res) {
    velocity_v1.getSpeedCalculationJSON(req, res);
});

router.post('/calculateSpeed/view', validate({body: jsonSchema.velocitySchema_v1}), function (req, res) {
    velocity_v1.getSpeedCalculationView(req, res);
});



module.exports = router;