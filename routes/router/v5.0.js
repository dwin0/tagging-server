var router = require('express').Router();
var validate = require('express-jsonschema').validate;
var tagging_v5 = require('../../business_logic/v5/tagging_communication');
var velocity_v5 = require('../../business_logic/v5/velocity_communication');
var surroundings_v5 = require('../../business_logic/v5/surroundings_communication');
var jsonSchema = require('../jsonSchemas');


//Tagging:
router.get('/tag', function (req, res) {
    res.render('index_v3', { title: 'Tagging-Server', version: '5.0' });
});

// This route validates req.body against the taggingSchema
router.post('/tag', validate({body: jsonSchema.taggingSchema_v4}), function (req, res) {
    // At this point req.body has been validated
    tagging_v5.getTagsJSON(req, res);
});


//FindSurroundings:
router.get('/findSurroundings', function (req, res) {
    res.render('surroundingsIndex_v3', { title: 'Umgebungsabfrage', version: '5.0' });
});

// This route validates req.body against the taggingSchema
router.post('/findSurroundings', validate({body: jsonSchema.surroundingsSchema_v3}), function (req, res) {
    // At this point req.body has been validated
    surroundings_v5.getSurroundingsJSON(req, res);
});


//SpeedCalculation:
router.get('/calculateSpeed', function (req, res) {
    res.render('speedIndex', { title: 'Geschwindigkeitsberechnung', version: '5.0' });
});

router.post('/calculateSpeed', validate({body: jsonSchema.velocitySchema_v3}), function (req, res) {
    velocity_v5.getSpeedCalculationJSON(req, res);
});



module.exports = router;