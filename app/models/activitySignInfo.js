var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');

/**
 * 活动报名者报名信息集合
 */
var ActivitySignInfoSchema = new Schema({
    activityId:{type:Schema.Types.ObjectId,ref:'Activity'}, //对应的Activity
    signUser:{type:Schema.Types.ObjectId,ref:'User'},   //对应的报名者
    reviewStatus:{type:Number,default:0,enum:[0,1,2]},    //0为正在审核，1为审核失败，2为审核成功
    postFormInfo:[{
        key:{type:Boolean,default:true},    //键
        value:{type:Schema.Types.Mixed,default:null},   //值
    }],    //报名的提交的表单的信息
    noPassReason:{type:String,trim:true,default:''},    //未通过的理由
    signTime:{type:Date,default:Date.now},  //报名时间
    enterTime:{type:Date,default:Date.now}, //通过审核的时间
    is_quit:{type:Boolean,default:false},   //是否退出报名
    create_at:{type:Date,default:Date.now}
},{collection:'activitysigninfos'});

var NotNullRule = [
    {col:"activityId",msg:'未获取到活动信息，请稍后重试'},
    {col:'signUser',msg:'未获取到您的信息，请登录后重试'},
    {col:'activity_position',msg:'活动地点不能为空'},
    {col:'activity_time',msg:'活动开始时间不能为空'},
];

var ActivitySignInfoRule = {
    "reviewStatus":{
        array:[0,1,2],
        ruleType:ruleType.ARRAYIN,
        msg:"审核状态只能为正在审核、审核失败或审核成功"
    },
    "noPassReason":{
        min:0,
        max:20,
        ruleType:ruleType.STRLEN,
        msg:"报名者未通过审核的原因的长度在0~20个字符之间"
    },
    "postFormInfo.value":{
        min:0,
        max:500,
        ruleType:ruleType.STRLEN,
        msg:"报名的表单内容长度不能大于500个字符"
    },
};

var signStatusCollection = ["正在审核","审核失败","审核成功"];
ActivitySignInfoSchema.virtual("signStatus")
            .get(function(){
                return signStatusCollection[this.reviewStatus];
             });

ActivitySignInfoSchema.methods = {

};

ActivitySignInfoSchema.statics = {

};

ActivitySignInfoSchema.plugin(deepPopulate,{});
baseSchemaMethod.regBeforeSave(ActivitySignInfoSchema,NotNullRule,ActivitySignInfoRule);

module.exports = mongoose.model('ActivitySignInfo',ActivitySignInfoSchema);