var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');
var TimeHelper = require('../helper/myTime');
var moment = require('moment');
moment.locale('zh-cn'); // 使用中文

var BlackListSchema = new Schema({
    author:{type:Schema.Types.ObjectId,ref:'User'},  //用户
    blacklist:[{type:Schema.Types.ObjectId,ref:'User'}],    //黑名单
    create_at:{type:Date,default:Date.now},
    update_at:{type:Date,default:Date.now}
},{collection:'blacklist'});

var NotNullRule = [
    {col:"author",msg:"未获取到您的信息，请登录后重试"},
];

var BlackListRule = {};

BlackListSchema.methods = {};
BlackListSchema.static = {};

BlackListSchema.plugin(deepPopulate,{});

baseSchemaMethod.regBeforeSave(BlackListSchema,NotNullRule,BlackListRule);
baseSchemaMethod.regPageQuery(BlackListSchema,'BlackList');
baseSchemaMethod.regFindAndCreate(BlackListSchema,'BlackList');

module.exports = mongoose.model('BlackList',BlackListSchema);
