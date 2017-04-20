var router = require('express').Router();
var validate = require('express-jsonschema').validate;
var velocity_v1 = require('../../business_logic/v1/velocity');


const velocitySchema = {
    type: 'object',
    properties: {
        startTime: {
            type: 'string',
            required: true
        },
        endTime: {
            type: 'string',
            required: true
        },
        longitude1: {
            type: 'number',
            required: true
        },
        latitude1: {
            type: 'number',
            required: true
        },
        longitude2: {
            type: 'number',
            required: true
        },
        latitude2: {
            type: 'number',
            required: true
        }
    }
};


router.get('/', function (req, res) {
    res.redirect('/speedCalculation/v2')
});

router.get('/v1', function (req, res) {
    res.render('speedIndex', { title: 'Geschwindigkeitsberechnung', version: 'v1' });
});

// This route validates req.body against the StreetSchema
router.post('/v1', validate({body: velocitySchema}), function (req, res) {
    // At this point req.body has been validated
    velocity_v1.getSpeedCalculation(req, res);
});

router.get('/v2', function (req, res) {
    res.render('speedIndex', { title: 'Geschwindigkeitsberechnung', version: 'v2' });
});

/*TODO: Implement*/
router.post('/v2', function (req, res) {
    velocity_v1.getSpeedCalculation(req, res);
});


module.exports = router;