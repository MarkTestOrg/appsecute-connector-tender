/**
 * Configures the Node.js Server.
 * @type {*}
 */

var express = require('express');
var app = express();
var port = 3002;

// Set up an OAuth2 Server
var oauth2 = require('./lib/oauth/oauth2');

// Configure the environment
require('./config.js')(app, express);

// Load our controllers
require('./controllers/oauthsite.js')(app, oauth2);
require('./controllers/appsecute.js')(app);
require('./controllers/tender.js')(app);
require('./controllers/oauth2-client.js')(app);

module.exports = app.listen(port);

console.log("Tender Support connector listening on port %d", port);
