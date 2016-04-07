var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');
var TimeHelper = require('../helper/myTime');
var moment = require('moment');
moment.locale('zh-cn'); // 使用中文

/**
 * 活动场景，根据
 */
var ActivitySceneSchema = new Schema({
    activity:{type:Schema.Types.ObjectId,ref:'Activity'}, //对应的活动
    user:{type:Schema.Types.ObjectId,ref:'User'}, //活动图片上传者
    description:{type:String,default:'',trim:true},  //活动图片描述
    pictures:[{type:String,default:'',trim:true}],  //活动图片
    is_delete:{type:Boolean,default:false},   //是否被删除
    create_at:{type:Date,default:Date.now},
},{collection:'activityscenes'});

var NotNullRule = [
    {col:"activity",msg:'未获取到活动信息，操作失败'},
    {col:'user',msg:'未获取到您的用户信息，请您重新登录后重试'},
];

var ActivitySceneRule = {
    "description":{
        min:0,
        max:60,
        ruleType:ruleType.STRLEN,
        msg:"活动图片描述少于60个字符"
    },
    "pictures":{
        lengthMax:9,
        ruleType:ruleType.ARRAYLEN,
        msg:"一次性最多只能添加9张图片"
    },
    "pictures":{
        ruleType:ruleType.ARRAYUNIQUE,
        msg:"活动图片添加不能重复"
    },
};

ActivitySceneSchema.methods = {

};

ActivitySceneSchema.statics = {

};

ActivitySceneSchema.plugin(deepPopulate,{});
baseSchemaMethod.regBeforeSave(ActivitySceneSchema,NotNullRule,ActivitySceneRule);

module.exports = mongoose.model('ActivityScene',ActivitySceneSchema);