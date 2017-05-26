var router = require('express').Router();
var validate = require('express-jsonschema').validate;
var tagging_v2 = require('../../business_logic/v2.1/tagging_communication');
var velocity_v2 = require('../../business_logic/v2.1/velocity_communication');
var jsonSchema = require('../jsonSchemas');


//Tagging:
router.get('/tag', function (req, res) {
    res.render('index', { title: 'Tagging-Server', version: '2.1' });
});

// This route validates req.body against the taggingSchema
router.post('/tag', validate({body: jsonSchema.TAGGING_SCHEMA_V2}), function (req, res) {
    // At this point req.body has been validated
    tagging_v2.getTagsJSON(req, res);
});



//SpeedCalculation:

router.get('/calculateSpeed', function (req, res) {
    res.render('speedIndex', { title: 'Geschwindigkeitsberechnung', version: '2.1' });
});

router.post('/calculateSpeed', validate({body: jsonSchema.VELOCITY_SCHEMA_V3}), function (req, res) {
    velocity_v2.getSpeedCalculationJSON(req, res);
});



module.exports = router;