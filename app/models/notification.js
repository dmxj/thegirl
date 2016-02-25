var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 通知集合
 * 系统通知、用户评论回复、加好友通知、收藏店铺通知、收藏商品通知、
 * 任务报名通知、活动报名通知、活动报名审核结果通知、购买商品通知
 */
var NotificationSchema = new Schema({
    user:{type:Schema.Types.ObjectId,ref:'User'},//发给某些人的
    content:{type:String,default:'',trim:true}, //内容
    readed: { type: Boolean, default: false },    //是否已读
    create_at: { type: Date, default: Date.now }
},{collection:'notifications'});

NotificationSchema.methods = {};
NotificationSchema.statics = {};

module.exports = mongoose.model('Notification',NotificationSchema);