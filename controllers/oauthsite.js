/**
 * OAuth 2 Site and Web Services.
 * @type {*}
 */

var _ = require('underscore');

// We require the ability for the user to log in
var passport = require('passport');
var login = require('connect-ensure-login')


module.exports = function (app, oauth2) {

    app.get('/oauth', function (req, res) {
        res.send('Appsecute Connector OAuth 2.0 Server');
    });


    app.get('/login',  function (req, res) {
        res.render('../views/login');
    });


    app.post('/login',
        passport.authenticate('local', { successReturnToOrRedirect: '/oauth', failureRedirect: '/login' })
    );

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/oauth');
    });

    app.get( '/oauth/authorize', oauth2.authorization);
    app.post('/oauth/authorize/decision', oauth2.decision);
    app.post('/oauth/token', oauth2.token);
};
