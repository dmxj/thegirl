var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');

//用户反馈集合
var FeedbackSchema = new Schema({
    author:{type:Schema.Types.ObjectId,ref:'User'},
    aboutlink:[{type:String,default:'',trim:true}], //相关页面，可添加多个
    content:{type:String,default:'',trim:true},
    is_delete:{type:Boolean,default:false}, //是否被删除，对用户不可见
    post_time:{type:Date,default:Date.now}
},{collection:'feedback'});

var NotNullRule = [
    {col:'author',msg:'反馈出错，无法获取用户信息！'},
    {col:'content',msg:'内容不能为空'},
];

var FeedbackRule = {
    aboutlink:{
        ruleType:ruleType.WEBSITE,
        message:'相关页面必须是合法的网址',
    },
    content:{
        min:7,
        max:200,
        ruleType:ruleType.STRLEN,
        msg:"反馈内容长度在7~200个字符之间"
    }
};

FeedbackSchema.methods = {};
FeedbackSchema.statics = {};

baseSchemaMethod.regBeforeSave(FeedbackSchema,NotNullRule,FeedbackRule);

module.exports = mongoose.model('Feedback',FeedbackSchema);