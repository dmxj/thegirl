var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 活动信息集合
 */
var ActivityInfoSchema = new Schema({
    activityId:{type:Schema.Types.ObjectId,ref:'Activity'}, //对应的Activity
    signUser:{type:Schema.Types.ObjectId,ref:'User'},   //对应的报名者
    postFormInfo:[{
        key:{type:Boolean,default:true},    //键
        value:{type:Schema.Types.Mixed,default:null},   //值
    }],    //报名的提交的表单的信息
    isEnterSucess:{type:Boolean,default:true},  //是否通过审核，默认是
    signTime:{type:Date,default:Date.now},  //报名时间
    enterTime:{type:Date,default:Date.now}, //通过审核的时间
    is_quit:{type:Boolean,default:false},   //是否退出报名
    create_at:{type:Date,default:Date.now}
},{collection:'activityinfos'});

ActivityInfoSchema.methods = {};
ActivityInfoSchema.statics = {};

module.exports = mongoose.model('ActivityInfo',ActivityInfoSchema);