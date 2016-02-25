var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CreditSchema = new Schema({

},{collection:'credits'});

CreditSchema.methods = {};
CreditSchema.statics = {};

module.exports = mongoose.model('Credit',CreditSchema);