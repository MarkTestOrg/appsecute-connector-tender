/**
 * Configures an OAuth 2 server using oauth2orize from Jared Hanson
 * @type {*}
 */

var oauth2orize = require('oauth2orize');

// We use Passport for authentication to the connector (for Appsecute to authenticate)
var passport = require('passport');

var login = require('connect-ensure-login');

var db = require('./../db');

var utils = require('./utils');


// create OAuth 2.0 server
var server = oauth2orize.createServer();


// Register serialialization and deserialization functions.
// Note that we register these functions through the same call on the 'server' object that
// is used to call them (this is the way the library is written).
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTP request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient(function(client, done) {
    return done(null, client.id);
});


server.deserializeClient(function(id, done) {
    db.clients.find(id, function(err, client) {
        if (err) { return done(err); }
        return done(null, client);
    });
});


// Register supported grant types.
// oauth2orize.grant.code is a function that implements a grant type that creates/returns
// an Authorization code, and requires a callback
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources.  It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

// Grant authorization codes.  The callback takes the `client` requesting
// authorization, the `redirectURI` (which is used as a verifier in the
// subsequent exchange), the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application.  The application issues a code, which is bound to these
// values, and will be exchanged for an access token.

server.grant(oauth2orize.grant.code(
    // This is our 'issue' callback function used by the 'code' grant type to actually issue a new
    // Authorization code grant.
    function(client, redirectURI, user, ares, done) {
        // Make a new random ID
        var code = utils.uid(16)

        // TODO: Store the authorization code in the database so we can look it up later

        db.authorizationCodes.save(code, client.id, redirectURI, user.id, function(err) {
            if (err) { return done(err); }
            done(null, code);
        });
    }
));


// Exchange authorization codes for access tokens.  The callback accepts the
// `client`, which is exchanging `code` and any `redirectURI` from the
// authorization request for verification.  If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code.

server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
    db.authorizationCodes.find(code, function(err, authCode) {
        if (err) { return done(err); }
        if (client.id !== authCode.clientID) { return done(null, false); }
        if (redirectURI !== authCode.redirectURI) { return done(null, false); }

        var token = utils.uid(256)
        db.accessTokens.save(token, authCode.userID, authCode.clientID, function(err) {
            if (err) { return done(err); }
            done(null, token);
        });
    });
}));


// User authorization endpoint; this web service is used by the client to obtain an
// authorization token. We require the end user to authenticate for this.
//
// `authorization` middleware accepts a `validate` callback which is
// responsible for validating the client making the authorization request.  In
// doing so, is recommended that the `redirectURI` be checked against a
// registered value, although security requirements may vary across
// implementations.  Once validated, the `done` callback must be invoked with
// a `client` instance, as well as the `redirectURI` to which the user will be
// redirected after an authorization decision is obtained.
//
// This middleware simply initializes a new authorization transaction.  It is
// the application's responsibility to authenticate the user and render a dialog
// to obtain their approval (displaying details about the client requesting
// authorization).  We accomplish that here by routing through `ensureLoggedIn()`
// first, and rendering the `dialog` view.

exports.authorization = [
    // First middleware ensures the end user is logged in
    login.ensureLoggedIn(),

    // Second one calls the authorization method on the OAuth server to check the client ID;
    // Can supply options and a validation callback, or just a validation callback (like here)
    server.authorization(function(clientID, redirectURI, done) {
        db.clients.findByClientId(clientID, function(err, client) {
            if (err) { return done(err); }
            // WARNING: For security purposes, it is highly advisable to check that
            //          redirectURI provided by the client matches one registered with
            //          the server.  For simplicity, this example does not.  You have
            //          been warned.
            return done(null, client, redirectURI);
        });
    }),

    // End user and client are both authenticated; now we can render and return a dialog to
    // ask the user if they want to give access to the client
    function(req, res){

        var existingApiKey = req.user.apikey ? req.user.apikey : '';

        res.render(
            'dialog',
            {
                transactionID: req.oauth2.transactionID,
                user: req.user,
                client: req.oauth2.client,
                apikey: existingApiKey
            });
    }
]


// User decision endpoint; use this as an array of handlers when registering a web service to
// decide on whether a user is authorized. The end user must be authenticated for this web service.
//
// `decision` middleware processes a user's decision to allow or deny access
// requested by a client application.  Based on the grant type requested by the
// client, the above grant middleware configured above will be invoked to send
// a response.

exports.decision = [
    // Ensure the end user is logged in
    login.ensureLoggedIn(),

    // Extract the API key from the posted form data
    function (req, res, next) {
        var apiKey = req.body.apikey;
        if(apiKey) {
            req.user.apikey = apiKey;
            next();
        }
        else {
            next(new Error("No API key supplied"));
        }
    },

    // Second one delegates to the OAuth server to make a decision about allowing access
    server.decision()
]


// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

exports.token = [
    // Authenticate the client (typically a Web server machine) using its secret
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),

    // Issue a token
    server.token(),

    server.errorHandler()
]
