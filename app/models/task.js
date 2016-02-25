var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');

/**
 * 任务集合
 * 发布任务，接收任务，并进行帮助。
 * 评论不等于接收任务，接收任务需要点击接收任务的操作
 * 作者可以挑选任务接收成功者，并评价（可带图），并进行相应奖赏，系统也会给任务完成者相应积分
 * 任务完成之后可以继续评价，但不能接收任务
 */
var TaskSchema = new Schema({
    goodId:{type:Schema.Types.ObjectId,ref:'Good'},  //对应的商品
    reward:{type:String,default:'',trim:true},  //报酬
    content:{type:String,default:'',trim:true}, //内容
    remarks:[{type:String,default:'',trim:true}],  //作者添加的标注，可添加多条
    comments:[{type:Schema.Types.ObjectId,ref:'Comment'}],  //评论
    receiveTasks:[{type:Schema.Types.ObjectId,ref:'TaskInfo'}], //接收任务的条目
    sureHelpId:{type:Schema.Types.ObjectId,ref:'TaskInfo',default:null},  //确认的接任务的ID
    sayToWinner:{type:String,default:'',trim:true}, //对任务完成者的评价
    view_count:{type:Number,default:0}, //浏览量
    is_delete:{type:Boolean,default:false},
    is_valid:{type:Boolean,default:true},  //合法的任务，不违反规定
    create_at:{type:Date,default:Date.now},
    update_at:{type:Date,default:Date.now}
},{collection:'tasks'});

var NotNullRule = [
    {col:'reward',msg:'任务报酬不能为空'},
    {col:'content',msg:'任务描述不能为空'},
];

var TaskRule = {
    reward:{
        min:3,
        max:50,
        ruleType:ruleType.STRLEN,
        msg:"报酬描述必须在3~50个字符之间"
    },
    content:{
        min:7,
        max:600,
        ruleType:ruleType.STRLEN,
        msg:"任务详情描述必须在7~600个字符之间"
    },
    remarks:{
        min:7,
        max:140,
        ruleType:ruleType.STRLEN,
        msg:"任务的remark必须在3~140个字符之间"
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

TaskSchema.methods = {};
TaskSchema.statics = {};

baseSchemaMethod.regBeforeSave(TaskSchema,NotNullRule,TaskRule);
baseSchemaMethod.regMyfind(TaskSchema,'Task','goodId comments receiveTasks sureHelpId');

module.exports = mongoose.model('Task',TaskSchema);