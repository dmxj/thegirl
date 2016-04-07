var LeaveMessageModel = require('../models/leaveMessage');
var UserModel = require('../models/user');
var async = require('async');
var validator = require('validator');
var checkService = require('../services/check');

function checkPermission(myUid,toUserId,callback)
{
    return callback(null);
}

//留言
exports.leaveMessage = function(myUid,toUserId,message,callback)
{
    async.waterfall([
        function(done){ //检查参数
            if(myUid == null || validator.isMongoId(myUid)){
                return done("请登录后继续操作",null);
            }else if(toUserId == null || !validator.isMongoId(toUserId)){
                return done("留言对象的ID不能为空",null);
            }else if(!message || message.trim() == ""){
                return done("留言信息不能为空",null);
            }else{
                checkService.checkUserIdValid([myUid,toUserId],function(err){
                    return done(err,null);
                });
            }
        },
        function(data,done){    //检查留言权限
            checkPermission(myUid,toUserId,function(err){
                return done(err,null);
            });
        },
        function(data,done){    //插入留言记录
            var leaveMessageInstance = new LeaveMessageModel({
                leaveUser:myUid,
                toUser:toUserId,
                messageContent:message
            });
            leaveMessageInstance.save(function(err){
                var errMessage = err ? (err.name == "RuleError" ? err.message : "系统繁忙，请稍后重试") : null;
                return done(errMessage,null);
            });
        }
    ],function(err,results){
        return callback(err);
    });
};

//回复留言
exports.replyLeaveMessage = function(myUid,toUserId,leaveMessageId,message,callback)
{
    async.waterfall([
        function(done){ //参数检查
            if(myUid == null || validator.isMongoId(myUid)){
                return done("请登录后继续操作",null);
            }else if(toUserId == null || !validator.isMongoId(toUserId)){
                return done("留言对象的ID不能为空",null);
            }else if(!message || message.trim() == ""){
                return done("回复信息不能为空",null);
            }else{
                LeaveMessageModel.findOne({_id:leaveMessageId},function(err,leaveMessage){
                    var errMsg = err || !leaveMessage ? "未找到回复留言的ID，请检查重试" : null;
                    return done(errMsg,null);
                });
            }
        },
        function(data,done){ //检查userID
            checkService.checkUserIdValid([myUid,toUserId],function(err){
                return done(err,null);
            });
        },
        function(data,done){    //权限检查
            checkPermission(myUid,toUserId,function(err){
                return done(err,null);
            });
        },
        function(data,done){    //插入回复信息
            var leaveMessageInstance = new LeaveMessageModel({
                leaveUser:myUid,
                toUser:toUserId,
                messageContent:message
            });
            leaveMessageInstance.save(function(err){
                var errMessage = err ? (err.name == "RuleError" ? err.message : "系统繁忙，请稍后重试") : null;
                return done(errMessage,leaveMessageInstance);
            });
        },
        function(replyLeaveMessage,done){    //更新回复的留言的replyList
            LeaveMessageModel.update({_id: leaveMessageId },
                        {
                            $push: {replyList: replyLeaveMessage._id}
                        },
            function(err, numAffected) {
                var replyLeaveMessageId = err || numAffected <= 0 ? replyLeaveMessage._id : null;
                return done(null,replyLeaveMessageId);
            });
        },
        function(data,done){ //如果上一步的更新失败，则进行回退操作
            if(data){   //上一步的更新失败
                LeaveMessageModel.remove({_id:data},function(){
                    return done("回复失败，请稍后重试",null);
                });
            }else{
                return done(null,null);
            }
        }
    ],function(err,results){
        return callback(err);
    })
};
