/**
 * Web service Api calls for Tender Support to call.
 * @type {*}
 */

var gravatar = require('node-gravatar');
var appsecuteConnectorApi = require('appsecute-connector-api');

module.exports = function (app) {


    var samplePostDataNewDiscussion =
    {
        "assets": [],
        "author_email": "mark@appsecute.com",
        "author_name": "Mark Cox",
        "body": "This is a test discussion for testing integration with the new appsecute",
        "category": {
            "accept_email": null,
            "autoresponder_id": 0,
            // ...
            "updated_at": "2013-01-10T03:58:00Z",
            "visible": false
        },
        "created_at": "2013-01-10T03:58:00Z",
        "discussion": {
            "acknowledge_href": "https://api.tenderapp.com/appsecute/discussions/10309514/acknowledge",
            "activity_filter_stamp": null,
            // ...
            "via": "web",
            "watchers_count": 1
        },
        "formatted_body": "<div><p>This is a test discussion for testing integration with the new\nappsecute</p></div>",
        "html_href": "http://support.appsecute.com/discussions/test-category/2",
        "internal": false,
        "number": 1,
        "referrer": "http://support.appsecute.com/discussion/new",
        "resolution": null, "system_message": false,
        "user": {
            "activated_at": "2012-04-06T01:51:57Z",
            "avatar_url": "https://secure.gravatar.com/avatar/fdd24ea44cb4a0551de9fede4c459ec5?s=32&d=",
            // ...
            "trusted": true,
            "updated_at": "2013-01-10T03:58:00Z"
        },
        "user_agent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:17.0) Gecko/20100101 Firefox/17.0",
        "user_href": "https://api.tenderapp.com/appsecute/users/1793151",
        "user_ip": "203.173.191.4",
        "user_is_supporter": true,
        "via": "web"
    };


    var samplePostDataCommentOnDiscussion =
    {
        "assets":[],
        "author_email":"mark@appsecute.com",
        "author_name":"Mark Cox",
        "body":"First test reply",
        "category": {
            "accept_email":null,
            "autoresponder_id":0,
            "beta":false,
            "code":"4e5a75c3749437832cdb6491a84f2cdffed284e9",
            "created_at":"2013-01-10T03:51:37Z",
            "discussions_href":"https://api.tenderapp.com/appsecute/categories/71360/discussions{-opt|/|state}{state}{-opt|?|page,user_email}{-join|&|page,user_email}",
            "force_readonly":false,
            "formatted_summary":"",
            "heartbeat_on":"2013-01-10T03:51:37Z",
            "href":"https://api.tenderapp.com/appsecute/categories/71360",
            "html_href":"http://support.appsecute.com/discussions/test-category",
            "important":false,
            "last_comment_id":null,
            "last_discussion_id":null,
            "last_discussion_permalink":null,
            "last_updated_at":null,
            "last_user_email":null,
            "last_user_id":null,
            "last_user_name":null,
            "mail_template_id":0,
            "name":"Test Category",
            "permalink":"test-category",
            "public":false, "summary":"",
            "updated_at":"2013-01-10T04:00:34Z",
            "visible":false
        },
        "created_at":"2013-01-10T04:00:33Z",
        "discussion":{
            "acknowledge_href":"https://api.tenderapp.com/appsecute/discussions/10309514/acknowledge",
            "activity_filter_stamp":null,
            "author_email":"mark@appsecute.com",
            "author_name":"Mark Cox",
            "avg_response_time":1,
            "cached_queue_list":[],
            "category_href":"https://api.tenderapp.com/appsecute/categories/71360",
            "change_category_href":"https://api.tenderapp.com/appsecute/discussions/10309514/change_category?to={category_id}",
            "comments_count":2,
            "comments_href":"https://api.tenderapp.com/appsecute/discussions/10309514/comments{?page}",
            "company_id":null,
            "created_at":"2013-01-10T03:57:59Z",
            "extras":{
                "browser":"Firefox 17.0 (WOW64)"
             },
            "hidden":false,
            "href":"https://api.tenderapp.com/appsecute/discussions/10309514",
            "html_href":"http://support.appsecute.com/discussions/test-category/2",
            "last_author_email":"mark@appsecute.com",
            "last_author_name":"Mark Cox",
            "last_comment_id":23665747,
            "last_updated_at":"2013-01-10T04:00:33Z",
            "last_user_id":1793151,
            "last_via":"web",
            "number":2,
            "permalink":"test-discussion-1",
            "private_body":"<ul><li>Browser: Firefox 17.0 (WOW64)</li></ul>",
            "public":false,
            "queue_href":"https://api.tenderapp.com/appsecute/discussions/10309514/queue?queue={queue_id}",
            "redirection_id":null,
            "resolve_href":"https://api.tenderapp.com/appsecute/discussions/10309514/resolve",
            "restore_href":"https://api.tenderapp.com/appsecute/discussions/10309514/restore",
            "state":"open",
            "suggested_faqs":[ "65035", "65918" ],
            "title":"Test Discussion 1",
            "toggle_href":"https://api.tenderapp.com/appsecute/discussions/10309514/toggle",
            "unqueue_href":"https://api.tenderapp.com/appsecute/discussions/10309514/unqueue?queue={queue_id}",
            "unread":false,
            "unresolve_href":"https://api.tenderapp.com/appsecute/discussions/10309514/unresolve",
            "unresponded":false,
            "updated_at":"2013-01-10T04:00:35Z",
            "user_href":"https://api.tenderapp.com/appsecute/users/1793151",
            "via":"web",
            "watchers_count":1
        },
        "formatted_body":"<div><p>First test reply</p></div>",
        "html_href":"http://support.appsecute.com/discussions/test-category/2",
        "internal":false,
        "number":2,
        "referrer":"http://support.appsecute.com/discussions/test-category/2-test-discussion-1?unresolve=true",
        "resolution":null,
        "system_message":false,
        "user":{
            "activated_at":"2012-04-06T01:51:57Z",
            "avatar_url":"https://secure.gravatar.com/avatar/fdd24ea44cb4a0551de9fede4c459ec5?s=32&d=",
            "company_id":null,
            "created_at":"2012-04-06T01:51:57Z",
            "discussions_href":"https://api.tenderapp.com/appsecute/users/1793151/discussions{-opt|?|page,user_email}{-join|&|page,user_email}",
            "email":"mark@appsecute.com",
            "enable_email_notifications":true,
            "external_id":"mark@appsecute.com",
            "href":"https://api.tenderapp.com/appsecute/users/1793151",
            "name":"Mark Cox",
            "openid_url":null,
            "public_facing":true,
            "state":"support",
            "title":"Founder and CEO",
            "trusted":true,
            "updated_at":"2013-01-10T04:00:35Z"
        },
        "user_agent":"Mozilla/5.0 (Windows NT 6.1; WOW64; rv:17.0) Gecko/20100101 Firefox/17.0",
        "user_href":"https://api.tenderapp.com/appsecute/users/1793151",
        "user_ip":"203.173.191.4",
        "user_is_supporter":true,
        "via":"web"
    };

    /**
     * Called by Tender Support when a Tender Support Webhook is triggered to send us an event.
     */
    app.post('/tender/hooks/:tender_site', function (req, res) {
        // Extract category from posted data and use to construct our component ID
        var category = "all";
        if(req.body.category && req.body.category.permalink) {
            category = req.body.category.permalink;
        }
        var componentId = req.params.tender_site + '/' + category;

        console.log('Processing event from Tender Support for ' + componentId);

        // We get a call for each comment posted
        var event_id = req.params.tender_site + '-' + category + "-" + req.body.number;

        // Format the comment using markdown
        var content = '![Alt ' + req.body.author_name + '](' + gravatar.get(req.body.author_email, {}, true) + ')' +
            '> ' + req.body.body;

        // Publish the event to Appsecute
        appsecuteConnectorApi.publish(
            process.env.APPSECUTE_SECRET,
            encodeURIComponent(componentId),
            event_id,
            'Comment added to tender support site ' + componentId,
            content,
            [req.body.name, req.body.ref, 'commit', 'source'],
            'info',
            function () {
                res.send(200, {});
                console.log('Event successfully processed for ' + componentId);
            },
            function (err, resp) {
                res.send(200, {});
                console.log('Event processing failed for ' + componentId);
                console.log('Error was: ' + err ? JSON.stringify(err) : err);
                if( resp && resp.body ) {
                    console.log('Response was: ' + resp.body ? JSON.stringify(resp.body) : resp.body);
                }
                // TODO This could dump the event in to the database and try resend it to Appsecute later
            },
            function (body) {
                res.send(200, {});
                console.log('Event processing not required for ' + componentId + '. Pre-flight check indicated component is no longer mapped to any systems within Appsecute.');
                console.log('Appsecute responded with ' + body ? JSON.stringify(body) : body);
                // TODO: Indicate to people that they can remove the Webhook? If we can send a message back
            }
        );
    });
};
