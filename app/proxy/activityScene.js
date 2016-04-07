var ActivitySceneModel = require('../models/activityScene');
var ActivityModel = require('../models/activity');
var ArrayHelper = require('../helper/myArray');
var util = require('util');
var async = require('async');
var moment = require('moment');
moment.locale('zh-cn'); // 使用中文

//上传活动图片
exports.uploadActivityPicture = function(myUid,activityId,description,pictureArr,callback)
{
    if(myUid == null){
        return callback("请登录后再操作");
    }

    if(pictureArr == null || !util.isArray(pictureArr) || pictureArr.length <= 0)
    {
        return callback("参数错误，请重新操作");
    }

    async.waterfall([
        function(done) { //查看活动是否存在
            ActivityModel.findOne({_id: activityId, is_delete: false, is_valid: true}, function (err, activity) {
                if (err || !activity) {
                    return done("未获取到活动信息，请刷新重试", null);
                } else {
                    return done(null, activity);
                }
            });
        },
        function(activity,done){    //查看上传活动图片的权限
            if(activity.author.toString() != myUid.toString()){
                ActivitySignInfoModel.findOne({activityId:activity._id,signUser:myUid,reviewStatus:2},function(err,info){
                    if(err || !info){
                        return done("您未报名成功，没有上传活动图片的权限",null);
                    }else if(!activity.canOtherUpdateScene){
                        return done("该活动只能活动发布者上传活动图片",null);
                    }else{
                        return done(null,activity._id);
                    }
                });
            }else if(moment(activity.activity_timestart).diff(moment(),"second",true) > 0){
                return done("活动尚未开始，不能上传活动图片",null);
            }else{
                return done(null,activity._id);
            }
        },
        function(activity_id,done){ //添加活动图片
            var scene = new ActivitySceneModel({
                activity:activity_id,
                user:myUid,
                description:description,
                pictures:ArrayHelper.filterNull(pictureArr)
            });
            scene.save(function(err){
                if(err){
                    var errMsg = err.name == "RuleError" ? err.message : "发生错误，上传失败";
                    done(errMsg,null);
                }else{
                    done(null,null);
                }
            });
        }
    ],function(err,results){
        return callback(err);
    });
};