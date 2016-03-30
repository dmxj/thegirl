var TopicModel = require('../models/topic');
var TopicCommentModel = require('../models/topicComment');
var ArrayHelper = require('../helper/myArray');
var async = require('async');

exports.divderPageGetTopicComments = function(uid,page,perpage,query,sort,callback)
{
    var _query = query || {};
    _query.is_deleted = false;
    var _sort = sort || {};

    TopicCommentModel.pageQuery(page, perpage,"author author.school replyList replyList replyList.author replyTo replyTo.author", _query, _sort,function(err,$page){
        if($page.results != null && $page.results.length > 0) {
            $page.results = $page.results.map(function (comment) {
                return comment.change(uid);
            });
        }
        return callback($page);
    });
}


//发表评论或回复
exports.pulishTopicComment = function(userid,tid,replyId,content,callback)
{
    if(!userid){
        return callback('请登录后重试');
    }

    var topicCommentInstance = new TopicCommentModel({
        topic:tid,
        author:userid,
        content:content,
        replyTo:replyId,
        replyList:[],
    });

    async.waterfall([
        function(done){
            TopicModel.findOne({_id:tid,is_delete:false,is_valid:true},function(err,topic) {
                if (err || !topic) {
                    return done('未找到该话题信息，请刷新重试', null);
                }
                done(null,null);
            });
        },
        function(data,done){
            if(replyId != null) {
                TopicCommentModel.findOne({_id: replyId, is_deleted: false}, function (err1, topicComment) {
                    if (err1 || !topicComment) {
                        return done('未找到对应的评论信息，请刷新重试', null);
                    }
                    topicCommentInstance.underList = topicComment.underList;
                    topicCommentInstance.underList.push(replyId);
                    done(null,null);
                });
            }else{
                done(null,null);
            }
        },
        function(data,done){
            topicCommentInstance.save(function(err){
                if(err){
                    var errMsg = err.name == "RuleError" ? err.message : "服务器错误";
                    return done(errMsg,null);
                }
                done(null,null);
            });
        }
    ],function(err,results){
        return callback(err);
    });
}

//喜欢某话题的评论回复，或取消喜欢某话题的评论回复
exports.likeTopicComment = function(tcid,uid,callback)
{
    TopicCommentModel.findOne({_id:tcid,is_deleted:false},function(err,topicComment) {
        if (err || !topicComment) {
            return callback('未找到该评论的信息',null);
        }

        var successTip = "操作成功";
        if(topicComment.likeUser.indexOf(uid) < 0){
            topicComment.likeUser.unshift(uid);
            successTip = "点赞成功";
        }else{
            topicComment.likeUser = ArrayHelper.removeElement(topicComment.likeUser,uid);
            successTip = "取消点赞成功";
        }

        topicComment.save(function(err2){
            if(err2){
                var errMsg = err2.name == "RuleError" ? err2.message : "服务器错误";
                return callback(errMsg,null);
            }

            return callback(successTip,topicComment.likeUser.length);
        });

    });
}