var TopicModel = require('../models/topic');
var TopicProxy = require('../proxy/topic');
var checkService = require('../services/check');

//话题模块的主页
//如果用户已经登录，显示用户所属学校的所有的话题，
//如果用户没登录，显示全国所有的话题
exports.index = function(req, res, next){
    var keyword = req.query.q;
    var sortby = req.query.sortby;
    var page = req.query.page;
    keyword = keyword?keyword.trim().toLowerCase():null;
    sortby = sortby?sortby.trim().toLowerCase():"";
    page = page?Math.floor(parseInt(page.trim().toLowerCase())):1;
    var query = {};
    var option = {order:{hotlevel:-1}};
    if(keyword){
        query['$or'] = [
            {'title':new RegExp(keyword)},
            {'content':new RegExp(keyword)},
        ];
    }

    if(sortby == "new"){  //根据创建日期排序，新的在前
        option.order = {create_at:-1};
    }else if(sortby == "visit"){  //根据浏览次数进行排序
        option.order = {view_count:-1};
    }else{  //hot,默认按照热度排序
        option.order = {hotlevel:-1};
    }

    var params = {keyword:keyword};
    checkService.checkIsLogin(req,function(user){
        if(user){   //登录了
            query["author.school"] = user.school;
            params['master'] = user;
        }else{
            params['master'] = null;
        }

        TopicProxy.divderPageGetTopics(page,10,query,option.order,function($query){
            params['topics'] = $query ? $query.results : null;
            params['pageCount'] = $query ? $query.pageCount : 0;
            return res.render200("topic/index",params);
        });
    });
};

//显示话题详情页
exports.showTopic = function(req, res, next){
    var topicid = req.params.topicid;
    topicid = topicid ? topicid.trim().toLowerCase() : null;

    if(topicid){    //
        TopicProxy.getTopicById(topicid,function(err,topic){
            if(err || !topic){
                return res.render404("不存在该话题");
            }
            if(topic.is_delete){
                return res.renderDelete("该话题已被作者移除");
            }
            if(!topic.is_valid){
                return res.renderInvalid("该话题因违反有关规定，不予以显示");
            }

            checkService.checkIsLogin(req,function(user){
                var islike = user != null && topic.fans.indexOf(user.id) >= 0;
                return res.render200("topic/home",{topic:topic,master:user,islike:islike});
            })
        });
    }else{  //直接跳转到店铺模块主页
        return res.redirect("/topic");
    }
};

//发表话题
exports.postTopic = function(req, res, next){

};

//移除话题
exports.removeTopic = function(req, res, next){

};






/**
//收藏话题
exports.collectTopic = function(req,res,next){
    var topicId = req.body.tid;
    checkService.checkIsLogin(req,function(user) {
        if (!user) {
            return res.json({code: 1, msg: '请先登录再操作'});
        }

        if (!topicId) {
            return res.json({code: 0, msg: '获取话题信息失败'});
        }

        TopicProxy.likeTopic(topicId,user.id,function(msg,fanscount){
            if(fanscount == null){
                return res.json({code:0,msg:msg});
            }

            return res.json({code:2,msg:msg,fanscount:fanscount});
        });
    });
}

//喜欢话题
exports.likeTopic = function(req,res,next){
    var topicId = req.body.tid;
    checkService.checkIsLogin(req,function(user){
        if(!user){
            return res.json({code:1,msg:'请先登录再操作'});
        }

        if(!topicId){
            return res.json({code:0,msg:'获取话题信息失败'});
        }

        TopicProxy.likeTopic(topicId,user.id,function(msg,likecount){
            if(likecount == null){
                return res.json({code:0,msg:msg});
            }

            return res.json({code:2,msg:msg,likecount:likecount});
        });

    });
}**/
