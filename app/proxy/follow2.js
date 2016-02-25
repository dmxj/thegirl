var EventProxy = require('eventproxy');
var Models = require('../models');
var UserModel = Models.User,
    FollowModel = Models.Follow;
var FollowType = require('../const/followType');

var UserProxy = require('../proxy/user');
var GoodProxy = require('../proxy/good');
var StoreProxy = require('../proxy/store');
var TopicProxy = require('../proxy/topic');


/**
 * 根据ID和查询条件获取关注者或收藏者
 * @param id 用户ID或商品ID或店铺ID或主题ID
 * @param opt 查询条件
 * @param type 类型：用户的粉丝、商品的收藏者、店铺的收藏者、主题的关注者
 * @param callback  回调函数
 */
exports.getFollowersById = function (id,opt,type,callback) {
    var con = {};
    var obj = 'author userId';
    switch (type){
        case FollowType.USER:
            con = {userId:id};obj = 'author userId';break;
        case FollowType.GOOD:
            con = {goodId:id};obj = 'author goodId';break;
        case FollowType.STORE:
            con = {storeId:id};obj = 'author storeId';break;
        case FollowType.TOPIC:
            con = {topicId:id};obj = 'author topicId';break;
        default:
            con = {userId:id};obj = 'author userId';break;
    }

    FollowModel.find(con,'',opt).populate('author').exec(function(err,followers){
        if(err) return callback(err,null);
        if(!data || data.length <= 0) return callback(null,null);
        return callback(null,followers);
    });
};

/**
 * 根据用户的ID获取关注的人、收藏的商品、店铺、关注的主题
 * @param userid 用户ID
 * @param opt 查询条件
 * @param type  类型
 * @param callback  回调函数
 */
exports.getStarsById = function (userid,opt,type,callback) {
    var con = {};
    var obj = 'author userId';
    switch (type){
        case FollowType.USER:
            con = {author:userid,userId:{$ne:null}};obj = 'author userId';break;
        case FollowType.GOOD:
            con = {author:userid,goodId:{$ne:null}};obj = 'author goodId';break;
        case FollowType.STORE:
            con = {author:userid,storeId:{$ne:null}};obj = 'author storeId';break;
        case FollowType.TOPIC:
            con = {author:userid,topicId:{$ne:null}};obj = 'author topicId';break;
        default:
            con = {author:userid,userId:{$ne:null}};obj = 'author userId';break;
    }

    FollowModel.find(con,'',opt).populate(obj).exec(function(err,stars){
        if(err) return callback(err,null);
        if(!data || data.length <= 0) return callback(null,null);
        return callback(null,stars);
    });
};

//===========================华丽分割线（关注操作）=====================
//关注操作
//关注用户、收藏店铺、收藏商品、关注话题
exports.doFollow = function(myUid,followId,type,callback){
    if(!myUid){
        return callback('need login',1);
    }

    var con = {};
    var obj = 'author userId';
    var followCol = 'userId';
    var failureMsg = "获取用户id失败，关注失败！";
    var repeatMsg = "已经关注该用户，无需重复关注";
    var errMsg = "关注失败,请稍后重试";
    var sucMsg = "关注成功！";
    var proxy = UserProxy;
    switch (type){
        case FollowType.USER:
            con = {author:myUid,userId:followId};proxy = UserProxy;followCol = 'userId';repeatMsg = "已经关注该用户，无需重复关注";failureMsg = "获取用户id失败，关注失败！";errMsg = "关注用户失败,请稍后重试";sucMsg = "关注用户成功！";obj = 'author userId';break;
        case FollowType.GOOD:
            con = {author:myUid,goodId:followId};proxy = GoodProxy;followCol = 'goodId';repeatMsg = "已经收藏该商品，无需重复收藏";failureMsg = "获取商品id失败，收藏失败！";errMsg = "收藏商品失败,请稍后重试";sucMsg = "关注商品成功！";obj = 'author goodId';break;
        case FollowType.STORE:
            con = {author:myUid,storeId:followId};proxy = StoreProxy;followCol = 'storeId';repeatMsg = "已经收藏该店铺，无需重复收藏";failureMsg = "获取店铺id失败，收藏失败！";errMsg = "收藏店铺失败,请稍后重试";sucMsg = "关注店铺成功！";obj = 'author storeId';break;
        case FollowType.TOPIC:
            con = {author:myUid,topicId:followId};proxy = TopicProxy;followCol = 'topicId';repeatMsg = "已经关注该话题，无需重复关注";failureMsg = "获取话题id失败，关注失败！";errMsg = "关注话题失败,请稍后重试";sucMsg = "关注话题成功！";obj = 'author topicId';break;
        default:
            con = {author:myUid,userId:followId};proxy = UserProxy;followCol = 'userId';repeatMsg = "已经关注该用户，无需重复关注";failureMsg = "获取用户id失败，关注失败！";errMsg = "关注用户失败,请稍后重试";sucMsg = "关注用户成功！";obj = 'author userId';break;
    }

    if(!followId){
        return callback(failureMsg,0);
    }

    FollowModel.findOne(con).populate(obj).exec(function(err,follow){
        if(err){
            return callback(errMsg,0);
        }

        if(!follow){
            var followInstance = new FollowModel();
            followInstance.author = myUid;
            followInstance[followCol] = followId;
            followInstance.save(function(err2){
                if(err2){
                    return callback(errMsg,0);
                }
                proxy.addFollower(followId,myUid,function(err3){
                    if(err3){
                        followInstance.remove(function(){
                            return callback(errMsg,0);
                        });
                    }
                    return callback(sucMsg,2);
                });
            });
        }else if(follow.in_follow){ //已经follow，提示无需重复follow
            return callback(repeatMsg,0);
        }else{  //曾经取消关注，现在重新关注
            follow.in_follow = true;
            follow.create_at = Date.now();
            follow.save(function(err4){
                if(err4){
                    return callback(errMsg,0);
                }
                proxy.addFollower(followId,myUid,function(err5){
                    if(err5){
                        follow.remove(function(){
                            return callback(errMsg,0);
                        });
                    }
                    return callback(sucMsg,2);
                });
            });
        }
    });
};



//取消关注的操作
//取消关注用户、取消收藏店铺、取消收藏商品、取消关注话题
exports.doCancelFollow = function(myUid,followId,type,callback)
{
    if(!myUid){
        return callback('need login',1);
    }

    var con = {};
    var obj = 'author userId';
    var followCol = 'userId';
    var failureMsg = "获取用户id失败， 取消关注失败！";
    var repeatMsg = "未关注该用户，无需取消关注";
    var errMsg = "取消关注失败,请稍后重试";
    var sucMsg = "取消关注成功！";
    var proxy = UserProxy;
    switch (type){
        case FollowType.USER:
            con = {author:myUid,userId:followId};proxy = UserProxy;followCol = 'userId';repeatMsg = "未关注该用户，无需取消关注";failureMsg = "获取用户id失败，取消关注失败！";errMsg = "取消关注用户失败,请稍后重试";sucMsg = "取消关注用户成功！";obj = 'author userId';break;
        case FollowType.GOOD:
            con = {author:myUid,goodId:followId};proxy = GoodProxy;followCol = 'goodId';repeatMsg = "未收藏该商品，无需取消收藏";failureMsg = "获取商品id失败，取消收藏失败！";errMsg = "取消收藏商品失败,请稍后重试";sucMsg = "取消关注商品成功！";obj = 'author goodId';break;
        case FollowType.STORE:
            con = {author:myUid,storeId:followId};proxy = StoreProxy;followCol = 'storeId';repeatMsg = "未收藏该店铺，无需取消收藏";failureMsg = "获取店铺id失败，取消收藏失败！";errMsg = "取消收藏店铺失败,请稍后重试";sucMsg = "取消关注店铺成功！";obj = 'author storeId';break;
        case FollowType.TOPIC:
            con = {author:myUid,topicId:followId};proxy = TopicProxy;followCol = 'topicId';repeatMsg = "未关注该话题，无需取消关注";failureMsg = "获取话题id失败，取消关注失败！";errMsg = "取消关注话题失败,请稍后重试";sucMsg = "取消关注话题成功！";obj = 'author topicId';break;
        default:
            con = {author:userid,userId:followId};proxy = UserProxy;followCol = 'userId';repeatMsg = "未关注该用户，无需取消关注";failureMsg = "获取用户id失败，取消关注失败！";errMsg = "取消关注用户失败,请稍后重试";sucMsg = "取消关注用户成功！";obj = 'author userId';break;
    }

    if(!followId){
        return callback(failureMsg,0);
    }

    FollowModel.findOne(con).populate(obj).exec(function(err,follow){
        if(err){
            return callback(errMsg,0);
        }

        if(!follow || !follow.in_follow){    //没有收藏记录
            return callback(repeatMsg,0);
        }else{  //曾经关注，现在取消关注
            follow.in_follow = false;
            follow.create_at = Date.now();
            follow.save(function(err1){
                if(err1){
                    return callback(errMsg,0);
                }
                proxy.removeFollower(followId,myUid,function(err2){
                    if(err2){
                        follow.remove(function(){
                            return callback(errMsg,0);
                        });
                    }
                    return callback(sucMsg,2);
                });
            });
        }
    });
};


