var router = require('express').Router();
var validate = require('express-jsonschema').validate;
var tagging_v2 = require('../../business_logic/v3/tagging_communication');
var velocity_v2 = require('../../business_logic/v3/velocity_communication');
var jsonSchema = require('../jsonSchemas');


//Tagging:

router.get('/tag', function (req, res) {
    res.render('index_v3', { title: 'Tagging-Prototype 3.0', version: 'v3.0' });
});

// This route validates req.body against the taggingSchema
router.post('/tag', validate({body: jsonSchema.taggingSchema_v3}), function (req, res) {
    // At this point req.body has been validated
    tagging_v2.getTagsJSON(req, res);
});


//TODO: GetSurrounding: routs



//SpeedCalculation:

router.get('/calculateSpeed', function (req, res) {
    res.render('speedIndex', { title: 'Geschwindigkeitsberechnung', version: 'v3.0' });
});

router.post('/calculateSpeed', validate({body: jsonSchema.velocitySchema_v1}), function (req, res) {
    velocity_v2.getSpeedCalculationJSON(req, res);
});



module.exports = router;