/**
 * Utilities for stashing and restoring URLs
 */


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
};
