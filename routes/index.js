var router = require('express').Router();
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

router.get('/api', function(req, res) {

    const apiData = {
        title: 'API',
        version: '5.1'
    };

    if(req.xhr || req.get('Content-Type') === 'application/json') {
        res.status(200).json(apiData);
        return;
    }

    res.render('api', apiData);
});

router.get('/schemas', function(req, res) {
    res.status(200).json({
        taggingSchema: jsonSchema.TAGGING_SCHEMA_V5,
        speedCalculationSchema: jsonSchema.VELOCITY_SCHEMA,
        surroundingsSchema: jsonSchema.SURROUNDINGS_SCHEMA
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
router.use('/api/v4', require('./router/v4.0'));
router.use('/api/v4.0', require('./router/v4.0'));


//Version 5.0
router.use('/api/v5.0', require('./router/v5.0'));


//Version 5.1
router.use('/api', require('./router/v5.1'));
router.use('/api/v5', require('./router/v5.1'));
router.use('/api/v5.1', require('./router/v5.1'));


router.use(jsonSchema.handleJsonSchemaValidationError);


module.exports = router;