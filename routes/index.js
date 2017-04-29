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
//TODO: Implement
router.get('/api', function(req, res) {
    const apiData = {
        currentVersion: 2.0,
        taggingRoute: 'api/v2.0/tag',
        speedCalculationRoute: 'api/v2.0/calculateSpeed'
    };

    if(req.xhr || req.get('Content-Type') === 'application/json') {
        res.json(apiData);
    }

    res.render('api', apiData);
});


//split up route handling
//Version 1.0
router.use('/api/v1', require('./router/v1.0'));
router.use('/api/v1.0', require('./router/v1.0'));


//Version 2.0
router.use('/api', require('./router/v2.0'));
router.use('/api/v2', require('./router/v2.0'));
router.use('/api/v2.0', require('./router/v2.0'));


//Version 2.1
//TODO: Delete lines '/api' and 'api/v2' from Version 2 --> redirect to newest version (2.1)
//router.use('/api/v2', require('./router/v2.1'));
//router.use('/api/v2.1', require('./router/v2.1'));


router.use(jsonSchema.handleJsonSchemaValidationError);


module.exports = router;