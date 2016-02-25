var Models = require('../models');
var UserModel = Models.User,
    GoodModel = Models.Good,
    StoreModel = Models.Store,
    TopicModel = Models.Topic,
    FollowModel = Models.Follow;

var UserProxy = require('../proxy/user');
var GoodProxy = require('../proxy/good');
var StoreProxy = require('../proxy/store');
var TopicProxy = require('../proxy/topic');
var FollowProxy = require('../proxy/follow');

var FollowType = require('../const/followType');
var checkService = require('../services/check');


//关注某用户==Ajax
exports.followSomebody = function(req, res, next){
    FollowProxy.doFollow(req.app.locals.uid,req.body.uid,FollowType.USER,function(msg,code){
        return res.json({msg:msg,code:code});
    });
};
//取消关注某用户===Ajax
exports.cancelFollowSomebody = function(req, res, next){
    FollowProxy.doCancelFollow(req.app.locals.uid,req.body.uid,FollowType.USER,function(msg,code){
        return res.json({msg:msg,code:code});
    });
};

//收藏某商品===Ajax
exports.collectGood = function(req, res, next){
    FollowProxy.doFollow(req.app.locals.uid,req.body.gid,FollowType.GOOD,function(msg,code){
        return res.json({msg:msg,code:code});
    });
};
//取消收藏某商品===Ajax
exports.cancelCollectGood = function(req, res, next){
    FollowProxy.doCancelFollow(req.app.locals.uid,req.body.gid,FollowType.GOOD,function(msg,code){
        return res.json({msg:msg,code:code});
    });
};

//收藏某店铺===Ajax
exports.collectStore = function(req, res, next){
    FollowProxy.doFollow(req.app.locals.uid,req.body.sid,FollowType.STORE,function(msg,code){
        return res.json({msg:msg,code:code});
    });
};
//取消收藏某店铺===Ajax
exports.cancelCollectStore = function(req, res, next){
    FollowProxy.doCancelFollow(req.app.locals.uid,req.body.sid,FollowType.STORE,function(msg,code){
        return res.json({msg:msg,code:code});
    });
};

//关注某话题==Ajax
exports.followTopic = function(req, res, next){
    FollowProxy.doFollow(req.app.locals.uid,req.body.tid,FollowType.TOPIC,function(msg,code){
        return res.json({msg:msg,code:code});
    });
};
//取消关注某话题===Ajax
exports.cancelFollowTopic = function(req, res, next){
    FollowProxy.doCancelFollow(req.app.locals.uid,req.body.tid,FollowType.TOPIC,function(msg,code){
        return res.json({msg:msg,code:code});
    });
};
