var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var baseSchemaMethod = require('./baseSchemaMethod');

var TopicCommentSchema = new Schema({
    create_at:{type:Date,default:Date.now()},
},{collection:'topiccomments'});


TopicCommentSchema.methods = {};
TopicCommentSchema.statics = {};

module.exports = mongoose.model('TopicComment',TopicCommentSchema);