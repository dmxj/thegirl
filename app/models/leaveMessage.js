var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');
var TimeHelper = require('../helper/myTime');
var moment = require('moment');
moment.locale('zh-cn'); // 使用中文

var LeaveMessageSchema = new Schema({
    leaveUser:{type:Schema.Types.ObjectId,ref:'User'},  //留言者
    toUser:{type:Schema.Types.ObjectId,ref:'User'},  //向谁留言

    messageContent:{type:String,default:'',trim:true},  //留言信息
    replyList:[{type:Schema.Types.ObjectId,ref:'LeaveMessage'}],//回复列表

    is_delete:{type:Boolean,default:false}, //是否已被删除
    create_at:{type:Date,default:Date.now},
    update_at:{type:Date,default:Date.now}
},{collection:'leavemessages'});

var NotNullRule = [
    {col:"leaveUser",msg:"未获取到您的信息，请登录后重试"},
    {col:"toUser",msg:'未获取到对方信息，请稍后重试'},
    {col:'messageContent',msg:'留言信息不能为空'},
];

var LeaveMessageRule = {
    "messageContent":{
        min:3,
        max:500,
        ruleType:ruleType.STRLEN,
        msg:"留言信息在3-500个字符之间"
    },
    "replyList":{
        lengthMax:50,
        ruleType:ruleType.ARRAYLEN,
        msg:"你们俩不能这样无休止的回复下去了"
    },
};

LeaveMessageSchema.methods = {};
LeaveMessageSchema.static = {};

LeaveMessageSchema.plugin(deepPopulate,{});

baseSchemaMethod.regBeforeSave(LeaveMessageSchema,NotNullRule,LeaveMessageRule);
baseSchemaMethod.regPageQuery(LeaveMessageSchema,'LeaveMessage');

module.exports = mongoose.model('LeaveMessage',LeaveMessageSchema);