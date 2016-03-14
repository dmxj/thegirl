var TaskModel = require('../models/task');
var TaskInfoModel = require('../models/taskInfo');
var TaskProxy = require('../proxy/task');
var checkService = require('../services/check');

//任务模块的主页
//如果用户已登录，则显示该用户所属学校的所有的任务
//如果用户未登录，则显示全国所有的任务
exports.index = function(req,res,next){
    var keyword = req.query.q;
    var sortby = req.query.sort;
    var page = req.query.page;
    keyword = keyword?keyword.trim().toLowerCase():null;
    sortby = sortby?sortby.trim().toLowerCase():"";
    page = page?Math.floor(parseInt(page.trim().toLowerCase())):1;

    var query = {};
    var option = {order:{hotlevel:-1}};
    if(keyword){
        query['$or'] = [
            {'content':new RegExp(keyword)},
        ];
    }

    if(sortby == "new"){    //根据评分排序
        option.order = {create_at:-1};
    }

    var params = {keyword:keyword};
    checkService.checkIsLogin(req,function(user){
        if(user){   //登录了
            //query["goodId.boss.school"] = user.school;
            params['master'] = user;
        }else{
            params['master'] = null;
        }

        TaskProxy.divderPageGetTasks(page,10,query,option.order,function($query){
            params['tasks'] = $query ? $query.results : null;
            params['pageCount'] = $query ? $query.pageCount : 0;
            return res.render200("task/index",params);
        });
    });
};

//显示某任务详情页
exports.showTask = function(req,res,next)
{
    var taskid = req.params.taskid;
    taskid = taskid ? taskid.trim().toLowerCase() : null;

    if(taskid){    //
        TaskProxy.findTaskById(taskid,function(task){
            if(!task || task.is_delete){
                return res.render200("unusual/deleted",{msg:"该任务不存在或已被作者删除"});
            }
            if(!task.is_valid){
                return res.render200("unusual/invalid",{msg:"该任务因违反有关规定，不予以显示"});
            }

            return res.render200("task/home",{task:task});
        });
    }else{  //直接跳转到店铺模块主页
        return res.redirect("/task");
    }
};

//Ajax接任务
//已经接了任务的就不能再接
exports.receiveTask = function(req,res,next)
{
    checkService.checkIsLogin(req,function(user){
        if(!user){
            return res.json({msg:'请登录后再进行操作',code:1});
        }

        var taskid = req.body.id;
        var message = req.body.msg;
        taskid = taskid ? taskid.trim().toLowerCase() : null;
        message = message ? message.trim() : '';

        TaskProxy.receiveTask(user.id,taskid,message,function(err){
            if(err){
                var errMsg = err.name == "RuleError" ? err.message : "服务器错误";
                return res.json({msg:errMsg,code:0});
            }

            return res.json({msg:'接任务成功',code:1});
        });
    });
};

//Ajax确认某人的任务
//已经确认任务的就不能再确认
exports.sureHelp = function(req,res,next)
{
    checkService.checkIsLogin(req,function(user){
        if(!user){
            return res.json({msg:'请登录后再进行操作',code:1});
        }

        var taskid = req.body.taskid;
        var helpid = req.body.helpid;
        var message = req.body.msg;

        taskid = taskid ? taskid.trim().toLowerCase() : null;
        helpid = helpid ? helpid.trim().toLowerCase() : null;
        message = message ? message.trim() : '';

        TaskProxy.sureHelp(user.id,taskid,helpid,message,function(err){
            if(err){
                return res.json({msg:'error',code:0});
            }

            return res.json({msg:'success',code:1});
        });
    });
};

//任务发布者添加任务remark
//Ajax添加，需要验证用户是否登录
exports.addRemark = function(req,res,next){

    checkService.checkIsLogin(req,function(user){
       if(!user){
           return res.json({msg:'请登录后再进行操作',code:1});
       }

        var taskid = req.body.taskid;
        var remarkContent = req.body.remark;

        taskid = taskid ? taskid.trim().toLowerCase() : null;
        remarkContent = remarkContent ? remarkContent.trim() : '';

        TaskProxy.addRemark(user.id,taskid,remarkContent,function(err){
            if(err){
                return res.json({msg:err,code:0});
            }

            return res.json({msg:'添加remark成功',code:2});
        });
    });
};


//支持接受任务
exports.supportTakeTask = function(req,res,next)
{
    checkService.checkIsLogin(req,function(user){
        if(!user){
            return res.json({msg:'请登录后再进行操作',code:1});
        }

        var taskInfoId = req.body.id;
        taskInfoId = taskInfoId ? taskInfoId.trim().toLowerCase() : null;

        TaskProxy.supportTakeTask(user.id,taskInfoId,function(msg,code){
            return res.json({msg:msg,code:code});
        });
    });
};


