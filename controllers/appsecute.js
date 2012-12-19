/**
 * Appsecute Api Webservices.
 * @type {*}
 */

var async = require('async');
var _ = require('underscore');
var siteMappingModel = require('../models/sitemapping.js');


module.exports = function (app) {

    /**
     * Gets the current url of the server.
     */
    var getServerUrl = function (req) {
        return req.protocol + "://" + req.headers.host;
    };


    /**
     * Formats a GitHub repo as an Appsecute component.
     * @param {Object} repo The GitHub repo.
     * @return {Object} A component ready to be sent to Appsecute.
     */
    var componentFromRepo = function (repo) {
        return {
            id:encodeURIComponent(repo.full_name),
            name:repo.name,
            description:repo.description
        }
    };


    /**
     * Appsecute calls this to get a listing of components for the current user.
     */
    app.get('/appsecute/components', function (req, res) {

        // TODO Need to respond with 401 if token is bad

        var github = new gitHubApi({
            version:'3.0.0'
        });

        github.authenticate({
            type:'oauth',
            token:req.query.access_token
        });

        // Need to get all repos from the users personal account and all orgs they have access to
        async.parallel({
                user_repos:function (callback) {
                    github.user.get({}, function (err, user) {
                        if (!err) {
                            github.repos.getAll({}, function (err, repos) {
                                callback(err, {owner:user.login, repos:repos});
                            });
                        } else {
                            callback(err);
                        }
                    });
                },
                org_repos:function (callback) {
                    github.user.getOrgs({}, function (err, orgs) {
                        if (!err) {

                            var result = [];

                            _.each(orgs, function (org) {

                                github.repos.getFromOrg(
                                    {org:org.login},
                                    function (err, repos) {
                                        result.push({owner:org.login, repos:repos});

                                        if (result.length >= orgs.length) {
                                            callback(err, result);
                                        }
                                    }
                                );
                            });
                        } else {
                            callback(err);
                        }
                    });
                }
            },
            function (err, result) {
                if (err) {
                    res.send(400, err)
                } else {

                    var components = {};

                    if (result.user_repos) {
                        components[result.user_repos.owner] = [];
                        _.each(result.user_repos.repos, function (repo) {
                            components[result.user_repos.owner].push(componentFromRepo(repo));
                        });
                    }

                    if (result.org_repos) {
                        _.each(result.org_repos, function (org) {
                            components[org.owner] = [];
                            _.each(org.repos, function (repo) {
                                components[org.owner].push(componentFromRepo(repo));
                            });
                        });
                    }

                    res.send(components);
                }
            }
        );
    });


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