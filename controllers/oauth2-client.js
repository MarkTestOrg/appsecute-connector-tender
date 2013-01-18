/**
 * OAuth 2 client web services (for logging in to the connector via OAuth)
 */

var _ = require('underscore');

// We require the ability for the user to log in
var passport = require('passport');


module.exports = function (app) {

    /**
     * Call this function to return middleware that will store any URL from the 'redirect' query parameter
     * into the current session, so it can later be used for a redirect from another Web service call.
     * @return {Function}
     */
    var stashRedirectUrl = function() {
        return function(req, res, next) {
            if(req.query.redirect && req.session) {
                req.session.redirect_url = decodeURIComponent(req.query.redirect);
            }
            next();
        }
    }


    /**
     * Call this function to return middleware that will redirect to a URL previously stored into the current
     * session, and clear the stored URL from the session.
     * If no URL was available in the session then the middleware will redirect to the specified 'default' URL.
     * @return {Function}
     */
    var redirectToStashedUrl = function(defaultUrl) {
        return function(req, res, next ) {
            var redirect_url = defaultUrl;

            // Grab any URL that was previously stashed in the session, then clear it
            if( req.session && req.session.redirect_url ) {
                redirect_url = req.session.redirect_url;
                req.session.redirect_url = undefined;
            }

            return res.redirect(redirect_url);
        }
    }


    // Redirect the user to the OAuth 2.0 provider for authentication. A 'redirect' query parameter can
    // be provided which will be stored in the session and redirected to once the entire OAuth
    // process is complete.
    // (This is *not* the OAuth callback URL used by the OAuth server to return control back to
    // us; the OAuth callback URL is '/auth/provider/callback'.)
    app.get('/auth/appsecute',
//        stashRedirectUrl(),
        passport.authenticate('appsecute', { scope: ['profile'] })
    );


    // The OAuth 2.0 provider has redirected the user back to the application.
    // Finish the authentication process by attempting to obtain an access token.
    // If authorization was granted, the user will be logged in. Otherwise, authentication has failed.
    // If the user was logged in this method will redirect to any 'redirect' URL stashed in the session.
    app.get('/auth/appsecute/callback',
        // Note: The successReturnToOrRedirect option redirects back to the URL saved by ensureLoggedIn
        passport.authenticate('appsecute', {  successReturnToOrRedirect: '/', failureRedirect: '/auth/appsecute' })
//        , redirectToStashedUrl('/')
    );
};
