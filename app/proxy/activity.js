var ActivityModel = require('../models/activity');
var ActivitySignInfoModel = require('../models/activitySignInfo');
var ActivityFormModel = require('../models/activityForm');
var ActivityFormProxy = require('../proxy/activityForm');
var ArrayHelper = require('../helper/myArray');
var ObjectHelper = require('../helper/myObject');
var validator = require('validator');
var util = require('util');
var async = require('async');
var moment = require('moment');
moment.locale('zh-cn'); // 使用中文

//分页获取活动
exports.divderPageGetActivities = function(page,perpage,query,sort,callback)
{
    var _query = query || {};
    _query.is_delete = false;
    _query.is_valid = true;
    var _sort = sort || {};

    ActivityModel.pageQuery(page, perpage,"author author.school", _query, _sort,function(err,$page){
        return callback($page);
    });
};

//获取热门活动
exports.getHotActivity = function(num,callback)
{
    var opt = {limit:num};
    ActivityModel.find({is_delete:false,is_valid:true},'',opt,callback);
};

//根据ID获取活动
exports.getActivityById = function(id,callback)
{
    ActivityModel.findById(id)
        .deepPopulate("author author.school signForm")
        .exec(function(err,activity) {
            if (err || !activity) {
                return callback(null);
            }

            return callback(activity);
        });
}

//根据id获取活动及其统计
exports.getActivityAndStatById = function(myUid,id,callback)
{
    ActivityModel.findById(id)
        .deepPopulate("author author.school")
        .exec(function(err,activity){
            if(err || !activity){
                return callback(null);
            }
            if(!activity.is_delete && activity.is_valid) {
                activity.getSingInfoStat(myUid,function(stat,isAlreadySigned) {
                    activity.stat = stat;

                    activity.ifSigned = isAlreadySigned;

                    activity.signBoy = stat ? stat.signBoy : 0;
                    activity.signGirl = stat ? stat.signGirl : 0;
                    activity.passBoy = stat ? stat.passBoy : 0;
                    activity.passGirl = stat ? stat.passGirl : 0;

                    return callback(activity);
                });
            }else{
                return callback(activity);
            }
        });
};


//创建活动
exports.createActivity = function(myUid,title,detail,maxPeople,offline,condition,position,timestart,timeend,canSignAfterStart,isNeedReview,canOtherUpdateScene,formData,callback)
{
    async.waterfall([
        function(done){ //检测参数合法性
            if(!myUid){
                done("请登录后再进行操作",null);
            }else if(!title || !title.toString().trim()){
                done("活动标题不能为空",null);
            }else if(!detail || !detail.toString().trim()){
                done("活动详情不能为空",null);
            }else if(!position || !position.toString().trim()){
                done("活动地点不能为空",null);
            }else if(!timestart || !timestart.toString().trim()){
                done("活动开始时间不能为空",null);
            }else if(!validator.isDate(timestart)){
                done("活动开始时间不是正确的时间格式",null);
            }else if(!timeend || !timeend.toString().trim()){
                done("活动结束时间不能为空",null);
            }else if(!validator.isDate(timeend)){
                done("活动结束时间不是正确的时间格式",null);
            }else if(moment(timestart).isAfter(moment(timeend))){
                done("活动开始时间不能晚于活动结束时间",null);
            }else if(maxPeople && !validator.isNumeric(maxPeople)){
                done("活动最大参与人数必须是正确的数字",null);
            }else{
                done(null,formData);
            }
        },
        function(activityFormParams,done){  //如果需要创建活动表单，则创建
            if(ObjectHelper.checkObjArrayHasNull(activityFormParams)){
                done(null,null);
            }else{
                ActivityFormProxy.createSignForm(activityFormParams,function(errMsg,activityForm){
                    if(errMsg){
                        done(errMsg,null);
                    }else{
                        done(null,activityForm._id);
                    }
                });
            }
        },
        function(formId,done){    //创建活动
            console.log("标题："+title+",长度："+title.length);
            var activityInstance = new ActivityModel({author:myUid,title:title,detail:detail,activity_position:position,activity_timestart:timestart,activity_timeend:timeend,signForm:formId});
            activityInstance.maxPeople = maxPeople ? maxPeople : 0;
            activityInstance.offline = offline === false ? false : true;
            activityInstance.activity_condition = condition ? condition : "";
            activityInstance.canSignAfterStart = canSignAfterStart === false ? false : true;
            activityInstance.isNeedReview = isNeedReview === true ? true : false;
            activityInstance.canOtherUpdateScene = canOtherUpdateScene === false ? false : true;
            activityInstance.save(function(err){
                var errMsg = err ? (err.name == "RuleError" ? err.message : "发生错误，创建活动失败！") : null;
                if(err){
                    ActivityFormModel.remove(function(){
                        return callback(errMsg,activityInstance);
                    });
                }else{
                    return callback(errMsg,activityInstance);
                }
            });
        }
    ],function(err,results){
        return callback(err,results);
    });
}
