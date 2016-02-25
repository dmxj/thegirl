var EventProxy = require('eventproxy');
var TopicModel = require('../models/topic');
var ArrayHelper = require('../helper/myArray');

//分页获取话题
exports.divderPageGetTopics = function(index,perpage,query,option,callback)
{
    var _query = query || {};
    _query.is_delete = false;
    _query.is_valid = true;
    var _option = option || {};
    _option.sort = {view_count:-1};
    TopicModel.find(_query,'',_option)
        .skip((index-1)*perpage)
        .limit(perpage)
        .populate('author comments')
        .exec(callback);
};

//获取热门话题
exports.getHotTopic = function(num,callback)
{
    var opt = {limit:num};
    TopicModel.myFind({is_delete:false,is_valid:true},opt,callback);
};

//根据id获取话题
exports.getStoreById = function(id,callback)
{
    TopicModel.myFindOne({_id:id},{},callback);
};

//话题关注者添加
exports.addFans = function(tid,fanUid,callback)
{
    TopicModel.findOne({_id:tid,is_delete:true,is_valid:true},function(err,topic){
        if(err || !topic){
            return callback('no find topic');
        }

        topic.fans.indexOf(fanUid) < 0 && topic.fans.push(fanUid);
        topic.save(function(err2){
            if(err2){
                return callback(err2);
            }
            return callback(null);
        });
    });
};

//话题关注者移除
exports.removeFans = function(tid,fanUid,callback)
{
    TopicModel.findOne({_id:tid,is_delete:true,is_valid:true},function(err,topic){
        if(err || !topic){
            return callback('no find topic');
        }

        topic.fans = ArrayHelper.removeElement(topic.fans,fanUid);
        topic.save(function(err2){
            if(err2){
                return callback(err2);
            }

            return callback(null);
        });
    });
};