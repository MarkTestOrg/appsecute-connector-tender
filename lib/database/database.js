/**
 * A simple database wrapper for connecting to MongoDB.
 * @type {*}
 */

var databaseUrl = process.env.MONGO_DB || 'mongodb://localhost/test';
var mongoose = require('mongoose');
var db = mongoose.createConnection(databaseUrl);

db.on('error', console.error.bind(console, 'Connection error:'));

db.once('open', function callback() {
    console.log("Connected to MongoDB");
});

db.url = databaseUrl;

module.exports = db;