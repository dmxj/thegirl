var ActivityModel = require('../models/activity');
var ActivityFormModel = require('../models/activityForm');
var ActivityFormProxy = require('../proxy/activityForm');
var ArrayHelper = require('../helper/myArray');

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
    //ActivityModel.find(_query,'',_option)
    //    .skip((index-1)*perpage)
    //    .limit(perpage)
    //    .populate('goodId signInfos')
    //    .exec(callback);
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
    ActivityModel.findById(id,function(err,activity){
        if(err || !activity){
            return callback(null);
        }
        if(!activity.is_delete && activity.is_valid) {
            activity.getSingInfoStat(function (stat) {
                activity.stat = stat;
                return callback(activity);
            });
        }
    });
};

