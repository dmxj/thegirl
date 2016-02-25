var ReportModel = require('../models/report');
var ReportProxy = require('../proxy/report');
var checkService = require('../services/check');

//显示举报详情页面
exports.showReport = function(req, res, next){

};

//发表举报
exports.postReport = function(req,res,next){
    checkService.checkIsLogin(req,function(user){
       if(!user){
           return res.redirect('/login');
       }
    });
};

//移除举报
exports.deleteReport = function(req,res,next){

};
