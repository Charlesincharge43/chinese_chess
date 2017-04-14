'use strict';
var path = require('path');
var express = require('express');
var bodyParser= require('body-parser');
var morgan=require('morgan');
var app = express();
module.exports = app;

//logger first,
app.use(morgan('dev'));

//Applies body of the request to the property body of req (that WOULDN"T EXIST UNTIL BODY PARSER DOES ITS THING)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Pass our express application pipeline into the configuration
// function located at server/app/configure/index.js
// require('./configure')(app);//update not doing this... just going to do bodyparser and staticmiddelware in this file
//when you have time later, you can refactor and make things more modular

// Routes that will be accessed via AJAX should be prepended with
// /api so they are isolated from our GET /* wildcard.
// app.use('/api', require('./routes'));

// console.log(__dirname);
// console.log(__dirname+'/test');
var rootpath=path.resolve(__dirname, '../..');
// console.log(rootpath);
app.use(express.static(rootpath+'/public'));
app.use(express.static(rootpath+'/build'));

// app.use('/test',express.static(__dirname+'/test'))
// app.use('/test',express.static('test'))

/*
 This middleware will catch any URLs resembling a file extension
 for example: .js, .html, .css
 This allows for proper 404s instead of the wildcard '/*' catching
 URLs that bypass express.static because the given file does not exist.
 */

app.use(function (req, res, next) {

    if (path.extname(req.path).length > 0) {
        res.status(404).end();
    } else {
        next(null);
    }

});

app.get('/*', function (req, res) {
    // res.sendFile(app.get('/browser/index.html'));
    res.sendFile(rootpath+'/browser/index.html');
});

// Error catching endware.
app.use(function (err, req, res, next) {
    console.error(err, typeof next);
    console.error(err.stack)
    res.status(err.status || 500).send(err.message || 'Internal server error.');
});
