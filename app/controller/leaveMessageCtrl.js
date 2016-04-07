var LeaveMessageModel = require('../models/leaveMessage');
var LeaveMessageProxy = require('../proxy/leaveMessage');

//留言
exports.leaveMessage = function(req,res,next)
{
    LeaveMessageProxy.leaveMessage(req.app.locals.uid,req.body.uid,req.body.msg,function(errMsg){
        if(errMsg){
            return res.json({msg:errMsg,code:0});
        }
        return res.json({msg:"留言成功",code:2});
    });
};

//回复留言
exports.replyLeaveMessage = function(req,res,next)
{
    LeaveMessageProxy.replyLeaveMessage(req.app.locals.uid,req.body.uid,req.body.lmid,req.body.msg,function(errMsg){
        if(errMsg){
            return res.json({msg:errMsg,code:0});
        }
        return res.json({msg:"留言成功",code:2});
    });
};
