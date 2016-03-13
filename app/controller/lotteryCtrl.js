var LotteryModel = require('../models/lottery');
var UserModel = require('../models/user');
var LotteryProxy = require('../proxy/lottery');
var UserProxy = require('../models/user');
var checkService = require('../services/check');

//Ajax执行抽奖操作！
exports.doLottery = function(req,res,next)
{
    var uid = req.app.locals.uid;
    if(!uid){
        return res.json({msg:'请您登录后再进行操作',code:1});
    }

    LotteryProxy.lottery(uid,req.body.lotteryid,function(msg,code){
       return res.json({msg:msg,code:code});
    });
};