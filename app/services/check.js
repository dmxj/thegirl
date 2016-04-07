var validator      = require('validator');
var UserModel = require('../models/user');
var UserProxy = require('../proxy/user');
var GoodProxy = require('../proxy/good');
var StoreProxy = require('../proxy/store');
var TimeHelper = require('../helper/myTime');
var ValidatorHelper = require('../helper/myValidatorHelper');
var async = require('async');
var util = require('util');
var validator = require('validator');

exports.checkUser = function(name,pwd,done)
{
    var getUserCallback = function(err,user){
        if(err) return done('系统出错，请稍候重试',null);
        if(!user) return done('该用户不存在',null);
        if(!user.confirm && TimeHelper.isPassedYesterday(user.create_at))  return done('该用户不存在',null);
        if(!user.confirm && !TimeHelper.isPassedYesterday(user.create_at))  return done('未通过邮箱认证，请检查收件箱',null);
        if(!user.authenticate(pwd)) return done('用户名或密码错误，请检查',null);
        return done(null,user);
    };
    if(validator.isEmail(name)){
        console.log('use email to login');
        UserProxy.getUserByEmail(name,function(err,user){
            getUserCallback(err, user);
        });
    }else if(ValidatorHelper.isPhone(validator)){
        console.log('use phone to login');
        UserProxy.getUserByPhone(name,function(err,user){
            getUserCallback(err,user);
        });
    }else{
        console.log('login name:'+name);
        UserProxy.getUserByName(name,function(err,user){
            getUserCallback(err,user);
        });
    }
};

exports.checkTelphoneCode = function()
{
    return true;
};

//根据用户ID或id数组检查id是否存在相应id的用户
exports.checkUserIdValid = function(id,callback)
{
    if(!id || id.length <= 0){
        return callback("用户id不能为空");
    }

    var useridArr = id;
    if(!util.isArray(id)){
        useridArr = [id];
    }

    var taskArray = useridArr.map(function(item,index){
        return function(done){
            if(!validator.isMongoId(item)){
                return done("存在不合法的用户id参数，请检查后重试",null);
            }
            UserModel.find({_id:item,confirm:true},function(err,user){
                if(err || !user){
                    return done("存在不合法的用户id参数，请检查后重试",null);
                }else{
                    return done(null,null);
                }
            });
        }
    });

    async.series(taskArray,function(err,results){
        return callback(err);
    });
};


exports.checkIsLogin = function(req,done)
{
    var uid = req.app.locals.uid;
    UserProxy.getUserById(uid,function(err,user){
        if(err || !user) return done(null);
        if(req.session.userid != uid || user.username != req.session.username) {
            console.log("session 校验错误");
            console.log("req.session.userid:"+req.session.userid+"===uid:"+uid+",相等吗？"+(req.session.userid == uid));
            console.log("req.session.username:"+req.session.username+"===user.username:"+user.username+",相等吗？"+(req.session.username == user.username));
            return done(null);
        }
        var master = {};
        master.name = user.username;
        master.id = user._id;
        master.gender = user.gender;
        master.school = user.school;
        return done(master);
    });
};

//检验用户发布商品的权限
exports.checkPublishGoodPermisson = function(req,done)
{
    var uid = req.app.locals.uid;
    async.waterfall([
        function(callback){    //检验用户是否登录
            exports.checkIsLogin(req,function(user){
                if(user){
                    callback(null);
                }else{
                    callback("need login");
                }
            });
        },
        function(callback){ //检验用户是否有不合法的商品存在
            GoodProxy.findInvalidGoodByUid(uid,function(goods){
                if(goods){
                    callback("您有不合法的商品未删除，请删除后再操作！");
                }else{
                    callback(null);
                }
            });
        },
        function(callback){ //检验用户是否有不合法的店铺存在
            StoreProxy.findInvalidStoreByUid(uid,function(stores){
                if(stores){
                    callback("您有不合法的店铺未删除，请删除后再操作！");
                }else{
                    callback(null);
                }
            })
        }
    ],function(err,results){
        console.log('checkPublisGoodPermisson error:'+err);
        done(err);
    });
};


//检验用户创建店铺的权限:比创建商品多一个权限：发布的商品必须在5个及以上
exports.checkCreateStorePermisson = function(req,done)
{
    var uid = req.app.locals.uid;
    async.waterfall([
        function(callback){    //检验用户是否登录
            exports.checkPublishGoodPermisson(req,function(err){
                callback(err);
            });
        },
        function(callback){ //检验用户是否发布了5个或5个以上的商品
            GoodProxy.findGoodTotalIsEnough(uid,5,function(isEnough){
               if(!isEnough){
                   callback("您必须创建5个以上的商品才可以创建店铺！");
               }else{
                   callback(null);
               }
            });
        }
    ],function(err,results){
        console.log('checkCreateStorePermisson error:'+err);
        done(err);
    });
};

//检验用户创建优惠券的权限
exports.checkCreateCouponPermission = function(req,done)
{
    var uid = req.app.locals.uid;
    async.waterfall([
        function(callback){    //检验用户是否登录
            exports.checkCreateStorePermisson(req,function(err){
                callback(err);
            });
        },
        function(callback){ //检验用户是否达到了某个销售量才可以创建优惠券
            callback(null);
        }
    ],function(err,results){
        console.log('checkCreateCouponPermission error:'+err);
        done(err);
    });
};

//检验用户发布拍卖的权限
exports.checkCreateAuctionPermission = function(req,done)
{
    var uid = req.app.locals.uid;
    async.waterfall([
        function(callback){    //检验用户是否登录
            exports.checkPublishGoodPermisson(req,function(err){
                callback(err);
            });
        },
        function(callback){ //检验用户是否达到了某个销售量才可以创建优惠券
            callback(null);
        }
    ],function(err,results){
        console.log('checkCreateAuctionPermission error:'+err);
        done(err);
    });
};