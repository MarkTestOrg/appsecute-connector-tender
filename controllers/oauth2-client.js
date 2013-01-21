/**
 * OAuth 2 client web services (for logging in to the connector via OAuth)
 */

var _ = require('underscore');

// We require the ability for the user to log in
var passport = require('passport');


module.exports = function (app) {

    // Redirect the user to the OAuth 2.0 provider for authentication. A 'redirect' query parameter can
    // be provided which will be stored in the session and redirected to once the entire OAuth
    // process is complete.
    // (This is *not* the OAuth callback URL used by the OAuth server to return control back to
    // us; the OAuth callback URL is '/auth/provider/callback'.)
    app.get('/auth/appsecute',
        passport.authenticate('appsecute', { scope: ['profile'] })
    );


    // The OAuth 2.0 provider has redirected the user back to the application.
    // Finish the authentication process by attempting to obtain an access token.
    // If authorization was granted, the user will be logged in. Otherwise, authentication has failed.
    // If the user was logged in this method will redirect to any 'redirect' URL stashed in the session.
    app.get('/auth/appsecute/callback',
        // Note: The successReturnToOrRedirect option redirects back to the URL saved by ensureLoggedIn
        passport.authenticate('appsecute', {  successReturnToOrRedirect: '/', failureRedirect: '/auth/appsecute' })

    );
};
