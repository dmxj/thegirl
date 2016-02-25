var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 取消订单原因
 */
var CancelReasonSchema = new Schema({
    author:{type:Schema.Types.ObjectId,ref:'User',default:null}, //作者
    name:{type:String,trim:true,default:'不限'},
    create_time:{type:Date,default:Date.now},
    last_update_time:{type:Date,default:Date.now}
},{collection:'cancelreasons'});

CancelReasonSchema.methods = {};
CancelReasonSchema.statics = {};

module.exports = mongoose.model('CancelReason',CancelReasonSchema);