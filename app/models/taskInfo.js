var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TimeHelper = require('../helper/myTime');

/**
 * 任务进展集合
 * 任务进行的情况：报名的人、确认任务的时间
 */
var TaskInfoSchema = new Schema({
    taskId:{type:Schema.Types.ObjectId,ref:'Task'},  //对应的商品
    user:{type:Schema.Types.ObjectId,ref:'User'},   //接任务的人
    message:{type:String,trim:true,default:''},
    sign_time:{type:Date,default:Date.now()},   //接任务的时间
    post_time:{type:Date,default:Date.now()}    //提交任务的时间，界面上有确认按钮供用户确认
},{collection:'taskinfos'});

TaskInfoSchema.virtual('sign_at')
    .get(function(){
        return TimeHelper.formatDate(this.sign_time,false);
    });

TaskInfoSchema.virtual('post_at')
    .get(function(){
        return TimeHelper.formatDate(this.post_time,false);
    });

TaskInfoSchema.methods = {};
TaskInfoSchema.statics = {};

module.exports = mongoose.model('TaskInfo',TaskInfoSchema);