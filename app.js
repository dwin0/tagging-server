var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');

var app = express();

// view engine setup
var hbs = require('hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


hbs.registerHelper('ifSame', function(value1, value2, options) {
    if(value1 === value2) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

hbs.registerHelper('ifAny', function() {
    var value1 = arguments[0];
    var options = arguments[arguments.length - 1];

    for (var i = 1; i < arguments.length - 1; i++) {
        if(value1 === arguments[i]) {
            return options.fn(this);
        }
    }

    return options.inverse(this);
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404
app.use(function(req, res, next) {
    res.status(404).send('Not found');
});

module.exports = app;