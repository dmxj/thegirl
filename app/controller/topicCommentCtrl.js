var TopicModel = require('../models/topic');
var TopicCommentModel = require('../models/topicComment');
var TopicCommentProxy = require('../proxy/topicComment');
var checkService = require('../services/check');

//分页获取某话题的评论列表
exports.get = function(req, res, next){
    var topicId = req.body.tid;

    if(!topicId){
        return res.json({code:0,comments:null,msg:"未获取到话题信息，请刷新重试"});
    }

    var sortby = req.body.sort;
    var page = req.params.page;

    sortby = sortby?sortby.trim().toLowerCase():"";
    page = page?Math.floor(parseInt(page.trim().toLowerCase())):1;

    var option = {order:{create_at:-1}};    //从新到旧

    var query = {topic:topicId,replyTo:null};
    var params = {};
    var uid = req.app.locals.uid;
    TopicCommentProxy.divderPageGetTopicComments(uid,page,30,query,option.order,function($query){
        params['comments'] = $query ? $query.results : null;
        params['pageCount'] = $query ? $query.pageCount : 0;
        return res.json({code:1,comments:params['comments'],count:$query.totalCount});
    });
}


//发表评论或回复
exports.publish = function(req, res, next) {
    var topicId = req.body.tid;
    var replyTo = req.body.to;
    var content = req.body.content;

    if(!topicId){
        return res.json({code:0,msg:'获取话题信息失败'});
    }

    if(!content){
        return res.json({code:0,msg:'评论内容不能为空'});
    }

    checkService.checkIsLogin(req,function(user){
        if(!user){
            return res.json({code:1,msg:'请先登录再操作'});
        }

        TopicCommentProxy.pulishTopicComment(user.id,topicId,replyTo,content,function(errMsg){
            if(errMsg){
                return res.json({msg:errMsg,code:0});
            }
            var actionType = replyTo ? "回复" : "评论";
            return res.json({msg:actionType + "成功",code:2});
        });
    });
}


//点赞评论或回复
exports.likeTopicComment = function(req, res, next) {
    var topicCommentId = req.body.cid;
    checkService.checkIsLogin(req,function(user){
        if(!user){
            return res.json({code:1,msg:'请先登录再操作'});
        }

        if(!topicCommentId){
            return res.json({code:0,msg:'获取话题信息失败'});
        }

        TopicCommentProxy.likeTopicComment(topicCommentId,user.id,function(msg,likecount){
            if(likecount == null){
                return res.json({code:0,msg:msg});
            }

            return res.json({code:2,msg:msg,likecount:likecount});
        });

    });
}