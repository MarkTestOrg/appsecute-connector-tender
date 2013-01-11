/**
 * Appsecute Api Webservices.
 * @type {*}
 */

var _ = require('underscore');
var siteMappingModel = require('../models/sitemapping.js');
var passport = require('passport');
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
     * Appsecute calls this to get a listing of components for the current user.
     */
    app.get('/appsecute/components',
        passport.authenticate('bearer', { session:false }),

        function (req, res, next) {
            var username = req.user.username;

            // The API key is associated with the user who authenticated when Appsecute was issued an OAuth access token
            // When Appsecute's token is redeemed passport looks up the original user as the content to run under
            var apikey = req.user.apikey;

            // TODO: Allow user to specify the tender site name
            // TODO: Allow user to specify multiple tender sites and store them in the database
            var tenderSite = 'appsecute';

            if (apikey) {
                // Use the API key to go get a list of components from Tender support
                tenderClient.listCategories(tenderSite, apikey, function (err, categories) {
                    if (!err) {
                        var components = {};

                        // TODO: Support multiple tender sites
                        components[tenderSite] = [];

                        _.each(categories, function (category) {
                            components[tenderSite].push(componentFromTenderCategory(tenderSite, category));
                        });

                        res.send(components);
                    }
                    else {
                        next(err); // Error listing categories from Tender
                    }
                });
            }
            else {
                // We don't have an API key associated with Appsecute's OAuth access token
                // Send a 401 to tell Appsecute to re-do OAuth authentication
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