/**
 * A model representing a mapping between a GitHub repo and a system in Appsecute.
 * @type {*}
 */

var mongoose = require('mongoose');
var database = require('../lib/database/database.js');

var mappingSchema = new mongoose.Schema({

    // The date and time the mapping was created.
    created:{
        type:Date,
        required:true,
        default:Date.now()
    },

    // The 'full name' property of the GitHub repo.
    repo_full_name:{
        type:String,
        required:true
    },

    // The id of the Appsecute system the repo is mapped to.
    system_id:{
        type:String,
        required:true
    },

    // The id of the hook that this connector created in GitHub as a result of the mapping.
    hook_id:{
        type:String,
        required:true
    }
});

var mappingModel = database.model('Mapping', mappingSchema);

module.exports = mappingModel;