var UserModel = require('../models/user');
var VoteModel = require('../models/vote');
var VoteProxy = require('../proxy/vote');
var validator = require('validator');
var checkService = require('../services/check');


//投票模块的主页
exports.index = function(req,res,next)
{
    var page = req.query.p; //页码
    var sort = req.query.sort;  //排序

    page = page?Math.floor(parseInt(page.trim().toLowerCase())):1;
    sort = sort?sort.trim().toLowerCase():"";

    var query = {};
    var option = {sort:{create_at:-1}};

    if(sort == "hot"){  //最热
        option.sort = {visitCount:-1};
    }else if(sort == "new"){    //最新
        option.sort = {create_at:-1};
    }

    var params = {};
    checkService.checkIsLogin(req,function(user){
        params['master'] = user;
        if(user){
            //query["author.school"] = user.school;
        }
        VoteProxy.findVoteListByPage(page,10,query,option.sort,function($query){
            params['votes'] = $query ? $query.results : null;
            params['pageCount'] = $query ? $query.pageCount : 0;

            return res.render200('vote/index',params);
        });
    });
};


//投票的主页
exports.home = function(req,res,next)
{
    var voteId = req.params.voteId;
    if(!voteId || voteId.toString().trim() == "")
    {
        return res.redirect('/vote');
    }

    VoteProxy.findVoteById(voteId,req.app.locals.uid,function(vote){
        if(!vote || vote.is_delete){
            return res.render200('unusual/deleted',{"msg":"该投票不存在或已被发布者移除"});
        }
        if(!vote.is_valid){
            return res.render200('unusual/invalid',{"msg":"该投票不合法，不予以显示"});
        }

        return res.render200('vote/home',{vote:vote});
    });
};


//进行投票
exports.submitVote = function(req,res,next)
{
    checkService.checkIsLogin(req,function(user){
        if(!user){
           return res.json({msg:'请登录后操作！',code:1});
        }

        VoteProxy.doVote(user.id,req.body.id,req.body.choice,function(msg,code){
            return res.json({msg:msg,code:code});
        });
    });
};
