var router = require('express').Router();
var validate = require('express-jsonschema').validate;
var tagging_v5 = require('../../business_logic/v5/taggingCommunication');
var velocity_v5 = require('../../business_logic/v5/velocityCommunication');
var surroundings_v5 = require('../../business_logic/v5/surroundingsCommunication');
var jsonSchema = require('../jsonSchemas');



//Tagging:
router.get('/tag', function (req, res) {
    res.render('index', { title: 'Tagging-Server', version: '5.0' });
});

// This route validates req.body against the taggingSchema
router.post('/tag', validate({body: jsonSchema.TAGGING_SCHEMA_V4}), function (req, res) {
    // At this point req.body has been validated
    tagging_v5.getTags(req, res);
});



//Surroundings:
router.get('/findSurroundings', function (req, res) {
    res.render('surroundingsIndex', { title: 'Umgebungsabfrage', version: '5.0' });
});

router.post('/findSurroundings', validate({body: jsonSchema.SURROUNDINGS_SCHEMA_V3}), function (req, res) {
    surroundings_v5.getSurroundings(req, res);
});


//SpeedCalculation:
router.get('/calculateSpeed', function (req, res) {
    res.render('speedIndex', { title: 'Geschwindigkeitsberechnung', version: '5.0' });
});

router.post('/calculateSpeed', validate({body: jsonSchema.VELOCITY_SCHEMA_V3}), function (req, res) {
    velocity_v5.getSpeedCalculation(req, res);
});



module.exports = router;