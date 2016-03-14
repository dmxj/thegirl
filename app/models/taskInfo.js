var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TimeHelper = require('../helper/myTime');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');

/**
 * 任务进展集合
 * 任务进行的情况：报名的人、确认任务的时间
 */
var TaskInfoSchema = new Schema({
    //taskId:{type:Schema.Types.ObjectId,ref:'Task'},  //对应的任务
    user:{type:Schema.Types.ObjectId,ref:'User'},   //接任务的人
    message:{type:String,trim:true,default:''},
    sign_time:{type:Date,default:Date.now()},   //接任务的时间

    supportUser:[{type:Schema.Types.ObjectId,ref:'User',default:null}],  //支持的人

    comments:[{type:Schema.Types.ObjectId,ref:'Comment'}],  //评论

    post_content:{type:String,trim:true,default:''},    //提交任务的内容
    post_time:{type:Date,default:Date.now()},    //提交任务的时间，界面上有确认按钮供用户确认
    is_delete:{type:Boolean,default:false}  //是否已删除
},{collection:'taskinfos'});

var NotNullRule = [
    {col:'user',msg:'无法获取您的用户信息，请重新登录后重试'},
    {col:'message',msg:'申请接受任务信息不能为空'},
];

var TaskInfoRule = {
    "message":{
        min:7,
        max:200,
        ruleType:ruleType.STRLEN,
        msg:"申请任务信息在8-200个字符之间"
    },
    "post_content":{
        min:7,
        max:500,
        ruleType:ruleType.STRLEN,
        msg:"提交任务内容在7-500个字符之间"
    }
};

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

TaskInfoSchema.plugin(deepPopulate,{})

baseSchemaMethod.regBeforeSave(TaskInfoSchema,NotNullRule,TaskInfoRule);
baseSchemaMethod.regPageQuery(TaskInfoSchema,'TaskInfo');
baseSchemaMethod.regLike(TaskInfoSchema,'supportUser',{likeFault:"支持失败",likeSuccess:"支持成功",cancelLikeFault:"取消支持成功",cancelLikeSuccess:"取消支持失败"});

module.exports = mongoose.model('TaskInfo',TaskInfoSchema);