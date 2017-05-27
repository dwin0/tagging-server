var router = require('express').Router();
var validate = require('express-jsonschema').validate;
var tagging_v1 = require('../../business_logic/v1/tagging_communication');
var velocity_v1 = require('../../business_logic/v1/velocity');
var jsonSchema = require('../jsonSchemas');


//Tagging:
router.get('/tag', function (req, res) {
    res.render('taggingIndex', { title: 'Tagging-Server', version: '1.0' });
});

// This route validates req.body against the taggingSchema
router.post('/tag', validate({body: jsonSchema.TAGGING_SCHEMA_V1}), function (req, res) {
    // At this point req.body has been validated
    tagging_v1.getTagsJSON(req, res);
});



//SpeedCalculation:
router.get('/calculateSpeed', function (req, res) {
    res.render('speedIndex', { title: 'Geschwindigkeitsberechnung', version: '1.0' });
});

router.post('/calculateSpeed', validate({body: jsonSchema.VELOCITY_SCHEMA}), function (req, res) {
    velocity_v1.getSpeedCalculationJSON(req, res);
});



module.exports = router;