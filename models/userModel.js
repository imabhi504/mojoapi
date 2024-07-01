const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

let InfluencerModel = new schema({
    influencer_id: {
        type: String,
        unique : true
    },
    first_name: {
        type: String // first_name of the influencer
    },
    last_name: {
        type: String // last_name of the influencer
    },
    name: {
        type: String // Cancat first & last name
    },
    email: {
        type: String // email of the influencer
    },
    facebook: {
        type: Array //type of an array include keys are id, email, first_name, last_name, name, picture, accounts,accesstoken, connection_type
    },
    
    profile_pic: {
        type: String, // pic of the influencer
        default: ""
    },
    status: {
        type: String,
        default: "",
        enum: ['', '1', '0','2'] //status - 0(inactive), 1(active), 2(barred)
    },
    registered_date: { // carry the date of influencer register on eleve platform
        type: Date,
        default:new Date()
    },
    oauth_token:{
        type: String
    },
    Elv_social:{
        type: String
    },
    type: {
        type:String
    },
    link: {
        type:String
    },
    followers_count: {
        type:Number
    },
    friends_count: {
        type:Number
    },
    profile_image_url: {
        type:String
    },
    connection_type: {
        type:String
    },
    is_auth_expired: {
        type:Boolean
    },
    createdAt: {
        type:Date
    },
    added_via: {
        type:Number
    },
    added_by: {
        type: Object
    },
    
},{timestamps:true});


InfluencerModel.plugin(mongoosePaginate)
InfluencerModel.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('influencers', InfluencerModel);