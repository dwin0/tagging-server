var express = require('express');
var router = express.Router();


//route to the newest version
router.get('/', function(req, res) {
    res.redirect('/v2');
});

// split up route handling
router.use('/v1', require('./router/router_v1'));
router.use('/v2', require('./router/router_v2'));

module.exports = router;