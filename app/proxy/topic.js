var EventProxy = require('eventproxy');
var TopicModel = require('../models/topic');
var ArrayHelper = require('../helper/myArray');

//分页获取话题
exports.divderPageGetTopics = function(page,perpage,query,sort,callback)
{
    var _query = query || {};
    _query.is_delete = false;
    _query.is_valid = true;
    var _sort = sort || {};

    TopicModel.pageQuery(page, perpage,"author", _query, _sort,function(err,$page){
        return callback($page);
    });
};

//获取热门话题
exports.getHotTopic = function(num,callback)
{
    var opt = {limit:num};
    TopicModel.myFind({is_delete:false,is_valid:true},opt,callback);
};

//根据id获取话题
exports.getTopicById = function(id,callback)
{
    TopicModel.findOne({_id:id})
        .deepPopulate("author author.school")
        .exec(callback);
};

//话题关注者添加
exports.addFans = function(tid,fanUid,callback)
{
    TopicModel.findOne({_id:tid,is_delete:false,is_valid:true},function(err,topic){
        if(err || !topic){
            return callback('未发现该话题信息，请刷新后重试');
        }

        topic.fans.indexOf(fanUid) < 0 && topic.fans.unshift(fanUid);
        topic.save(function(err2){
            if(err2){
                var errMsg = err2.name == "RuleError" ? err2.message : "服务器错误";
                return callback(errMsg);
            }
            return callback(null);
        });
    });
};

//话题关注者移除
exports.removeFans = function(tid,fanUid,callback)
{
    TopicModel.findOne({_id:tid,is_delete:false,is_valid:true},function(err,topic){
        if(err || !topic){
            return callback('未发现该话题信息，请刷新后重试');
        }


        topic.fans = ArrayHelper.removeElement(topic.fans,fanUid);
        topic.save(function(err2){
            if(err2){
                var errMsg = err2.name == "RuleError" ? err2.message : "服务器错误";
                return callback(errMsg);
            }

            return callback(null);
        });
    });
};





/**
//收藏话题，或取消收藏话题
exports.collectTopic = function(tid,uid,callback)
{
    TopicModel.findOne({_id:tid,is_delete:true,is_valid:true},function(err,topic) {
        if (err || !topic) {
            return callback('no find topic',null);
        }

        var successTip = "操作成功";
        if(topic.fans.indexOf(uid) < 0){
            topic.fans.unshift(uid);
            successTip = "收藏成功";
        }else{
            topic.fans = ArrayHelper.removeElement(topic.fans,uid);
            successTip = "取消收藏成功";
        }

        topic.save(function(err2){
            if(err2){
                var errMsg = err2.name == "RuleError" ? err2.message : "服务器错误";
                return callback(errMsg,null);
            }

            return callback(successTip,topic.fans.length);
        });

    });
}

//喜欢某话题，或取消喜欢某话题
exports.likeTopic = function(tid,uid,callback)
{
    TopicModel.findOne({_id:tid,is_delete:true,is_valid:true},function(err,topic) {
        if (err || !topic) {
            return callback('no find topic',null);
        }

        var successTip = "操作成功";
        if(topic.likeUser.indexOf(uid) < 0){
            topic.likeUser.unshift(uid);
            successTip = "点赞成功";
        }else{
            topic.likeUser = ArrayHelper.removeElement(topic.likeUser,uid);
            successTip = "取消点赞成功";
        }

        topic.save(function(err2){
            if(err2){
                var errMsg = err2.name == "RuleError" ? err2.message : "服务器错误";
                return callback(errMsg,null);
            }

            return callback(successTip,topic.likeUser.length);
        });

    });
}**/
