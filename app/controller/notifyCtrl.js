var Models = require('../models');
var NotifyModel = Models.Notification;
var NotifyProxy = require('../proxy/notification');
var ShopCartProxy = require('../proxy/shopCart');
var checkService = require('../services/check');
var async = require('async');

//Ajax获取本人的通知信息
//每个界面启动都会有一次这样的AJax请求
exports.fetchNotifications = function(req,res,next){
    var uid = req.app.locals.uid;
    var params = {};
    async.waterfall([
        function(callback){ //1、先获取通知
            NotifyProxy.getNotificationsByUid(uid,function(err,notifys){
                if(err){
                    return callback(err,err);
                }
                params.notifys = notifys;
                params.notifyTotal = notifys.length;
                return callback(null,null);
            });
        },
        function(data,callback){
            ShopCartProxy.fetchShopCartNumByUid(uid,function(amount){
                params.cartTotal = amount;
                return callback(null,null);
            });
        }
    ],function(err,results){
        if(err){
            return res.json({msg:'',code:0});
        }
        params.code = 2;
        return res.json(params);
    });
};

//点击某条通知信息，进行判断跳转
exports.msgClick = function(req,res,next){
    var nid = req.params.nid;
    if(!nid){
        return res.redirect('/');   //应该跳转到前一页
    }

    //进行判断，随即进行跳转
    return res.redirect('/');
};

//设置某条信息被已读
exports.setReaded = function(req,res,next){
    var nid = req.body.nid;
    if(!nid){
        return res.json({msg:'',code:0});
    }

    NotifyProxy.setNotifyReadedById(nid,function(err,notify){
        if(err || !notify){
            return res.json({msg:'',code:0});
        }

        return res.json({msg:'',code:2});
    });
}

//设置全部已读
exports.setReadedAll = function(req,res,next){
    var uid = req.app.locals.uid;
    NotifyProxy.setNotifyReadedAll(uid,function(err,notify){
        if(err || !notify){
            return res.json({msg:'',code:0});
        }

        return res.json({msg:'',code:2});
    })
}
