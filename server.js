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




// Register ejs as .html. If we did
// not call this, we would need to
// name our views foo.ejs instead
// of foo.html. The __express method
// is simply a function that engines
// use to hook into the Express view
// system by default, so if we want
// to change "foo.ejs" to "foo.html"
// we simply pass _any_ function, in this
// case `ejs.__express`.
app.engine('.html', require('ejs').__express);

// Optional since express defaults to CWD/views
app.set('views', __dirname + '/views');

// Without this you would need to
// supply the extension to res.render()
// ex: res.render('users.html').
app.set('view engine', 'html');

// Dummy users
var users = [
    { name: 'tobi', email: 'tobi@learnboost.com' },
    { name: 'loki', email: 'loki@learnboost.com' },
    { name: 'jane', email: 'jane@learnboost.com' }
];

app.get('/', function(req, res){
    console.log("About to render test out of " + app.get('views'));
    res.render('test', {
        users: users,
        title: "EJS example",
        header: "Some users"
    });
});
