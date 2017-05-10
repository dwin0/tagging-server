var express = require('express');
var router = express.Router();
var jsonSchema = require('./jsonSchemas');


/*CORS-HEADER*/
router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


router.get('/', function(req, res) {
    res.redirect('/api');
});

//Return api capabilities
router.get('/api', function(req, res) {
    const apiData = {
        title: 'API',
        version: '4.0'
    };

    if(req.xhr || req.get('Content-Type') === 'application/json') {
        res.json(apiData);
    }

    res.render('api', apiData);
});

router.get('/schemas', function(req, res) {
    res.json({
        taggingSchema: jsonSchema.taggingSchema_v4,
        speedCalculationSchema: jsonSchema.velocitySchema_v3,
        surroundingsSchema: jsonSchema.surroundingsSchema_v3
    });
});


//split up route handling
//Version 1.0
router.use('/api/v1', require('./router/v1.0'));
router.use('/api/v1.0', require('./router/v1.0'));


//Version 2.0
router.use('/api/v2.0', require('./router/v2.0'));


//Version 2.1
router.use('/api/v2', require('./router/v2.1'));
router.use('/api/v2.1', require('./router/v2.1'));


//Version 3.0
router.use('/api/v3', require('./router/v3.0'));
router.use('/api/v3.0', require('./router/v3.0'));

//Version 4.0
router.use('/api', require('./router/v4.0'));
router.use('/api/v4', require('./router/v4.0'));
router.use('/api/v4.0', require('./router/v4.0'));


router.use(jsonSchema.handleJsonSchemaValidationError);


module.exports = router;