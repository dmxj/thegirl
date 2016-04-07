var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');
var TimeHelper = require('../helper/myTime');
var FormType = require('../const/formType');
var moment = require('moment');
moment.locale('zh-cn'); // 使用中文

/**
 * 活动集合
 * 如果活动结束或者活动人数已满则不能报名，不符合条件也不能报名
 */
var ActivitySchema = new Schema({
    author:{type:Schema.Types.ObjectId,ref:'User'},  //对应的发布者
    title:{type:String,default:'',trim:true},   //活动标题
    detail:{type:String,default:'',trim:true},  //活动详情
    poster:{type:String,default:null,trim:true},  //活动海报
    maxPeople:{type:Number,default:0},  //最多人数,0为不限制
    offline:{type:Boolean,default:true},   //默认线下活动
    activity_condition:{type:String,default:'',trim:true},  //报名活动的条件，空为不限
    activity_position:{type:String,trim:true,default:''},    //活动地点

    activity_timestart:{type:Date,default:null},  //活动开始时间
    activity_timeend:{type:Date,default:null},   //活动结束时间
    canSignAfterStart:{type:Boolean,default:true},  //活动开始后是否可以继续报名

    isNeedReview:{type:Boolean,default:false},  //是否需要审核，一旦确定，不能更改
    signForm:{type:Schema.Types.ObjectId,ref:'ActivityForm',default:null},  //报名表单

    canOtherUpdateScene:{type:Boolean,default:true},  //非活动发布者是否可以上传活动图片
    //activity_scene:[{
    //    user:{type:Schema.Types.ObjectId,ref:'User'}, //活动图片上传者
    //    description:{type:String,default:'',trim:true},  //活动图片描述
    //    pictures:[{type:String,default:'',trim:true}],  //活动图片
    //}],  //活动场景

    viewCount:{type:Number,default:0},   //浏览次数
    is_delete:{type:Boolean,default:false}, //是否已被删除
    is_valid:{type:Boolean,default:true},  //合法的活动，不违反规定
    create_at:{type:Date,default:Date.now},
    update_at:{type:Date,default:Date.now}
},{collection:'activities'});

var NotNullRule = [
    {col:"author",msg:"未获取到您的信息，请登录后重试"},
    {col:"title",msg:'活动标题不能为空'},
    {col:'detail',msg:'活动详情不能为空'},
    {col:'activity_position',msg:'活动地点不能为空'},
    {col:'activity_timestart',msg:'活动开始时间不能为空'},
    {col:'activity_timeend',msg:'活动结束时间不能为空'},
];

var ActivityRule = {
    "title":{
        min:3,
        max:50,
        ruleType:ruleType.STRLEN,
        msg:"活动标题的长度在3~50个字符之间"
    },
    "detail":{
        min:10,
        max:500,
        ruleType:ruleType.STRLEN,
        msg:"活动详情的长度在0~500个字符之间"
    },
    "maxPeople":{
        min:0,
        max:100000,
        ruleType:ruleType.NUMVAL,
        msg:"活动的最大人数必须在0-100000之间"
    },
    "activity_condition":{
        min:0,
        max:30,
        ruleType:ruleType.STRLEN,
        msg:"报名活动的长度在0~30个字符之间"
    },
    "activity_position":{
        min:2,
        max:24,
        ruleType:ruleType.STRLEN,
        msg:"活动地点的长度在2~24个字符之间"
    },
    "activity_timestart":{
        ruleType:ruleType.DATEAFTER,
        msg:"活动开始时间不能早于现在"
    },
    "activity_timeend":{
        ruleType:ruleType.DATEAFTER,
        msg:"活动结束时间不能早于现在"
    },
    "activity_scene.description":{
        min:0,
        max:60,
        ruleType:ruleType.STRLEN,
        msg:"活动图片描述少于60个字符"
    },
    "activity_scene.pictures":{
        lengthMax:9,
        ruleType:ruleType.ARRAYLEN,
        msg:"一次性最多只能添加9张图片"
    },
    "activity_scene.pictures":{
        ruleType:ruleType.ARRAYUNIQUE,
        msg:"活动图片添加不能重复"
    },
};

//活动报名人数限制
ActivitySchema.virtual('signLimit')
    .get(function(){
        return this.maxPeople > 0 ? this.maxPeople : "不限";
    });

//活动报名条件
ActivitySchema.virtual('signCondition')
    .get(function(){
        return this.activity_condition.trim() != "" ? this.activity_condition : "无";
    });

//活动形式
ActivitySchema.virtual('line')
    .get(function(){
        return this.offline ? "线下" : "线上";
    });

//活动地点
ActivitySchema.virtual('where')
    .get(function(){
        return this.offline ? this.activity_position : "线上";
    });

ActivitySchema.virtual("ifNeedReview")
    .get(function(){
        return this.isNeedReview ? "需要" :"不需要审核，直接报名通过";
    });

//活动开始时间
ActivitySchema.virtual('activityTime')
    .get(function(){
        return TimeHelper.formatDate(this.activity_timestart,false);
    });

//活动结束时间
ActivitySchema.virtual('activityFinishTime')
    .get(function(){
        return TimeHelper.formatDate(this.activity_timeend,false);
    });

//创建时间
ActivitySchema.virtual('createTime')
    .get(function(){
        return TimeHelper.formatDate(this.create_at,false);
    });

var ActivitySignInfoModel = require('./activitySignInfo');
ActivitySchema.methods = {

    getSingInfoStat:function(myUid,callback){ //查找报名统计
        ActivitySignInfoModel.find({activityId:this._id})
            .deepPopulate("signUser signUser.school")
            .exec(function(err,userInfos){
                if(err || !userInfos || userInfos.length <= 0){
                    return callback(null,false);
                }

                var signBoy = 0,signGirl = 0,passBoy = 0,passGirl = 0;
                var schoolGroup = {};
                var userList = [];
                var mySignStatus = null;
                var isAlreadySigned = false;
                userInfos.forEach(function(info){
                    info.signUser.signStatus = info.signStatus;
                    userList.push(info.signUser.filterUser());

                    if(myUid && info.signUser._id.toString() == myUid.toString()){
                        mySignStatus = info.signStatus;
                        isAlreadySigned = true;
                    }

                    if(info.signUser.gender){   //男
                        signBoy ++;
                        if(info.reviewStatus == 2) passBoy ++;
                    }else{
                        signGirl ++;
                        if(info.reviewStatus == 2) passGirl ++;
                    }

                    var schoolName = info.signUser.school.schoolname;
                    if(schoolGroup.hasOwnProperty(schoolName)){
                        schoolGroup[schoolName] ++;
                    }else{
                        schoolGroup[schoolName] = 1;
                    }

                });

                return callback({signBoy:signBoy,signGirl:signGirl,passBoy:passBoy,passGirl:passGirl,school:schoolGroup,userList:userList,mySignStatus:mySignStatus},isAlreadySigned);
            });
    }
};

ActivitySchema.statics = {};

ActivitySchema.plugin(deepPopulate,{});

baseSchemaMethod.regBeforeSave(ActivitySchema,NotNullRule,ActivityRule);
baseSchemaMethod.regPageQuery(ActivitySchema,'Activity');

var ActivityModel = mongoose.model('Activity',ActivitySchema);

module.exports = ActivityModel;