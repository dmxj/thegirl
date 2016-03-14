var TaskModel = require('../models/task');
var TaskInfoModel = require('../models/taskInfo');
var ArrayHelper = require('../helper/myArray');
var moment = require('moment');
moment.locale('zh-cn'); // 使用中文

//分页获取任务
exports.divderPageGetTasks = function(page,perpage,query,sort,callback)
{
    var _query = query || {};
    _query.is_delete = false;
    _query.is_valid = true; //合法任务
    var _sort = sort || {};

    TaskModel.pageQuery(page, perpage,"author author.school", _query, _sort,function(err,$page){
        return callback($page);
    });
};

//获取热门任务
exports.getHotTask = function(num,callback)
{
    var opt = {limit:num};
    TaskModel.find({is_delete:false,is_valid:true},'',opt)
        .deepPopulate('author author.school comments receiveTasks sureHelpId')
        .exec(function(err,tasks){
            if(err || !tasks || tasks.length <= 0){
                return callback(null);
            }
            return callback(tasks);
        });
};

//根据id获取任务
exports.findTaskById = function(id,callback)
{
    TaskModel.findOne({_id:id})
        .deepPopulate('author author.school comments receiveTasks receiveTasks.user receiveTasks.user.school sureHelpId sureHelpId.user sureHelpId.user.school')
        .exec(function(err,task){
            if(err || !task){
                return callback(null);
            }
            return callback(task);
        });
};

//某人接任务
//如果此人已接该任务，则不能再接
exports.receiveTask = function(uid,taskid,msg,callback)
{
    if(!msg || msg.trim() == ""){
        return callback("接收任务留言不能为空");
    }

    TaskModel.findOne({_id:taskid},function(err,task){
        if(err || !task){
            return callback(err);
        }

        if(task.isEnd){
            return callback('任务已经结束了，去看看其他任务吧');
        }

        if(task.receiveTasks && task.receiveTasks.length > 0){
            task.receiveTasks.forEach(function(item){
                if(item.user == uid){   //已经接了该任务了，就别再接了，求你了
                    return callback('您已经接了该任务，不能重复接任务');
                }
            })
        }

        var taskInfo = new TaskInfoModel();
        taskInfo.user = uid;
        taskInfo.message = msg;

        taskInfo.save(function(err2) {
            if (err2) {    //接任务保存失败
                return callback(err2);
            }else{
                task.receiveTasks.push(taskInfo._id);
                task.save(function(err3){
                    return callback(err3);
                });
            }
        });
    });
};

//确认某人的任务
exports.sureHelp = function(userid,taskid,helpid,msg,callback)
{
    //if(!msg || msg.trim() == ""){
    //    return callback("对帮助你的人说的话不能为空");
    //}

    TaskModel.findOne({"_id":taskid},function(err1,task) {
        if (err1 || !task)
        {
            return callback("无法获取任务信息");
        }

        if(!userid || task.author.toString() != userid.toString()){
            return callback("您无权进行此操作");
        }

        if(task.is_finished){
            return callback('任务已经完成了，您不能再次确认任务');
        }

        if(!helpid ||!task.receiveTasks || task.receiveTasks.indexOf(helpid) < 0){
            return callback("服务器错误");
        }

        if(task.sureHelpId){    //已经确认某人的任务了，就别再确认了，求你了！
            return callback('该任务已经确认，不能重复确认');
        }

        TaskInfoModel.findOne({_id:helpid},function(err2,help){
            if(err2 || !help)
            {
                return callback("无法获取接收任务信息");
            }

            task.sureHelpId = helpid;
            task.sayToWinner = msg;
            task.is_finished = true;
            task.save(function(err3){
                return callback(err3);
            });
        });
    });
};

//添加任务remark
exports.addRemark = function(userid,taskid,remark,callback){
    if(!remark || remark.trim() == ""){
        return callback("任务remark不能为空");
    }

    remark = remark.trim();

    exports.findTaskById(taskid,function(task) {
        if(!task){
            return callback("未找到对应任务");
        }

        if(task.isEnd){
            return callback("任务已结束，您不能再做更多操作");
        }

        if(userid.toString() != task.author._id.toString()){
            return callback("您无权进行此操作");
        }

        if(task.remarks.indexOf(remark) >= 0){
            return callback("您已经添加该remark，请不要重复添加");
        }

        task.remarks.push(remark.trim());
        task.save(function(err2){
            return callback(err2);
        });
    });
};

//支持接受任务
exports.supportTakeTask = function(userid,taskInfoId,callback)
{
    TaskInfoModel.findOne({_id:taskInfoId},function(err,taskInfo){
        if(err || !taskInfo){
            callback("未找到对应信息，操作失败",0);
        }

        taskInfo.likeOrSupport(userid,function(isSuccess,msg){
            var code = isSuccess ? 2 : 0;
            callback(msg,code);
        });
    });
}