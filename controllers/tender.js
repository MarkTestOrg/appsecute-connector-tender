/**
 * Web service Api calls for Tender Support to call.
 * @type {*}
 */

var async = require('async');
var _ = require('underscore');
var gravatar = require('node-gravatar');
var appsecuteConnectorApi = require('appsecute-connector-api');

module.exports = function (app) {

    /**
     * Called by Tender Support when a Tender Support Webhook is triggered to send us an event.
     */
    app.post('/tender/hooks/:owner_name', function (req, res) {

        var full_name = req.params.owner_name + '/' + req.params.repo_name;
        var content = '';

        console.log('Processing event from GitHub for ' + full_name);

        // Format each commit using markdown
        _.each(req.body.commits, function (commit) {
            content += '![Alt ' + commit.author.name + '](' + gravatar.get(commit.author.email, {}, true) + ')';
            content += '> ' + commit.message;
        });

        // Publish the event to Appsecute
        appsecuteConnectorApi.publish(
            process.env.APPSECUTE_SECRET,
            full_name,
            'Code pushed to ' + full_name,
            content,
            [req.body.name, req.body.ref, 'commit', 'source'],
            'info',
            function () {
                res.end(200, {});
                console.log('Event successfully processed for ' + full_name);
            },
            function (err, body) {
                res.end(200, {});
                console.log('Event processing failed for ' + full_name);
                console.log('Error was: ' + err ? JSON.stringify(err) : err);
                // TODO This could dump the event in to the database and try resend it to Appsecute later
            }
        );
    });
};