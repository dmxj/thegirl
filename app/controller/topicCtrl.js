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

        TopicProxy.divderPageGetTopics(page,30,query,option,function(err,topics){
            if(err || !topics) {
                params['topics'] = null;
            }else{
                params['topics'] = topics;
            }
            return res.render200("topic/index",params);
        });
    });
};

//显示话题详情页
exports.showTopic = function(req, res, next){
    var topicid = req.params.topicid;
    topicid = topicid ? topicid.trim().toLowerCase() : null;

    if(topicid){    //
        TopicProxy.getStoreById(topicid,function(err,topic){
            if(err || !topic){
                return res.redirect("/topic");
            }
            if(topic.is_delete){
                return res.render200("topic/deleted",{msg:"该话题已被作者移除"});
            }
            if(!topic.is_valid){
                return res.render200("topic/invalid",{msg:"该话题因违反有关规定，不予以显示"});
            }
            return res.render200("topic/home",{topic:topic});
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
