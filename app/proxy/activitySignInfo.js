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

//是否已经报过名了
function ifAlreadySigned(activityId,myUid,callback){
    ActivitySignInfoModel.findOne({activityId:activityId,signUser:myUid},function(err,info){
        if(err || !info){
            return callback(null,null);
        }else{
            return callback("已经报过名了，就不要再重复报名了啦",info);
        }
    });
}

//是否是活动发起者
function isTheMasterOfActivity(activityId,myUid,callback){
    ActivityModel.findOne({_id:activityId,author:myUid,is_delete:false,is_valid:true},function(err,activity){
       return callback(activity);
    });
}

//活动报名，不需要填表
exports.signNoForm = function(myUid,activityId,callback)
{
    if(!myUid){
        return callback("请登录后再进行相关操作");
    }
    async.waterfall([
        function(done){ //findIfExitActivity:检查活动是否存在
            ActivityModel.findOne({_id:activityId,is_delete:false,is_valid:true},function(err,activity) {
                if(err || !activity){
                    done("未查找到该活动信息，请刷新重试",null);
                }else if(!activity.canSignAfterStart && moment().diff(moment(activity.activity_timestart),"second",true) > 2){
                    done("活动已经开始了，本活动不支持继续报名了",null);
                }else if(moment().diff(moment(activity.activity_timeend),"second",true) > 2){
                    done("活动已经结束了，不能继续报名了",null);
                }else{
                    done(null,activity);
                }
            });
        },
        function(data,done){    //findIfOverSignLimit:检查是否报名超限
            if(data.maxPeople > 0){
                ifSignOverMaxPeople(data._id,data.maxPeople,function(err){
                   done(err,data);
                });
            }else{
                done(null,data);
            }
        },
        function(data,done){    //findIfAlreadySigned:检查是否已经报名
            ifAlreadySigned(data._id,myUid,function(repeatSignedInfo,signInfo){
                done(repeatSignedInfo,data);
            });
        },
        function(data,done){    //createAndSaveSignInfo:创建报名记录
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
                    done(null,signInfo);
                }
            });
        }
    ],function(err,results){
        console.log("报名活动失败：");
        console.log(err);
        return callback(err,results);
    });
};

//报名活动，提交报名表
exports.postSignForm = function(myUid,activityId,postData,callback)
{
    if(!myUid){
        return callback("请登录后再进行相关操作");
    }

    async.waterfall([
        function(done){  //findIfExitActivity:检查活动是否存在
            ActivityModel.findOne({_id:activityId,is_delete:false,is_valid:true},function(err,activity) {
                if(err || !activity){
                    done("未查找到该活动信息，请刷新重试",null);
                }else if(!activity.canSignAfterStart && moment().diff(moment(activity.activity_timestart),"second",true) > 2){
                    done("活动已经开始了，本活动不支持继续报名了",null);
                }else if(moment().diff(moment(activity.activity_timeend),"second",true) > 2){
                    done("活动已经结束了，不能继续报名了",null);
                }else{
                    done(null,activity);
                }
            });
        },
        function(data,done){    //findIfOverSignLimit:检查报名人数是否超限
            if(data.maxPeople > 0){
                ifSignOverMaxPeople(data._id,data.maxPeople,function(err){
                    done(err,data);
                });
            }else{
                done(null,data);
            }
        },
        function(data,done){   //findIfAlreadySigned:检查是否已经报名
            ifAlreadySigned(data._id,myUid,function(repeatSignedInfo,signInfo){
                done(repeatSignedInfo,data);
            });
        },
        function(data,done){  //checkSignFormInfo:检查报名的信息的合法性
            ActivityFormProxy.checkFormSubmit(data.signForm,data._id,postData,function(err){
                done(err,data);
            });
        },
        function(data,done){    //createAndSaveSignInfo:创建报名记录
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
                    done(null,signInfo);
                }
            });
        }
    ],function(err,results){
        return callback(err,results);
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
                }else if(moment().diff(moment(activity.activity_timestart),"second",true) > 2){
                    done("活动已经开始了，退出活动来不及了，下次吧",null);
                }else{
                    done(null,activity);
                }
            });
        },
        findSignInfoAndQuit:function(data,done){    //查找本人的活动报名信息
            ActivitySignInfoModel.findOne({activityId:data._id,signUser:myUid,is_quit:false},function(err,activityInfo){
                if(err || !activityInfo){
                    done("未找到您的报名信息，请稍后重试",null);
                }else{
                    activityInfo.is_quit = true;
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


//活动发起者审核活动请求
exports.reviewSign = function(signInfoId,myUid,isPass,callback){
    if(!myUid){
        return callback("请登录后再进行操作！");
    }

    async.waterfall([
        function(done){ //判断是否是活动的创办者,以及审核操作权限
            ActivitySignInfoModel.findOne({_id:signInfoId})
                .deepPopulate('activityId')
                .exec(function(err,signInfo){
                   if(err || !signInfo){
                       done("未找到该报名信息，请检查重试",null);
                   }else if(signInfo.activityId.author.toString() != myUid.toString()){
                       done("您无权对本活动进行相关操作");
                   }else if(signInfo.is_quit){
                       done("该用户已放弃报名活动，审核操作失败",null);
                   }else if(signInfo.reviewStatus != 0){
                       done("已经对该用户做过审核操作，不能再继续操作",null);
                   }else{
                       done(null,signInfo);
                   }
                });
        },
        function(signInfo,done){    //审核操作
            var reviewStatus = isPass ? 2 : 0;
            signInfo.reviewStatus == reviewStatus;
            signInfo.save(function(err){
                if(err){
                    done("服务器错误，审核操作失败，请稍后重试",null);
                }else{
                    done(null,null);
                }
            });
        }
    ],function(err,results){
        return callback(err);
    });
};