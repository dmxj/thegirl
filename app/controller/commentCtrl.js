var CommentOrder = require('../models/comment');
var CommentProxy = require('../proxy/comment');
var GoodProxy = require('../proxy/good');
var async = require('async');


//Ajax评论点赞或者取消赞
exports.likeComment = function(req,res,next)
{
    var uid = req.app.locals.uid;
    if(!uid){
        return res.json({msg:"您需要登录后才能操作",code:1});
    }

    console.log("获取到的commentId："+req.body.commentid);
    CommentProxy.likeComment(uid,req.body.commentid,function(msg,code){
        return res.json({msg:msg,code:code});
    });
};

//Ajax删除评论或回复
//如果评论是isTop的，则删除所有replyTo == commentid ,underList包含commentid的所有的评论
//如果评论不是isTop的，是回复评论的回复，则删除所有replyTo == commentid,删除replyList的某一项为commentid之后的所有的评论
exports.deleteComment = function(req,res,next)
{
    CommentProxy.deleteComment(req.app.locals.uid,req.body.cid,function(msg,code){
       return res.json({msg:msg,code:code});
    });
};

//回复评论
exports.replyTheComment = function(req,res,next)
{
    var uid = req.app.locals.uid;
    if(!uid){
        return res.json({msg:"您需要登录后才能操作",code:1});
    }
    CommentProxy.postReplyOfComment(uid,req.body.commentid,req.body.content,function(err,reply){
        if(err){
            return res.json({msg:err,code:0});
        }
        return res.json({msg:reply,code:2});
    });
};


//评论商品
exports.commentGood = function(req,res,next){
    var uid = req.app.locals.uid;
    if(!uid){
        return res.json({msg:'您需要登录后进行操作',code:1});
    }

    GoodProxy.postComment(uid,req.body.gid,req.body.content,function(err,comment){
        if(err){
            console.log('comment error:'+err);
            return res.json({msg:err,code:0});
        }
        console.log('just post comment:'+comment);
        return res.json({msg:comment,code:2});
    });
};


//Ajax分页获取商品的评论，不需要登录
exports.fetchGoodCommentsByPage = function(req,res,next)
{
    var goodid = req.body.gid;
    var page = req.body.page;
    var withImg = req.body.img;
    page = page?Math.floor(parseInt(page.toString().trim().toLowerCase())):1;
    withImg = (withImg != null && typeof withImg != "undefined") ? withImg : false;

    if(!goodid){
        return res.json({msg:'获取商品评论失败',code:0});
    }

    var query = {};
    if(withImg){
        query = {'$where':"this.pictures.length > 0"};
    }

    var perpage = 2;
    var params = {};
    async.waterfall([
        function(callback){ //1、获取所有评论
            GoodProxy.divderPageGetGoodComments(req.app.locals.uid,goodid,page,perpage,query,{},function(comments){
                if(!comments){
                    return callback(1,null);
                }
                params.comments = comments;
                if(page == 1) { //只有在请求第一页的时候才会继续查找热门评论和评论总数
                    return callback(null, null);
                }else{
                    return callback(2, null);
                }
            });
        },
        function(data,callback){ //2、获取热门评论
            GoodProxy.fetchHotGoodComments(goodid,function(hotcomments){
                params.hot = hotcomments;
                return callback(null,null);
            });
        },
        function(data,callback){ //3、获取评论总数
            GoodProxy.getGoodCommentsNumber(goodid,query,function(total){
                params.totalCount = total;
                params.pageCount = total % perpage == 0 ? total / perpage : Math.floor(total / perpage) + 1;
                return callback(null,null);
            });
        }
    ],function(err,results){
        if(err == 1){
            return res.json({msg:'暂时没有评论',code:0});
        }
        params.code = 2;
        return res.json(params);
    });

    //GoodProxy.divderPageGetGoodComments(req.app.locals.uid,goodid,page,perpage,query,{},function(comments){
    //    if(!comments){
    //        return res.json({msg:'暂时没有评论',code:0});
    //    }
    //    GoodProxy.fetchHotGoodComments(goodid,function(hotcomments){
    //        return res.json({msg:comments,hot:hotcomments,code:2});
    //    })
    //});

};


//评价订单=====同时评价商品
exports.commentOrder = function(req,res,next){

};
//评价店铺
exports.commentStore = function(req,res,next){

};
//评价求购
exports.commentAskbuy = function(req,res,next){

};
//评价主题
exports.commentTopic = function(req,res,next){

};
