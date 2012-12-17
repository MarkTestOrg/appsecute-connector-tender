/**
 * Configures the Node.js Server.
 * @type {*}
 */

var express = require('express');
var app = express();
var port = 3002;

// Configure the environment
require('./config.js')(app, express);

// Load our controllers
require('./controllers/appsecute.js')(app);
require('./controllers/tender.js')(app);

module.exports = app.listen(port);

console.log("Tender Support connector listening on port %d", port);
