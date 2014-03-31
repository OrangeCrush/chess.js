/**
 * Module dependencies.
 */

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    fs = require('fs');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */
 
app.use(express.static(__dirname + '/public', { maxAge: 0 }));
app.use(express.bodyParser());

require('./config/routes')(app);

// express settings

var port = 3000;
server.listen(port);
console.log('Express app started on port ' + port);

// expose app
exports = module.exports = app;
