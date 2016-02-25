var models = require('../models');
var checkService = require('../services/check');

exports.passAuth = function(req){
    return true;
}

exports.auth = function(req,res,next){
    checkService.checkIsLogin(req,function(user){
        if(!user){
            return res.redirect('/login');
        }

        return next();
    });
}

//一些ajax请求，用户未登录的情况
exports.authAjax = function(req,res,next){
    checkService.checkIsLogin(req,function(user){
        if(!user){
            return res.json({msg:'need login',code:1});
        }else{
            return next();
        }
    });
}

exports.authAdmin = function(req,res,next){

}