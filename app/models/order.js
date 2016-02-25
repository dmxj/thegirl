var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 订单集合
 */
var OrderSchema = new Schema({
    buyer:{type:Schema.Types.ObjectId,ref:'User'}, //购买者
    goodId:{type:Schema.Types.ObjectId,ref:'Good'},//对应的商品
    buy_time:{type:Date,default:Date.now},  //购买日期
    receive_time:{type:Date,default:Date.now}, //收货日期
    comments:[{type:Schema.Types.ObjectId,ref:'Comment'}],
    isValid:{type:Boolean,default:true}, //是否有效，用户移除
    isPaid:{type:Boolean,default:false}, //是否已支付
    isCancel:{type:Boolean,default:false}, //是否被取消
    cancelReason:{type:Schema.Types.ObjectId,ref:'CancelReason',default:null}, //取消原因
},{collection:'orders'});

OrderSchema.methods = {};
OrderSchema.statics = {};

module.exports = mongoose.model('Order',OrderSchema);
