var ActivityModel = require('../models/activity');
var ActivityProxy = require('../proxy/activity');
var ActivityFormProxy = require('../proxy/activityForm');
var ActivitySignInfoProxy = require('../proxy/activitySignInfo');
var ActivitySceneProxy = require('../proxy/activityScene');
var FormType = require('../const/formType');
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
            //query["goodId.boss.school"] = user.school;
            params['master'] = user;
        }else{
            params['master'] = null;
        }

        ActivityProxy.divderPageGetActivities(page,30,query,option.order,function($query){
            params['activities'] = $query ? $query.results : null;
            params['pageCount'] = $query ? $query.pageCount : 0;

            return res.render200("activity/index",params);
        });
    });
};

//显示活动详情页
exports.home = function(req, res, next){
    var activityId = req.params.activityId;
    var myUid = req.app.locals.uid;
    ActivityProxy.getActivityAndStatById(myUid,activityId,function(activity){
        if(!activity){
            return res.render404("不存在该活动");
        }
        if(activity.is_delete){
            return res.renderDelete("该活动已被删除，请浏览其他活动");
        }
        if(!activity.is_valid){
            return res.renderInvalid("该活动不合法，不予以显示");
        }
        return res.render200('activity/home',{activity:activity});
    });
};

//活动报名表填写主页
exports.signForm = function(req,res,next){
    checkService.checkIsLogin(req,function(user){
       if(!user){
           return res.redirect('/login');
       }

        var activityId = req.params.activityId;
        ActivityProxy.getActivityById(activityId,function(activity){
            if(!activity || activity.signForm == null){
                return res.renderCountDown("未查找到该活动的活动表单，请稍后重试",8,"/activity/" + activity._id);
            }

            return res.render200('activity/sign',{activity:activity,Type:FormType});
        });
    });
}

//报名活动
exports.signActivity = function(req, res, next){
    checkService.checkIsLogin(req,function(user){
        if(!user){
            return res.json({code:1,msg:'请登录后再操作'});
        }
        var activityId = req.body.aid;
        var postData = req.body.form;
        ActivityModel.findOne({_id:activityId,is_delete:false,is_valid:true},function(err,activity){
            if(err || !activity){
                return res.json({code:0,msg:'未找到该活动信息，请刷新重试'});
            }else if(activity.signForm != null && postData == null){
                //TODO 跳转到活动表单填写页面 ?
                return res.json({code:0,msg:'请填写报名表信息'});
            }else if(activity.signForm != null){
                ActivitySignInfoProxy.postSignForm(user.id,activityId,postData,function(err,activitySignInfo){
                    console.log("控制器中打印报名失败信息："+err);
                    if(err) return res.json({code:0,msg:err});
                    var sucMsg = activitySignInfo && activitySignInfo.reviewStatus == 2 ? "报名成功，直接通过审核！" : "报名成功，等待审核！";
                    var status = activitySignInfo.reviewStatus;
                    var gender = user.gender;
                    return res.json({code:2,msg:sucMsg,status:status,gender:gender});
                });
            }else{
                ActivitySignInfoProxy.signNoForm(user.id,activityId,function(err,activitySignInfo){
                    if(err) return res.json({code:0,msg:err});
                    var sucMsg = activitySignInfo && activitySignInfo.reviewStatus == 2 ? "报名成功，直接通过审核！" : "报名成功，等待审核！";
                    return res.json({code:2,msg:sucMsg});
                });
            }
        });
    });
};

//活动发起者，查看活动报名者信息，
exports.viewSignerInfo = function(req, res, next){

};

//活动发起者，审核通过活动报名
exports.passSignAcvitity = function(req, res, next){
    checkService.checkIsLogin(req,function(user) {
        if (!user) {
            return res.json({code: 1, msg: '请登录后再操作'});
        }

        ActivitySignInfoProxy.reviewSign(req.body.sid,user.id,true,function(errMsg){
            if(errMsg){
                return res.json({code: 0, msg: errMsg});
            }
            return res.json({code: 2, msg: "通过审核操作成功！"});
        });
    });
};
//活动发起者，审核不通过活动报名
exports.noPassSignActivity = function(req, res, next){
    checkService.checkIsLogin(req,function(user) {
        if (!user) {
            return res.json({code: 1, msg: '请登录后再操作'});
        }

        ActivitySignInfoProxy.reviewSign(req.body.sid,user.id,false,function(errMsg){
            if(errMsg){
                return res.json({code: 0, msg: errMsg});
            }
            return res.json({code: 2, msg: "未通过审核操作成功！"});
        });
    });
};

//上传活动图片
exports.uploadPictures = function(req,res,next){
    checkService.checkIsLogin(req,function(user){
        if(!user){
            return res.json({code:1,msg:'请登录后再操作'});
        }

        ActivitySceneProxy.uploadActivityPicture(user.id,req.body.aid,req.body.desc,req.body.picture,function(errMsg){
            if(errMsg){
                return res.json({code:0,msg:errMsg});
            }
            return res.json({code:2,msg:"上传成功"});
        });
    });
};
