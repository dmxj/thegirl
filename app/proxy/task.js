var TaskModel = require('../models/task');
var TaskInfoModel = require('../models/taskInfo');

//分页获取任务
exports.divderPageGetTasks = function(index,perpage,query,option,callback)
{
    var _query = query || {};
    _query.is_delete = false;
    _query.is_valid = true;
    var _option = option || {};
    TaskModel.find(_query,'',_option)
        .skip((index-1)*perpage)
        .limit(perpage)
        .populate('goodId comments receiveTasks sureHelpId')
        .exec(callback);
};

//获取热门任务
exports.getHotTask= function(num,callback)
{
    var opt = {limit:num};
    TaskModel.find({is_delete:false,is_valid:true},'',opt)
        .populate('goodId comments receiveTasks sureHelpId')
        .exec(callback);
};

//根据id获取任务
exports.getTaskById = function(id,callback)
{
    TaskModel.findOne({_id:id})
        .populate('goodId comments receiveTasks sureHelpId')
        .exec(callback);
};

//某人接任务
//如果此人已接该任务，则不能再接
exports.receiveTask = function(uid,taskid,msg,callback)
{
    TaskModel.findOne({_id:taskid},function(err,task){
        if(err || !task){
            return callback(err);
        }

        if(task.receiveTasks && task.receiveTasks.length > 0){
            task.receiveTasks.forEach(function(item){
                if(item.user == uid){   //已经接了该任务了，就别再接了，求你了
                    return callback('again');
                }
            })
        }

        var taskInfo = new TaskInfoModel();
        taskInfo.taskId = taskid;
        taskInfo.user = uid;
        taskInfo.message = msg;

        taskInfo.save(function(err2) {
            if (err2) {    //接任务保存失败
                return callback(err2);
            }else{
                task.sureHelpId.push(taskInfo._id);
                task.save(function(err3){
                    if(err3){
                        return callback(err3);
                    }

                    return callback(null);
                });
            }
        });
    });
};

//确认某人的任务
exports.sureHelp = function(uid,taskid,helpid,msg,callback)
{
    exports.getTaskById(taskid,function(err,task) {
        if (err || !task || task.goodId.boss != uid || !task.receiveTasks || task.receiveTasks.indexOf(helpid) < 0)
        {
            return callback(err);
        }

        if(task.sureHelpId){    //已经确认某人的任务了，就别再确认了，求你了！
            return callback('again');
        }

        TaskInfoModel.findOne({_id:helpid},function(err2,help){
            if(err2 || !help)
            {
                return callback(err2);
            }

            task.sureHelpId = helpid;
            task.sayToWinner = msg;
            task.save(function(err3){
                if(err3)
                {
                    return callback(err3);
                }

                return callback(null);
            });
        });
    });
};

//添加任务remark
exports.addRemark = function(taskid,remark,callback){
    if(!remark || !remark.trim()){
        return callback(null);
    }
    exports.getTaskById(taskid,function(err,task) {
        if(err || !task){
            return callback(null);
        }

        task.remarks.push(remark.trim());
        task.save(function(err2){
            return callback(err2);
        });
    });
};