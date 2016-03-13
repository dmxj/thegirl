var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ArrayHelper = require('../helper/myArray');
var TimeHelper = require('../helper/myTime');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');
var moment = require('moment');
moment.locale('zh-cn'); // 使用中文

/**
 * 投票集合
 * 可以单选（用户只能做一次选择），多选（用户随后可以补充选择）
 * 可以限制人数，<=0为不限人数
 * 截止日期，空为不限，时间至少在半小时后
 */
var VoteSchema = new Schema({
    author:{type:Schema.Types.ObjectId,ref:'User'},   //发布者
    title:{type:String,default:'',trim:true},   //标题，不能为空
    content:{type:String,default:'',trim:true},   //内容，可以为空

    options:[{type:String,default:'',trim:true}],   //选项，不多于20个，不能重复
    user_limitation:{type:Number,default:-1},   //人数限制，默认-1为不限，0也为不限
    max_choice:{type:Number,default:1},   //最多能选多少个，默认1个,小于1
    ChoiceSituation:[{
        user:{type:Schema.Types.ObjectId,ref:'User'},   //发布者
        choice:[{type:Number,default:-1}],  //选择的索引，对应选项的顺序，单选只有一项
    }],
    ChoiceStats:[{
        users:[{type:Schema.Types.ObjectId,ref:'User'}],    //有哪些用户投了票
    }],  //投票统计信息

    endTime:{type:Date,default:null},   //截止日期，默认空为不限

    is_delete:{type:Boolean,default:false},   //投票是否被移除
    is_valid:{type:Boolean,default:true},   //投票是否合法
    visitCount:{type:Number,default:0}, //浏览次数
    create_at:{type:Date,default:Date.now},
},{collection:'votes'});

var NotNullRule = [
    {col:'author',msg:'无法获取您的用户信息，请稍后重试'},
    {col:'title',msg:'投票的标题不能为空'},
    {col:'options',msg:'投票的选项不能为空'},
];

var VoteRule = {
    "title":{
        min:3,
        max:30,
        ruleType:ruleType.STRLEN,
        msg:"投票的标题必须在3~30个字之间"
    },
    "content":{
        min:5,
        max:500,
        ruleType:ruleType.STRLEN,
        msg:"投票的内容描述必须在5~500个字之间"
    },
    "options":{
        ruleType:ruleType.ARRAYUNIQUE,
        msg:"投票的选项不能重复"
    },
    "options":{
        lengthMin:2,
        lengthMax:20,
        ruleType:ruleType.ARRAYLEN,
        msg:"投票的选项不能少于2个或多于20个"
    },

    "options":{
        min:1,
        max:300,
        ruleType:ruleType.STRLEN,
        msg:"投票的选项必须在1~300个字符之间"
    },
    "ChoiceSituation.choice":{
        min:0,
        ruleType:ruleType.NUMVAL,
        msg:"必须选择合法的选项"
    },
    "endTime":{
        isNew:true,
        minute:30,
        ruleType:ruleType.DATEAFTER,
        msg:"投票截止时间至少在投票开始半小时后"
    },
};

VoteSchema.virtual("dateline")
    .get(function(){
        return this.endTime ? TimeHelper.formatDate(this.endTime,true) : "不限日期";
    });

VoteSchema.methods = {

};

VoteSchema.statics = {

};

VoteSchema.plugin(deepPopulate,{})

baseSchemaMethod.regBeforeSave(VoteSchema,NotNullRule,VoteRule);
baseSchemaMethod.regPageQuery(VoteSchema,'Vote');

module.exports = mongoose.model('Vote',VoteSchema);