var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');
var TimeHelper = require('../helper/myTime');
var moment = require('moment');
moment.locale('zh-cn'); // 使用中文

/**
 * 任务集合
 * 发布任务，接收任务，并进行帮助。
 * 评论不等于接收任务，接收任务需要点击接收任务的操作
 * 作者可以挑选任务接收成功者，并评价（可带图），并进行相应奖赏，系统也会给任务完成者相应积分
 * 任务完成之后可以继续评价，但不能接收任务
 */
var TaskSchema = new Schema({
    //goodId:{type:Schema.Types.ObjectId,ref:'Good'},  //对应的商品
    author:{type:Schema.Types.ObjectId,ref:'User'},   //发布者
    title:{type:String,default:'',trim:true},  //任务标题
    content:{type:String,default:'',trim:true}, //内容
    reward:{type:String,default:'',trim:true},  //报酬
    remarks:[{type:String,default:'',trim:true,default:null}],  //作者添加的标注，可添加多条

    endTime:{type:Date,default:Date.now,default:null},   //截止时间,空为不截止

    comments:[{type:Schema.Types.ObjectId,ref:'Comment'}],  //评论
    receiveTasks:[{type:Schema.Types.ObjectId,ref:'TaskInfo'}], //接收任务的条目

    sureHelpId:{type:Schema.Types.ObjectId,ref:'TaskInfo',default:null},  //确认的接任务的ID
    sayToWinner:{type:String,default:'',trim:true}, //对任务完成者的评价

    is_finished:{type:Boolean,default:false}, //任务是否完成

    view_count:{type:Number,default:0}, //浏览量
    is_delete:{type:Boolean,default:false},
    is_valid:{type:Boolean,default:true},  //合法的任务，不违反规定
    create_at:{type:Date,default:Date.now},
    update_at:{type:Date,default:Date.now}
},{collection:'tasks'});

var NotNullRule = [
    {col:'author',msg:'无法获取您的用户信息，请重新登录后重试'},
    {col:'title',msg:'任务标题不能为空'},
    {col:'content',msg:'任务描述不能为空'},
    {col:'reward',msg:'任务报酬不能为空'},
];

var TaskRule = {
    title:{
        min:3,
        max:30,
        ruleType:ruleType.STRLEN,
        msg:"任务标题必须在3~30个字符之间"
    },
    content:{
        min:7,
        max:600,
        ruleType:ruleType.STRLEN,
        msg:"任务详情描述必须在7~600个字符之间"
    },
    reward:{
        min:3,
        max:50,
        ruleType:ruleType.STRLEN,
        msg:"报酬描述必须在3~50个字符之间"
    },
    remarks:{
        min:3,
        max:140,
        ruleType:ruleType.STRLEN,
        msg:"任务的remark必须少于140个字符"
    },
    endTime:{
        isNew:true,
        hour:12,
        ruleType:ruleType.DATEAFTER,
        msg:"任务截止至少在12小时后"
    },
    sayToWinner:{
        min:3,
        max:140,
        ruleType:ruleType.STRLEN,
        msg:"对任务完成者的评价必须在3~140个字符之间"
    },
};

TaskSchema.virtual('hotlevel')
    .get(function(){
        return this.view_count + this.comments.length * 2 + this.receiveTasks.length * 6;
    });

TaskSchema.virtual('isTimeOver')
    .get(function(){
        if(moment().isAfter(moment(this.endTime))){
            return true;
        }
        return false;
    });

TaskSchema.virtual('isEnd')
    .get(function(){
       if(moment().isAfter(moment(this.endTime)) || this.is_finished){
           return true;
       }
        return false;
    });

TaskSchema.virtual("dateline")
    .get(function(){
        return this.endTime ? TimeHelper.formatDate(this.endTime,true) : "不限日期";
    });

TaskSchema.methods = {};
TaskSchema.statics = {};

TaskSchema.plugin(deepPopulate,{})

baseSchemaMethod.regBeforeSave(TaskSchema,NotNullRule,TaskRule);
baseSchemaMethod.regMyfind(TaskSchema,'Task','author comments receiveTasks sureHelpId');
baseSchemaMethod.regPageQuery(TaskSchema,'Task');

module.exports = mongoose.model('Task',TaskSchema);