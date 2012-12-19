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
            encodeURIComponent(full_name),
            event_id,
            'Code pushed to ' + full_name,
            content,
            [req.body.name, req.body.ref, 'commit', 'source'],
            'info',
            function () {
                res.send(200, {});
                console.log('Event successfully processed for ' + full_name);
            },
            function (err, resp) {
                res.send(200, {});
                console.log('Event processing failed for ' + full_name);
                console.log('Error was: ' + err ? JSON.stringify(err) : err);
                console.log('Response was: ' + resp.body ? JSON.stringify(resp.body) : resp.body);
                // TODO This could dump the event in to the database and try resend it to Appsecute later
            },
            function (body) {
                res.send(200, {});
                console.log('Event processing not required for ' + full_name + '. Pre-flight check indicated component is no longer mapped to any systems within Appsecute.');
                console.log('Appsecute responded with ' + body ? JSON.stringify(body) : body);
                // TODO Delete the mapping and webhook within GitHub
            }
        );

    });
};