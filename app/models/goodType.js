var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 商品类型
 * 普通商品(大类分小类)、任务、服务、交友、拍卖、赠送、求助、活动
 */
var GoodTypeSchema = new Schema({
    parentId:{type:Schema.Types.ObjectId,ref:'GoodType',default:null}, //父类型
    sonIds:[{type:Schema.Types.ObjectId,ref:'GoodType',default:null}], //子类型们
    name:{type:String,trim:true,default:'普通'},
    create_at:{type:Date,default:Date.now},
    update_at:{type:Date,default:Date.now}
},{collection:'goodtypes'});

GoodTypeSchema.methods = {};
GoodTypeSchema.statics = {};

module.exports = mongoose.model('GoodType',GoodTypeSchema);