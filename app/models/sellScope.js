var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 销售范围
 * 本学院、本校、本区域、本市、本省、国内、全球，不限，自定义
 */
var SellScopeSchema = new Schema({
    author:{type:Schema.Types.ObjectId,ref:'User',default:null}, //作者
    name:{type:String,trim:true,default:'不限'},
    order:{type:Number,default:0},  //排序
    create_time:{type:Date,default:Date.now},
    last_update_time:{type:Date,default:Date.now}
},{collection:'sellscopes'});

SellScopeSchema.methods = {};
SellScopeSchema.statics = {};

module.exports = mongoose.model('SellScope',SellScopeSchema);