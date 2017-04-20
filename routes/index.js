var express = require('express');
var router = express.Router();
var tagging = require('../business_logic/tagging');
var velocity = require('../business_logic/velocity');


router.get('/', function(req, res) {
    res.redirect('/v1');
});

router.get('/v1', function(req, res) {
  res.render('index', { title: 'Tagging-Prototype 1.0' });
});

router.get('/v1/speedCalculation', function (reg, res, next) {
    res.render('speedIndex', { title: 'Geschwindigkeitsberechnung' });
});

router.post('/v1/speedCalculation', function(req, res) {
    velocity.getSpeedCalculation(req, res)
});

router.post('/v1/tags', function (req, res) {
    tagging.getTags(req, res);
});

module.exports = router;