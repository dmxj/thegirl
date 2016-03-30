var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');
var TimeHelper = require('../helper/myTime');
var FormType = require('../const/formType');

var formTypeArray = [];
for(var item in FormType){
    formTypeArray.push(FormType[item]);
}

/**
 * 活动表单集合
 * 由活动创建者创建，供用户报名者填写，最多可以创建十项
 */
var ActivityFormSchema = new Schema({
    activityId:{type:Schema.Types.ObjectId,ref:'Activity'}, //对应的Activity
    items:[{
        key:{type:String,default:'',trim:true}, //键
        name:{type:String,default:'',trim:true}, //标题
        type:{type:Number,default:0,enum:formTypeArray}, //表单类型
        tip:{type:String,default:'',trim:true}, //提示信息
        required:{type:Boolean,default:true},  //是否必须
        minLength:{type:Number,default:0}, //最小长度,0-10
        maxLength:{type:Number,default:500}, //最大长度,10-500
    }],
    create_at:{type:Date,default:Date.now}, //创建时间
},{collection:'activityforms'});

//ActivityFormSchema.pre('save',function(next){
//    var error = new Error('something wrong when you do some save');
//    error.name = "RuleError";
//});

var NotNullRule = [
    {col:"items.key",msg:'服务器错误'},
    {col:'items.name',msg:'表单标题不能为空'},
    {col:'items.type',msg:'表单的类型不能为空'},
];


var ActivityFormRule = {
    "items":{
        lengthMax:10,
        ruleType:ruleType.ARRAYlEN,
        msg:"您最多可以创建10项",
    },
    "items.name":{
        min:1,
        max:10,
        ruleType:ruleType.STRLEN,
        msg:"表单的长度在1~10个字符之间"
    },
    "item.tip":{
        min:0,
        max:22,
        ruleType:ruleType.STRLEN,
        msg:"表单项的提示的长度在0~22个字符之间"
    },
    "item.minLength":{
        min:0,
        max:10,
        ruleType:ruleType.NUMVAL,
        msg:"文本类型的表单项的最小长度在0-10之间"
    },
    "item.maxLength":{
        min:10,
        max:500,
        ruleType:ruleType.NUMVAL,
        msg:"文本类型的表单项的最小长度在10-500之间"
    },
};

ActivityFormSchema.virtual('create_time')
        .get(function(){
            return TimeHelper.formatDate(this.create_at,false);
        });

ActivityFormSchema.methods = {};
ActivityFormSchema.statics = {};

baseSchemaMethod.regBeforeSave(ActivityFormSchema,NotNullRule,ActivityFormRule);

module.exports = mongoose.model('ActivityForm',ActivityFormSchema);