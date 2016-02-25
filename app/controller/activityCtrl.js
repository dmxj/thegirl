var ActivityModel = require('../models/activity');
var ActivityProxy = require('../proxy/activity');
var checkService = require('../services/check');

//活动主页，分页显示活动
exports.index = function(req, res, next){
    var keyword = req.query.q;
    var page = req.query.page;
    var sortby = req.query.sortby;
    keyword = keyword?keyword.trim().toLowerCase():null;
    sortby = sortby?sortby.trim().toLowerCase():"";
    page = page?Math.floor(parseInt(page.trim().toLowerCase())):1;

    var query = {};
    var option = {sort:{create_at:-1}};    //默认按照创建日期排序
    if(keyword){
        query['$or'] = [
            {'title':new RegExp(keyword)},
            {'detail':new RegExp(keyword)},
        ];
    }

    if(sortby == "hot"){    //按照热度排序
        option.order = {hotlevel:-1};
    }else if(sortby == "near"){     //按照开始的新旧程度排序
        option.order = {activity_time:-1};
    }

    var params = {keyword:keyword};
    checkService.checkIsLogin(req,function(user){
        if(user){   //登录了
            query["goodId.boss.school"] = user.school;
            params['master'] = user;
        }else{
            params['master'] = null;
        }

        ActivityProxy.divderPageGetActivities(page,30,query,option,function(activities){
            if(err || !activities) {
                params['activities'] = null;
            }else{
                params['activities'] = activities;
            }
            return res.render200("activity/index",params);
        });
    });


};
//显示活动详情页
exports.showActivity = function(req, res, next){

};

//报名活动
exports.signActivity = function(req, res, next){

};

//活动发起者，查看活动报名者信息，
exports.viewSignerInfo = function(req, res, next){

};

//活动发起者，审核通过活动报名
exports.passSignAcvitity = function(req, res, next){

};
//活动发起者，审核不通过活动报名
exports.noPassSignActivity = function(req, res, next){

};
