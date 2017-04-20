var router = require('express').Router();
var validate = require('express-jsonschema').validate;
var tagging_v1 = require('../../business_logic/v1/tagging');

var taggingSchema = {
    type: 'object',
    properties: {
        number: {
            type: 'number',
            required: true
        },
        name: {
            type: 'string',
            required: true
        },
        type: {
            type: 'string',
            required: true,
            enum: ['Street', 'Avenue', 'Boulevard']
        }
    }
};


// This route validates req.body against the StreetSchema
router.post('/street', validate({body: StreetSchema}), function(req, res) {
    // At this point req.body has been validated


});





router.get('/', function (req, res) {
    res.redirect('/tags/v2')
});

router.get('/v1', function (req, res) {
    res.render('index', { title: 'Tagging-Prototype 1.0', version: 'v1' });
});

router.post('/v1', function (req, res) {
    tagging_v1.getTags(req, res);
});

router.get('/v2', function (req, res) {
    res.render('index', { title: 'Tagging-Prototype 2.0', version: 'v2' });
});

/*TODO: Implement */
router.post('/v2', function (req, res) {
    tagging_v1.getTags(req, res);
});


module.exports = router;