var VoteModel = require('../models/vote');
var util = require('util');
var validator = require('validator');
var ArrayHelper = require('../helper/myArray');
var NumberHelper = require('../helper/myNumber');
var moment = require('moment');
moment.locale('zh-cn'); // 使用中文


//查询投票列表
exports.findVoteListByPage = function(page,perpage,query,sort,callback)
{
    var _query = query || {};
    _query.is_delete = false;
    _query.is_valid = true; //合法投票
    var _sort = sort || {};

    VoteModel.pageQuery(page, perpage,"author author.school", _query, _sort,function(err,$page){
        return callback($page);
    });
};

//查询投票详情
exports.findVoteById = function(voteId,userid,callback)
{
    VoteModel.findOne({_id:voteId})
        .deepPopulate("author author.school ChoiceStats.users ChoiceStats.users.school")
        .exec(function(err,vote){
            if(err || !vote){
                return callback(null);
            }

            var votedUserList = ArrayHelper.getAttrArrayString(vote.ChoiceSituation,"user");
            console.log("find vote votedUserList:"+votedUserList);
            console.log("find vote userid:"+userid);
            var userIndex = userid ? votedUserList.indexOf(userid.toString()) : -1;
            vote.isVoted = userid && userIndex >= 0;
            vote.choice = vote.isVoted ? vote.ChoiceSituation[userIndex].choice : [];

            vote.isUserLimited = vote.user_limitation > 0 && vote.ChoiceSituation.length >= vote.user_limitation;

            vote.isFinished = vote.endTime && moment().isAfter(vote.endTime);

            vote.disable = vote.isVoted || vote.isUserLimited || vote.isFinished;
            vote.disableReason = "";
            if(vote.isFinished){
                vote.disableReason = "投票已结束";
            }else if(vote.isVoted){
                vote.disableReason = "您已经投过票，不能再次投票";
            }else if(vote.isUserLimited){
                vote.disableReason = "投票已达人数上限：" + vote.user_limitation + "人";
            }

            return callback(vote);
        });
};


//创建投票
exports.createVote = function(userid,postData,callback)
{
    if(!userid){
        return callback("请登录后再进行操作",null);
    }

    var vote  = new VoteModel(postData);

    if(!util.isArray(vote.options)){
        return callback("请填写投票的正确选项",null);
    }
    if(!NumberHelper.isZhengshu(vote.user_limitation)){
        return callback("最大投票用户数必须为正整数",null);
    }
    if(vote.user_limitation > 0 && vote.user_limitation < 30){
        return callback("最大投票用户数必须为30人及以上",null);
    }
    if(!NumberHelper.isZhengshu(vote.max_choice) || vote.max_choice <= 0 || vote.max_choice > vote.options.length){
        return callback("投票的最多选择数不可大于选项总数",null);
    }

    for(var i = 0 ; i < vote.options.length ; i++){
        vote.ChoiceStats.push({users:[]});
    }

    vote.save(function(err){
        if(err) {
            var errMsg = err.name == "RuleError" ? err.message : "服务器错误，创建投票失败！";
            return callback(errMsg,null);
        }

        return callback(null,vote);
    });
};

//删除投票
exports.removeDelete = function(userid,voteId,callback)
{
    if(!userid){
        return callback("请登录后再进行操作",0);
    }

    VoteModel.remove({_id:voteId,author:userid},function(err,doc){
        if(err || !doc){
            return callback("删除投票失败！",0);
        }

        return callback("删除投票成功！",2);
    })
};

//进行投票
exports.doVote = function(userid,voteId,choiceIndexArray,callback)
{
    if(!userid){
        return callback("请登录后再进行操作",0);
    }

    if(!util.isArray(choiceIndexArray) || choiceIndexArray.length <= 0){
        return callback("请正确选择对应选项",0);
    }

    VoteModel.findOne({_id:voteId},function(err,vote){
        if(err || !vote){
            return callback("服务器错误或无法获取投票信息，请稍后重试",0);
        }

        //if(vote.author && vote.author.toString() == userid.toString()){
        //    return callback("您不能对自己发布的投票进行投票",0);
        //}

        var votedUserList = ArrayHelper.getAttrArrayString(vote.ChoiceSituation,"user");
        console.log("votedUserList"+votedUserList);
        console.log("userid:"+userid.toString())
        var userIndex = votedUserList.indexOf(userid.toString());
        if(userIndex >= 0){     //已经投过票
            return callback("您已经投过票了，不能再次投票",0);
        }

        if(vote.ChoiceSituation.length >= vote.user_limitation){    //人数限制
            return callback("投票已经达到最大人数限制，您无法继续进行投票",0);
        }

        if(choiceIndexArray.length > vote.max_choice){  //选择数太多
            return callback("此投票最多可以选择"+ vote.max_choice +"个选项",0);
        }

        var optionSize = vote.options.length;
        choiceIndexArray.forEach(function(item){
            if(choiceIndexArray.indexOf(item) != choiceIndexArray.lastIndexOf(item))
            {
                return callback("不能重复选择选项",0);
            }

            if(!NumberHelper.isZhengshu(item) || item < 0 || item >= optionSize)
            {
                return callback("请正确选择对应选项~",0);
            }

            if(vote.ChoiceStats[item].users.indexOf(userid.toString()) >= 0)
            {
                return callback("您已经选择了该项，请不要重复投选",0);
            }

            vote.ChoiceStats[item].users.push(userid);
        });

        vote.ChoiceSituation.push({
            user:userid,
            choice:choiceIndexArray,
        });

        vote.save(function(err1){
            if(err1){
                var errMsg = err1.name == "RuleError" ? err1.message : "服务器错误，创建投票失败！";
                return callback(errMsg,0);
            }
            return callback("投票成功！",2);
        });
    });
};