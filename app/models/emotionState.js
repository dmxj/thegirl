var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EmotionStateSchema = new Schema({
    name:{type:String,default:'',trim:true},    //名称
    order:{type:Number,default:0},  //排序
    create_at:{type:Date,default:Date.now},
    update_at:{type:Date,default:Date.now}
});

EmotionStateSchema.methods = {};
EmotionStateSchema.statics = {};

module.exports = mongoose.model('EmotionState',EmotionStateSchema);