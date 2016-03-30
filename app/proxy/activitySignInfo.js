var ActivityModel       =   require('../models/activity')
    , ActivityFormModel =   require('../models/activityForm')
    , ActivitySignInfoModel = require('../models/activitySignInfo')
    , ActivityFormProxy =   require('./activityForm');

var async = require('async');
var moment = require('moment');
moment.locale('zh-cn'); // 使用中文

//是否报名已经超限
function ifSignOverMaxPeople(activityId,max,callback){
    ActivitySignInfoModel.find({activityId:activityId,is_quit:false},function(err,infos){
        if(err || !infos){
            return callback("服务器错误");
        }else if(infos.length >= max){
            return callback("报名人数已达上线，无法报名了");
        }else{
            return callback(null);
        }
    });
}

//活动报名，不需要填表
exports.signNoForm = function(myUid,activityId,callback)
{
    if(!myUid){
        return callback("请登录后再进行相关操作");
    }
    async.waterfall({
        findIfExitActivity:function(done){//检查活动是否存在
            ActivityModel.findOne({_id:activityId,is_delete:false,is_valid:true},function(err,activity) {
                if(err || !activity){
                    done("未查找到该活动信息，请刷新重试",null);
                }else if(!activity.canSignAfterStart && moment().diff(moment(activity.activity_time),"second",true) > 2){
                    done("活动已经开始了，本活动不支持继续报名了",null);
                }else if(moment().diff(moment(activity.activity_time).add(activity.activity_timelength,"h"),"second",true) > 2){
                    done("活动已经结束了，不能继续报名了",null);
                }else{
                    done(null,activity);
                }
            });
        },
        findIfOverSignLimit:function(data,done){
            if(data.maxPeople > 0){
                ifSignOverMaxPeople(data._id,data.maxPeople,function(err){
                   done(err,null);
                });
            }else{
                done(null,data);
            }
        },
        createAndSaveSignInfo:function(data,done){
            var signInfo = new ActivitySignInfoModel({
                activityId:data._id,
                signUser:myUid,
                reviewStatus:data.isNeedReview ? 0 : 2,
            });
            signInfo.save(function(err){
                if(err){
                    var errMsg = err.name == "RuleError" ? err.message : "服务器错误，报名失败";
                    done(errMsg,null);
                }else{
                    done(null,null);
                }
            });
        }
    },function(err,results){
        return callback(err);
    });
};

//报名活动，提交报名表
exports.postSignForm = function(myUid,activityId,postData,callback)
{
    if(!myUid){
        return callback("请登录后再进行相关操作");
    }

    async.waterfall({
        findIfExitActivity:function(done){  //检查活动是否存在
            ActivityModel.findOne({_id:activityId,is_delete:false,is_valid:true},function(err,activity) {
                if(err || !activity){
                    done("未查找到该活动信息，请刷新重试",null);
                }else if(!activity.canSignAfterStart && moment().diff(moment(activity.activity_time),"second",true) > 2){
                    done("活动已经开始了，本活动不支持继续报名了",null);
                }else if(moment().diff(moment(activity.activity_time).add(activity.activity_timelength,"h"),"second",true) > 2){
                    done("活动已经结束了，不能继续报名了",null);
                }else{
                    done(null,activity);
                }
            });
        },
        findIfOverSignLimit:function(data,done){    //检查报名人数是否超限
            if(data.maxPeople > 0){
                ifSignOverMaxPeople(data._id,data.maxPeople,function(err){
                    done(err,null);
                });
            }else{
                done(null,data);
            }
        },
        checkSignFormInfo:function(data,done){  //检查报名的信息的合法性
            ActivityFormProxy.checkFormSubmit(data.signForm,data._id,postData,function(err){
                done(err,data);
            });
        },
        createAndSaveSignInfo:function(data,done){
            var postFormInfo = [];
            for(var key in postData){
                postFormInfo.push({key:key,value:postData[key]});
            }
            var signInfo = new ActivitySignInfoModel({
                activityId:data._id,
                signUser:myUid,
                reviewStatus:0,
                postFormInfo:postFormInfo,
            });
            signInfo.save(function(err){
                if(err){
                    var errMsg = err.name == "RuleError" ? err.message : "服务器错误，报名失败";
                    done(errMsg,null);
                }else{
                    done(null,null);
                }
            });
        }
    },function(err,results){
        return callback(err);
    });
};

//退出活动报名
exports.quitActivity = function(myUid,activityId,callback)
{
    if(!myUid){
        return callback("请登录后再进行相关操作");
    }

    async.waterfall({
        findIfExitActivity:function(done) {  //检查活动是否存在
            ActivityModel.findOne({_id:activityId,is_delete:false,is_valid:true},function(err,activity){
                if(err || !activity){
                    done("未查找到该活动信息，请刷新重试",null);
                }else if(moment().diff(moment(activity.activity_time),"second",true) > 2){
                    done("活动已经开始了，退出活动来不及了，下次吧",null);
                }else{
                    done(null,activity);
                }
            });
        },
        findSignInfoAndQuit:function(data,done){    //查找本人的活动报名信息
            ActivitySignInfoModel.findOne({activityId:data._id,signUser:myUid,is_quit:true},function(err,activityInfo){
                if(err || !activityInfo){
                    done("未找到您的报名信息，请稍后重试",null);
                }else{
                    activityInfo.is_quit = false;
                    activityInfo.save(function(err1){
                       if(err1){
                           done("退出活动失败！",null);
                       } else{
                           done(null,null);
                       }
                    });
                }
            });
        }
    },function(err,results){
        return callback(err);
    });
};