/**
 * A model representing a Client application that wants to talk OAuth to our server (e.g. Appsecute itself)
 * @type {*}
 */

var mongoose = require('mongoose');
var database = require('../lib/database/database.js');

var oauthClientSchema = new mongoose.Schema({
    // TODO: Add fields for client, see oauth2orize example for ideas
});

var oauthClientModel = database.model('OAuthClient', oauthClientSchema);

module.exports = oauthClientModel;
