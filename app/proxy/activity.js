var ActivityModel = require('../models/activity');
var ActivityFormModel = require('../models/activityForm');
var ActivityFormProxy = require('../proxy/activityForm');
var ArrayHelper = require('../helper/myArray');

//分页获取活动
exports.divderPageGetActivities = function(index,perpage,query,option,callback)
{
    var _query = query || {};
    _query.is_delete = false;
    _query.is_valid = true;
    var _option = option || {};
    ActivityModel.find(_query,'',_option)
        .skip((index-1)*perpage)
        .limit(perpage)
        .populate('goodId signInfos')
        .exec(callback);
};

//获取热门活动
exports.getHotActivity = function(num,callback)
{
    var opt = {limit:num};
    ActivityModel.find({is_delete:false,is_valid:true},'',opt,callback);
};

//根据id获取活动
exports.getActivityById = function(id,callback)
{
    ActivityModel.findById(id,callback);
};

//活动报名，不需要填表
exports.signNoForm = function(myUid,activityId,callback)
{
    if(!myUid){
       return callback("请登录后再进行相关操作");
    }

    ActivityModel.findOne({_id:activityId},function(err,activity){
        if(err || !activity || activity.signForm){
            return callback("未查找到该活动信息，请刷新重试");
        }

        if(activity.maxPeople > 0 && activity.signInfos.length >= activity.maxPeople)
        {
            return callback("该活动已经超过最大报名人数限制，不可以再进行报名!");
        }

        activity.signInfos.push({
            signUser:myUid,
            isReviewSucess:!activity.isNeedReview,
            reviewStatus:activity.isNeedReview ? 0 : 2,
        });
        activity.save(function(err1){
            if(err1){
                return callback("发生错误，报名失败！");
            }

            return callback(null);
        });
    });
};

//报名活动，提交报名表
exports.postSignForm = function(myUid,activityId,postData,callback)
{
    if(!myUid){
        return callback("请登录后再进行相关操作");
    }

    ActivityModel.findOne({_id:activityId},function(err,activity) {
        if (err || !activity || !activity.signForm) {
           return callback("未查找到该活动信息，请刷新重试");
        }

        ActivityFormModel.findOne({_id:activity.signForm},function(err1,activityForm){
            if(err1 || !activityForm){
                return callback("未查找到该活动表单信息，报名失败");
            }

            ActivityFormProxy.checkFormSubmit(activityForm._id,postData,function(err2){
                if(err2){
                    return callback(err2);
                }
                var postFormInfo = [];
                for(var key in postData){
                    postFormInfo.push({key:key,value:postData[key]});
                }

                activity.signInfos.push({
                    signUser:myUid,
                    isReviewSucess:!activity.isNeedReview,
                    reviewStatus:activity.isNeedReview ? 0 : 2,
                    postFormInfo:postFormInfo
                });

                activity.save(function(err3){
                    if(err3){
                        return callback("服务器错误，报名失败！");
                    }

                    return callback(null);
                });
            });

        });
    });
};