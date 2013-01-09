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
    var componentFromTenderCategory = function (category) {
        return {
            name:category.name,
            id:category.permalink, // this is the 'sanitised name' from tender
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
                            components[tenderSite].push(componentFromTenderCategory(category));
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
    app.post('/appsecute/components/:id/mappings', function (req, res) {

        // TODO Need to respond with 401 if token is bad

        // Create a web hook in GitHub so that when some activity occurs on the repo the connector will be notified.
        // The connector can then push the activity to Appsecute.

        // We're using the repo 'full name' as the unique id of the repo
        var full_name = decodeURIComponent(req.params.id);
        var split = full_name.split('/');
        var owner_name = split[0];
        var repo_name = split[1];

        // Make sure we haven't set up a mapping for this before
        repoMappingModel.find(
            {repo_full_name:full_name},
            function (err, mapping) {
                if (!mapping) {

                    // We haven't previously installed a webhook so lets do it
                    var github = new gitHubApi({
                        version:'3.0.0'
                    });

                    github.authenticate({
                        type:'oauth',
                        token:req.query.access_token
                    });

                    github.repos.createHook(
                        {
                            user:owner_name,
                            repo:repo_name,
                            name:'web',
                            events:['push'],
                            active:true,
                            config:{
                                "url":getServerUrl(req) + '/github/hooks/' + owner_name + '/' + repo_name + '?secret=' + process.env.APPSECUTE_SECRET, // TODO This needs to be in a header
                                "content_type":'json'
                            }
                        },
                        function (err, hook) {
                            if (!err) {

                                console.log('GitHub hook installed for ' + full_name);

                                var repoMapping = new repoMappingModel({
                                    repo_full_name:full_name,
                                    hook_id:hook.id
                                });

                                repoMapping.save(function (err) {
                                    if (!err) {
                                        res.send(200);
                                        console.log('Mapping saved for ' + full_name);
                                    } else {
                                        // TODO Delete the hook
                                        console.log('Failed to save mapping for ' + full_name);
                                        res.send(400, err);
                                    }
                                });
                            } else {
                                res.send(400, err);
                                console.log('Failed to install GitHub hook for ' + full_name);
                            }
                        }
                    );
                } else {
                    // Nothing to do, we already have a webhook installed on the repo
                    // TODO We could double check the hook still exists and that a user hasn't manually removed it from within GitHub
                    res.send(200, {});
                }
            }
        );
    });


    /**
     * Appsecute calls this when the user unmaps a component
     */
    app.delete('/appsecute/components/:id/mappings', function (req, res) {

        // TODO Need to respond with 401 if token is bad
        // TODO Delete hook
        // TODO Delete mapping

        console.log('Unmapping ' + req.params.id);
    });
};