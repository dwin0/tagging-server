var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var index = require('./routes/index');
//var fs = require('fs');
//var rfs = require('rotating-file-stream');


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
});

/* Uncomment to enable request-logging

var logDirectory = path.join(__dirname, 'log');

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// create a rotating write stream
var accessLogStream = rfs('access.log', {
    interval: '1d',
    path: logDirectory
});

// setup the logger
app.use(logger('combined', {stream: accessLogStream}));
*/


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);

// catch 404
app.use(function(req, res) {
    res.status(404).send('Not found');
});

//Print the uncaught exception into the standard error output (stderr.txt) and terminate
process.on('uncaughtException', function (err) {
    console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
    console.error(err.stack);
    process.exit(1);
});

module.exports = app;