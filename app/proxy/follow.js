var validator      = require('validator');
var Models = require('../models');
var UserModel = Models.User,
    FollowModel = Models.Follow;
var FollowType = require('../const/followType');
var ArrayHelper = require('../helper/myArray');

var UserProxy = require('../proxy/user');
var GoodProxy = require('../proxy/good');
var StoreProxy = require('../proxy/store');
var TopicProxy = require('../proxy/topic');

//关注操作
//关注用户、收藏店铺、收藏商品、关注话题
exports.doFollow = function(myUid,followId,type,callback)
{
    if(!myUid){
        return callback('您需要登录后才能进行相关操作！',1);
    }

    var con = {};
    var followCol = 'users';
    var failureMsg = "获取用户id失败，关注失败！";
    var repeatMsg = "已经关注该用户，无需重复关注";
    var errMsg = "关注失败,请稍后重试";
    var sucMsg = "关注成功！";
    var proxy = UserProxy;
    switch (type){
        case FollowType.USER:
            con = {author:myUid,userId:followId};followCol = 'users';proxy = UserProxy;repeatMsg = "已经关注该用户，无需重复关注";failureMsg = "获取用户id失败，关注失败！";errMsg = "关注用户失败,请稍后重试";sucMsg = "关注用户成功！";break;
        case FollowType.GOOD:
            con = {author:myUid,goodId:followId};followCol = 'goods';proxy = GoodProxy;repeatMsg = "已经收藏该商品，无需重复收藏";failureMsg = "获取商品id失败，收藏失败！";errMsg = "收藏商品失败,请稍后重试";sucMsg = "关注商品成功！";break;
        case FollowType.STORE:
            con = {author:myUid,storeId:followId};followCol = 'stores';proxy = StoreProxy;repeatMsg = "已经收藏该店铺，无需重复收藏";failureMsg = "获取店铺id失败，收藏失败！";errMsg = "收藏店铺失败,请稍后重试";sucMsg = "关注店铺成功！";break;
        case FollowType.TOPIC:
            con = {author:myUid,topicId:followId};followCol = 'topics';proxy = TopicProxy;repeatMsg = "已经关注该话题，无需重复关注";failureMsg = "获取话题id失败，关注失败！";errMsg = "关注话题失败,请稍后重试";sucMsg = "关注话题成功！";break;
        default:
            con = {author:myUid,userId:followId};followCol = 'users';proxy = UserProxy;repeatMsg = "已经关注该用户，无需重复关注";failureMsg = "获取用户id失败，关注失败！";errMsg = "关注用户失败,请稍后重试";sucMsg = "关注用户成功！";break;
    }

    if(!followId){
        return callback(failureMsg,0);
    }

    UserModel.findOne({_id:myUid,confirm:true},function(err,user){
        if(err){
            return callback('服务器发生错误，请稍后重试！',0);
        }
        if(!user){
            return callback('您的账号异常，请重新登录后在进行操作！',1);
        }
        //没有则放入
        user.follow[followCol].indexOf(followId) < 0 && user.follow[followCol].push(followId);
        user.save(function(err1){
            if(err1){
                return callback(errMsg,0);
            }

            proxy.addFans(followId,myUid,function(err2){
                console.log("proxy关注操作执行。。。"+err2);
                if(err2){
                    user.follow[followCol] = ArrayHelper.removeElement(user.follow[followCol],followId);
                    user.save(function(){
                        return callback(errMsg,0);
                    });
                }else{
                    return callback(sucMsg,2);
                }
            });
        });
    });
};


//取消关注的操作
//取消关注用户、取消收藏店铺、取消收藏商品、取消关注话题
exports.doCancelFollow = function(myUid,followId,type,callback)
{
    if(!myUid){
        return callback('您需要登录后才能进行相关操作！',1);
    }

    var con = {};
    var followCol = 'users';
    var failureMsg = "获取用户id失败，取消关注失败！";
    var repeatMsg = "已经取消关注该用户，无需重复取消关注";
    var errMsg = "取消关注失败,请稍后重试";
    var sucMsg = "取消关注成功！";
    var proxy = UserProxy;
    switch (type){
        case FollowType.USER:
            con = {author:myUid,userId:followId};followCol = 'users';proxy = UserProxy;repeatMsg = "已经取消关注该用户，无需重复取消关注";failureMsg = "获取用户id失败，取消关注失败！";errMsg = "取消关注用户失败,请稍后重试";sucMsg = "取消关注用户成功！";break;
        case FollowType.GOOD:
            con = {author:myUid,goodId:followId};followCol = 'goods';proxy = GoodProxy;repeatMsg = "已经取消收藏该商品，无需重复取消收藏";failureMsg = "获取商品id失败，取消收藏失败！";errMsg = "取消收藏商品失败,请稍后重试";sucMsg = "取消关注商品成功！";break;
        case FollowType.STORE:
            con = {author:myUid,storeId:followId};followCol = 'stores';proxy = StoreProxy;repeatMsg = "已经取消收藏该店铺，无需重复取消收藏";failureMsg = "获取店铺id失败，取消收藏失败！";errMsg = "取消收藏店铺失败,请稍后重试";sucMsg = "取消关注店铺成功！";break;
        case FollowType.TOPIC:
            con = {author:myUid,topicId:followId};followCol = 'topics';proxy = TopicProxy;repeatMsg = "已经取消关注该话题，无需重复取消关注";failureMsg = "获取话题id失败，取消关注失败！";errMsg = "取消关注话题失败,请稍后重试";sucMsg = "取消关注话题成功！";break;
        default:
            con = {author:myUid,userId:followId};followCol = 'users';proxy = UserProxy;repeatMsg = "已经取消关注该用户，无需重复取消关注";failureMsg = "获取用户id失败，取消关注失败！";errMsg = "取消关注用户失败,请稍后重试";sucMsg = "取消关注用户成功！";break;
    }

    if(!followId){
        return callback(failureMsg,0);
    }

    UserModel.findOne({_id:myUid,confirm:true},function(err,user) {
        if (err) {
            return callback('服务器发生错误，请稍后重试！', 0);
        }
        if (!user) {
            return callback('您的账户异常，请重新登录后在进行操作！', 1);
        }

        //移除用户的关注或收藏的项目的id
        user.follow[followCol] = ArrayHelper.removeElement(user.follow[followCol],followId);
        user.save(function(err1){
            if(err1){
                return callback(errMsg,0);
            }

            proxy.removeFans(followId,myUid,function(err2){
                if(err2){
                    //没有则放入
                    user.follow[followCol].indexOf(followId) < 0 && user.follow[followCol].push(followId);
                    user.save(function(){
                        return callback(errMsg,0);
                    });
                }else{
                    return callback(sucMsg,2);
                }
            });
        });

    });
};