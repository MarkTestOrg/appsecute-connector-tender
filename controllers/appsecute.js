/**
 * Appsecute Api Webservices.
 * @type {*}
 */

var _ = require('underscore');
var siteMappingModel = require('../models/sitemapping.js');
var passport = require('passport');
var login = require('connect-ensure-login');

var tenderClient = require('../lib/tender/tenderclient.js');

module.exports = function (app) {

    /**
     * Gets the current url of the server.
     */
    var getServerUrl = function (req) {
        return req.protocol + "://" + req.headers.host;
    };


    /**
     * Formats a Tender Support category repo as an Appsecute component.
     * @param {Object} category The Tender Support category, in the format returned by their API
     * @return {Object} A component ready to be sent to Appsecute.
     */
    var componentFromTenderCategory = function (tenderSite, category) {
        var componentId = tenderSite + '/' + category.permalink; // this is the 'sanitised name' from tender

        return {
            name:category.name,
            id:componentId, // this is the 'sanitised name' from tender
            description:category.summary
        }
    };


    /**
     * Hook for Appsecute to redirect to after OAuth authentication; this implementation allows the
     * user to enter their Tender API key.
     */
    app.get('/appsecute/after-auth',
        // Make sure the user is logged in, using OAuth through Appsecute
        // Redirect back to here after a successful login
        login.ensureLoggedIn('/auth/appsecute' /*+ '?redirect=' + encodeURIComponent('/appsecute/after-auth')*/),

        function (req, res, next) {
            // Save the appsecute return URL in our session
            if( req.query.back_to_appsecute && req.session ) {
                var back_to_appsecute_url = decodeURIComponent(req.query.back_to_appsecute);
                req.session.back_to_appsecute = back_to_appsecute_url;
            }

            // Grab the user ID provided in the URL
            userFromUrl = req.query.user;
            if(!userFromUrl) {
//                res.send(400, 'No user ID specified');
//                return;
            }

            var existingApiKey = req.user.apikey ? req.user.apikey : '';
            var authenticatedUsername = req.user.name;
            var transactionId = "no transaction ID";

            res.render(
                'credentials',
                {
                    transactionID: transactionId,
                    username: authenticatedUsername,
                    apikey: existingApiKey
                });

            // Dummy users
//            var users = [
//                { name: 'tobi', email: 'tobi@learnboost.com' },
//                { name: 'loki', email: 'loki@learnboost.com' },
//                { name: 'jane', email: 'jane@learnboost.com' }
//            ];
//
//            console.log("About to render test out of " + app.get('views'));
//            res.render('test', {
//                users: users,
//                title: "EJS example",
//                header: "Some users"
//            });
        }
    );


    app.post('/appsecute/after-auth/result',
        // Make sure the user is logged in, using OAuth through Appsecute
        login.ensureLoggedIn('/auth/appsecute' + '?redirect=' + encodeURIComponent('/appsecute/after-auth/result')),

        function (req, res, next) {
            // Extract the API key from the posted form data
            var apiKey = req.body.apikey;
            if(apiKey) {
                req.user.apikey = apiKey;

                if( req.session && req.session.back_to_appsecute) {
                    // Redirect back to Appsecute
                    return res.redirect(req.session.back_to_appsecute);
                }
                else {
                    return res.send("Recorded API key " + req.user.apikey);
                }
            }
            else {
                return next(new Error("No API key supplied"));
            }
        }
    );


    /**
     * Appsecute calls this to get a listing of components for the current user.
     */
    app.get('/appsecute/components',
        passport.authenticate('bearer', { session:false }),

        function (req, res, next) {
            var username = req.user.id;

            // The API key is associated with the user who authenticated when Appsecute was issued an OAuth access token
            // When Appsecute's token is redeemed passport looks up the original user as the content to run under
            var apikey = req.user.apikey;

            // TODO: Allow user to specify the tender site name
            // TODO: Allow user to specify multiple tender sites and store them in the database
            var tenderSite = 'appsecute';

            if (apikey) {
                console.log("Listing categories from Tender");

                // Use the API key to go get a list of components from Tender support
                tenderClient.listCategories(tenderSite, apikey, function (err, categories) {
                    if (!err) {
                        console.log("Successfully listed categories from Tender");

                        var components = {};

                        // TODO: Support multiple tender sites
                        components[tenderSite] = [];

                        _.each(categories, function (category) {
                            components[tenderSite].push(componentFromTenderCategory(tenderSite, category));
                        });

                        res.send(components);
                    }
                    else {
                        console.log("Error listing categories from Tender: " + err.message);

                        next(err); // Error listing categories from Tender
                    }
                });
            }
            else {
                // We don't have an API key associated with Appsecute's OAuth access token
                // Send a 401 to tell Appsecute to re-do OAuth authentication
                console.log("API key not available for user " + req.user.id + ", username " + req.user.username);
                res.send(401, "API key not available");
            }
        }
    );


    /**
     * Appsecute calls this when the user maps a component
     */
    app.post('/appsecute/components/:id/mappings',
        passport.authenticate('bearer', { session:false }),

        function (req, res, next) {
            console.log('Mapping ' + req.params.id);

            // id is the tender site + '/' + the category sanitised name

            // Subscription is manual in tender so nothing to do
            res.send(200);
        }
    );


    /**
     * Appsecute calls this when the user unmaps a component
     */
    app.delete('/appsecute/components/:id/mappings',
        passport.authenticate('bearer', { session:false }),

        function (req, res) {
            console.log('Unmapping ' + req.params.id);

            // Subscription is manual in tender so nothing to do
            res.send(200);
    });
};