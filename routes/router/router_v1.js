var router = require('express').Router();
var tagging = require('../../business_logic/v1/tagging');
var velocity = require('../../business_logic/v1/velocity');


router.get('/', function(req, res) {
    res.render('index', { title: 'Tagging-Prototype 1.0', version: 'v1' });
});

router.get('/speedCalculation', function (reg, res, next) {
    res.render('speedIndex', { title: 'Geschwindigkeitsberechnung' });
});

router.post('/speedCalculation', function(req, res) {
    velocity.getSpeedCalculation(req, res)
});

router.post('/tags', function (req, res) {
    tagging.getTags(req, res);
});

module.exports = router;