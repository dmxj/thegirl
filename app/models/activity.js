var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');
var TimeHelper = require('../helper/myTime');
var FormType = require('../const/formType');

/**
 * 活动集合
 * 如果活动结束或者活动人数已满则不能报名，不符合条件也不能报名
 */
var ActivitySchema = new Schema({
    goodId:{type:Schema.Types.ObjectId,ref:'Good'},  //对应的商品
    title:{type:String,default:'',trim:true},   //活动标题
    detail:{type:String,default:'',trim:true},  //活动详情
    maxPeople:{type:Number,default:0},  //最多人数,0为不限制
    offline:{type:Boolean,default:true},   //默认线下活动
    activity_condition:{type:String,default:'',trim:true},  //报名活动的条件，空为不限
    activity_position:{type:String,trim:true,default:''},    //活动地点
    activity_time:{type:Date,default:null},  //活动开始时间
    activity_length:{type:Number,default:0},   //活动时长,单位：小时,0为无限制

    isNeedReview:{type:Boolean,default:false},  //是否需要审核，一旦确定，不能更改
    signForm:{type:Schema.Types.ObjectId,ref:'ActivityForm',default:null},  //对应的报名的表单
    signInfos:[
        {
            signUser:{type:Schema.Types.ObjectId,ref:'User'},   //对应的报名者
            isReviewSucess:{type:Boolean,default:true},  //是否通过审核，默认是
            reviewStatus:{type:Number,default:0,enum:[0,1,2]},    //0为正在审核，1为审核失败，2为审核成功
            noPassReason:{type:String,default:'',trim:true},    //未审核通过的原因
            signTime:{type:Date,default:Date.now},  //报名时间
            enterTime:{type:Date,default:Date.now}, //通过审核的时间
            is_quit:{type:Boolean,default:false},   //是否退出报名
            postFormInfo:[{
                key:{type:Boolean,default:true},    //键
                value:{type:Schema.Types.Mixed,default:null},   //值
            }],    //报名的提交的表单的信息
        }
    ],    //报名的信息

    viewCount:{type:Number,default:0},   //浏览次数
    is_delete:{type:Boolean,default:false}, //是否已被删除
    is_valid:{type:Boolean,default:true},  //合法的活动，不违反规定
    create_at:{type:Date,default:Date.now},
    update_at:{type:Date,default:Date.now}
},{collection:'activities'});

var NotNullRule = [
    {col:"title",msg:'活动标题不能为空'},
    {col:'detail',msg:'活动详情不能为空'},
    {col:'activity_position',msg:'活动地点不能为空'},
    {col:'activity_time',msg:'活动开始时间不能为空'},
];

var ActivityRule = {
    "title":{
        min:3,
        max:15,
        ruleType:ruleType.STRLEN,
        msg:"活动标题的长度在3~15个字符之间"
    },
    "detail":{
        min:10,
        max:500,
        ruleType:ruleType.STRLEN,
        msg:"活动详情的长度在0~22个字符之间"
    },
    "maxPeople":{
        min:0,
        max:100000,
        ruleType:ruleType.NUMVAL,
        msg:"活动的最大人数必须在0-100000之间"
    },
    "activity_condition":{
        min:3,
        max:30,
        ruleType:ruleType.STRLEN,
        msg:"报名活动的长度在3~30个字符之间"
    },
    "activity_position":{
        min:2,
        max:10,
        ruleType:ruleType.STRLEN,
        msg:"活动地点的长度在2~10个字符之间"
    },
    "activity_length":{
        min:0,
        max:60*24*100,
        ruleType:ruleType.NUMVAL,
        msg:"活动的时长不能超过100天"
    },
    "signInfos.noPassReason":{
        min:2,
        max:20,
        ruleType:ruleType.STRLEN,
        msg:"报名者未通过审核的原因的长度在2~20个字符之间"
    },
    "signInfos.postFormInfo.value":{
        min:0,
        max:500,
        ruleType:ruleType.STRLEN,
        msg:"报名的表单内容长度不能大于500个字符"
    },
};

//所有的报名者
ActivitySchema.virtual('signer')
    .get(function(){
        var signer = [];
        var boys = 0,girls = 0;
        var infos = this.signInfos;
        if(!infos || infos.length <= 0){
            return [0,0];
        }

        for(var i in infos){
            if(infos[i].signUser.gender){   //男的
                boys++;
            }else{
                girls++;
            }
        }
        signer.push(boys,girls);
        return signer;
    });

//所有的通过者
ActivitySchema.virtual('passer')
    .get(function(){
        var passer = [];
        var boys = 0,girls = 0;
        var infos = this.signInfos;
        if(!infos || infos.length <= 0){
            return [0,0];
        }

        for(var i in infos){
            if(infos[i].isReviewSucess && infos[i].signUser.gender){   //男的
                boys++;
            }else if(infos[i].isReviewSucess){
                girls++;
            }
        }
        passer.push(boys,girls);
        return passer;
    });

//热度
ActivitySchema.virtual('hotlevel')
    .get(function(){
        return this.viewCount + this.signInfos.length * 6;
    });

//创建时间
ActivitySchema.virtual('create_time')
    .get(function(){
        return TimeHelper.formatDate(this.create_at,false);
    });

ActivitySchema.methods = {};
ActivitySchema.statics = {};

baseSchemaMethod.regBeforeSave(ActivitySchema,NotNullRule,ActivityRule);

module.exports = mongoose.model('Activity',ActivitySchema);