var BlackListModel = require('../models/blackList');
var UserModel = require('../models/user');
var ArrayHelper = require('../helper/myArray');
var async = require('async');
var validator = require('validator');
var checkService = require('../services/check');

//拉黑
exports.pushToBlackList = function(myUid,userId,callback)
{
    async.waterfall([
        function (done) { //检查userId
            checkService.checkUserIdValid([myUid,userId],function(err){
                return done(err,null);
            });
        },
        function (data,done) {
            BlackListModel.findAndCreate({author:myUid},{author:myUid},function(blackList){
                if(!blackList){
                    return done("拉黑失败",null);
                }else if(blackList.blacklist.indexOf(userId) >= 0){
                    return done("已经拉黑，不需要重复操作",null);
                }else{
                    return done(null,blackList);
                }
            });
        },
        function (blackList,done) {
            blackList.blacklist.push(userId);
            blackList.save(function(err){
                var errMsg = err ? "拉黑操作失败" : null;
                return done(errMsg,null);
            });
        },
    ],function(err,results){
        return callback(err);
    });
};

//从黑名单中移出
exports.popFromBlackList = function(myUid,userId,callback)
{
    async.waterfall([
        function (done) { //检查userId
            checkService.checkUserIdValid([myUid,userId],function(err){
                return done(err,null);
            });
        },
        function (data,done) {
            BlackListModel.findOne({author:myUid},function(err,blackList){
                if(err || !blackList || blackList.blacklist.indexOf(userId) < 0){
                    return done("未找到拉黑记录，请检查后重试",null);
                }else{
                    return done(null,blackList);
                }
            });
        },
        function (blackList,done) {
            blackList.blacklist = ArrayHelper.removeElement(blackList.blacklist,userId);
            blackList.save(function(err){
                var errMsg = err ? "取消拉黑失败" : null;
                return done(errMsg,null);
            });
        },
    ],function(err,results){
        return callback(err);
    });
};
