var router = require('express').Router();
var validate = require('express-jsonschema').validate;
var tagging_v1 = require('../../business_logic/v1/tagging');

var taggingSchema_v1 = {
    type: 'object',
    properties: {
        positions: {
            type: 'array',
            minItems: 3,
            maxItems: 3,
            required: true,
            items: {
                type: 'object',
                required: true,
                properties: {
                    longitude: {
                        type: 'number',
                        required: true
                    },
                    latitude: {
                        type: 'number',
                        required: true
                    },
                    altitude: {
                        type: 'number'
                    },
                    horizontal_accuracy: {
                        type: 'number'
                    },
                    vertical_accuracy: {
                        type: 'number'
                    },
                    time: {
                        type: 'string'
                    },
                    cell_id: {
                        type: 'number'
                    }
                }
            }
        }
    }
};


router.get('/', function (req, res) {
    res.redirect('/tags/v2')
});

router.get('/v1', function (req, res) {
    res.render('index', { title: 'Tagging-Prototype 1.0', version: 'v1' });
});

// This route validates req.body against the taggingSchema
router.post('/v1', validate({body: taggingSchema_v1}), function (req, res) {

    console.log(req.body);

    // At this point req.body has been validated
    tagging_v1.getTags(req, res);
});

router.get('/v2', function (req, res) {
    res.render('index', { title: 'Tagging-Prototype 2.0', version: 'v2' });
});

/*TODO: Implement and add Schema */
router.post('/v2', function (req, res) {
    tagging_v1.getTags(req, res);
});


module.exports = router;