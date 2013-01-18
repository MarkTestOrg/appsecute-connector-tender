/**
 * A Javascript client for the Tender Support REST API.
 * Copyright 2013 Appsecute Limited
 */

var request = require('request');
var _ = require('underscore');


module.exports = function () {
    // This is the list of functions to export
    var tenderClient = {};


    var makeTenderApiUrl = function(siteName) {
        return "http://api.tenderapp.com/" + siteName;
    }


    /**
     * Gets a list of the categories available. Data returned is an array of categories with each in the
     * form described in the Tender API documentation here:
     * http://help.tenderapp.com/kb/api/categories
     * @param {String} siteName The name of the tender site - this is a single string which is the subdomain within
     * tender (e.g. for the site "appsecute.tenderapp.com" the site name is "appsecute"
     * @param {String} apikey The API key to use to authenticate to tender (which implies a specific tender user)
     * @param {Function} done A function to call when finished with the signature done(err, categories)
     * @return {*} An array of categories as returned by the Tender API (see their site for details of fields)
     */
    tenderClient.listCategories = function(siteName, apikey, done) {
        request(
            {
                uri: makeTenderApiUrl(siteName) + '/categories',
                json: {},
                headers: {
                    'accept': 'application/vnd.tender-v1+json', // must ask for tender v1 JSON explicitly
                    'X-Tender-Auth': apikey
                }
            },
            function (err, resp, body) {
                if(err) { return done(err); }
                if(resp.statusCode != 200) { return done(new Error("Error fetching categories: " + resp.statusCode + ": " + body)); }
                if(!body.categories) { return done(new Error("Categories not found in response")); }

                // TODO: Deal with pages, probably by reading all pages and collecting
                done(null, body.categories);
            }
        );
    };


    return tenderClient;
}();
