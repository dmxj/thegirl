var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 关注集合，
 * 可以使关注用户、关注（收藏）商品、关注主题、关注（收藏）店铺
 */
var FollowSchema = new Schema({
    author:{type:Schema.Types.ObjectId,ref:'User'},   //用户ID
    userId:{type:Schema.Types.ObjectId,ref:'User',default:null},   //关注者的ID
    goodId:{type:Schema.Types.ObjectId,ref:'Good',default:null},   //商品的ID
    storeId:{type:Schema.Types.ObjectId,ref:'Store',default:null},   //店铺的ID
    topicId:{type:Schema.Types.ObjectId,ref:'Topic',default:null},   //主题的ID
    create_at:{type:Date,default:Date.now},
    in_follow:{type:Boolean,default:true},    //是否有效，默认有效，无效则为取消关注了
    cancel_follow_time:{type:Date,default:Date.now},    //取消关注的时间
},{collection:'follows'});

FollowSchema.methods = {};
FollowSchema.statics = {};

module.exports = mongoose.model('Follow',FollowSchema);
