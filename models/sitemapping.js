/**
 * A model representing a mapping between a Tender Support 'site' and a system in Appsecute.
 * @type {*}
 */

var mongoose = require('mongoose');
var database = require('../lib/database/database.js');

var tenderMappingSchema = new mongoose.Schema({

    // The date and time the mapping was created.
    created:{
        type:Date,
        required:true,
        default:Date.now()
    },

    // The name property of the Tender site.
    repo_full_name:{
        type:String,
        required:true
    },

    // The id of the Appsecute system the site is mapped to.
    system_id:{
        type:String,
        required:true
    },

    // The id of the Webhook that this connector created in Tender Support as a result of the mapping.
    hook_id:{
        type:String,
        required:true
    }
});

var tenderMappingModel = database.model('TenderMapping', tenderMappingSchema);

module.exports = tenderMappingModel;