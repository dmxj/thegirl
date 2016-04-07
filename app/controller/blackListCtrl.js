var BlackListModel = require('../models/blackList');
var BlackListProxy = require('../proxy/blackList');

//拉黑
exports.pullToBlackList = function(req,res,next)
{
    BlackListProxy.pushToBlackList(req.app.locals.uid,req.body.uid,function(errMsg){
        if(errMsg){
            return res.json({msg:errMsg,code:0});
        }
        return res.json({msg:"拉黑成功",code:2});
    });
};

//取消拉黑
exports.removeFromBlackList = function(req,res,next)
{
    BlackListProxy.popFromBlackList(req.app.locals.uid,req.body.uid,function(errMsg){
        if(errMsg){
            return res.json({msg:errMsg,code:0});
        }
        return res.json({msg:"取消拉黑成功",code:2});
    });
};
