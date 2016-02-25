var CommentModel = require('../models/comment');
var CommentType = require('../const/commentType');
var ArrayHelper = require('../helper/myArray');
var validator = require('validator');

//发表评论
exports.postComment = function(uid,content,id,type,callback)
{
    if(!uid){
        return callback("您需要登录后才能评论",null);
    }

    if(!content || !content.trim())
    {
        return callback("评论内容不能为空",null);
    }

    var col = "";
    switch (type){
        case CommentType.REPLY_GOOD:
            col = "good";
            break;
        case CommentType.REPLY_ASKBUY:
            col = "askbuy";
            break;
        case CommentType.REPLY_STORE:
            col = "store";
            break;
    }

    if(col == ""){
        return callback("发生错误，评论失败！",null);
    }

    var comment = new CommentModel();
    comment.author = uid;
    comment.content = content;
    comment[col] = id;
    comment.save(function(err){
       if(err && err.name != "RuleError"){
           return callback("评论发生错误",null);
       }else if(err){
           return callback(err.message,null);
       }

        comment.populate('author',function(err,pinglun){
            if(err){
                return callback("获取评论失败！",null);
            }

            pinglun = pinglun.change(uid);
            return callback(null,pinglun);
        });
    });
};


//发表评论的回复
exports.postReplyOfComment = function(uid,commentId,content,callback)
{
    if(!uid){
        return callback("您需要登录后才能回复",null);
    }

    if(!content || !content.trim())
    {
        return callback("回复内容不能为空",null);
    }

    var reply = new CommentModel();
    reply.author = uid;
    reply.content = content;
    reply.replyTo = commentId;

    CommentModel.findOne({_id:commentId,is_deleted:false},function(err,comment){
        if(err){
            if(err.name != "RuleError"){
                return callback("服务器发生错误",null);
            }
            return callback(err.message,null);
        }else if(!comment){
            return callback("评论不存在，可能刚刚被删除",null);
        }else{
            comment.isTop && comment.replyList.indexOf(reply._id) < 0 && comment.replyList.push(reply._id);
            comment.save(function(err1){
                if(err1) {
                    if (err1.name != "RuleError") {
                        return callback("评论发生错误", null);
                    }
                    return callback(err1.message, null);
                }

                reply.good = comment.good;
                reply.store = comment.store;
                reply.askbuy = comment.askbuy;

                reply.underList = comment.underList;
                reply.underList.push(commentId);
                reply.save(function(err2){
                    if(err2){
                        comment.replyList = ArrayHelper.removeElement(comment.replyList,reply._id);
                        comment.save(function(){
                                if(err2.name != "RuleError"){
                                    return callback("评论发生错误",null);
                                }
                                return callback(err2.message,null);
                        })
                    }else{  //回复评论成功！
                        reply.populate('author underList underList.author',function(err3,resp){
                            if(err3){
                                return callback("获取回复失败！",null);
                            }
                            resp = resp.change(uid);
                            return callback(null,resp);
                        });

                    }
                });
            });
        }
    });
};


//发表评论的回复
exports.postReplyOfComment2 = function(uid,commentId,content,callback)
{
    if(!uid){
        return callback("您需要登录后才能回复",null);
    }

    if(!content || !content.trim())
    {
        return callback("回复内容不能为空",null);
    }

    var reply = new CommentModel();
    reply.author = uid;
    reply.content = content;
    reply.replyTo = commentId;
    reply.save(function(err){
        if(err){
            if(err.name != "RuleError"){
                return callback("评论发生错误",null);
            }
            return callback(err.message,null);
        }else{
            CommentModel.findOne({_id:commentId,isTop:true,is_deleted:false},function(err1,comment){
                if(err1){
                    reply.remove(function(){
                        if(err1.name != "RuleError"){
                            return callback("评论发生错误",null);
                        }
                        return callback(err.message,null);
                    });
                }else if(comment){
                    comment.replyList.indexOf(reply._id) < 0 && comment.replyList.push(reply._id);
                    comment.save(function(err2){
                        reply.remove(function(){
                            if(err2.name != "RuleError"){
                                return callback("评论发生错误",null);
                            }
                            return callback(err.message,null);
                        });
                    });
                }else{
                    reply.populate('author')
                        .exec(function(err,reps){
                            if(err){
                                return callback("获取评论失败！",null);
                            }

                            reps = reps.change(uid);
                            return callback(null,reps);
                        });
                }
            });
        }
    });
};


//给评论或回复点赞
exports.likeComment = function(uid,commentId,callback)
{
    if(!uid){
        return callback("您需要登录后才能点赞",1);
    }

    CommentModel.findOne({_id:commentId},function(err,comment){
        if(err || !comment){
            return callback("操作失败！",0);
        }

        var errMsg = "";
        var sucMsg = "";
        if(comment.likeUser.indexOf(uid) >= 0){ //进行取消点赞操作
            comment.likeUser = ArrayHelper.removeElement(comment.likeUser,uid);
            errMsg = "取消点赞失败！";
            sucMsg = "取消点赞成功！";
        }else{  //进行点赞操作
            comment.likeUser.push(uid);
            errMsg = "点赞失败！";
            sucMsg = "点赞成功！";
        }

        comment.save(function(err1){
           if(err1){
               return callback(errMsg,0);
           }

            return callback(sucMsg,2);
        });
    });
};


//删除评论
exports.deleteComment = function(myUid,commentid,callback)
{
    if(!myUid){
        return callback("您需要登录后才能点赞",1);
    }
    if(!commentid){
        return callback("获取评论信息失败！",0);
    }

    CommentModel.findOne({_id:commentid,is_deleted:false},function(err,comment){
        if(err || !comment){
            return callback("查找评论失败！",0);
        }

        console.log("删除评论："+commentid)
        console.log("comment.author："+comment.author);
        console.log("myUid："+myUid);
        if(validator.toString(comment.author) != validator.toString(myUid)){
            return callback("您没有权限进行该操作！",0);
        }

        if(comment.isTop){
            var query = {
                '$or':[
                    {"_id":commentid},
                    {"replyTo":commentid},
                    {"underList":commentid}
                ]
            };
            CommentModel.update(query,{$set:{'is_deleted':true}},{multi:true},function(err1){
                if(err1){
                    return callback("删除评论失败！",0);
                }

                return callback("删除评论成功！",2);
            });
        }else{
            CommentModel.findOne({"replyList":commentid},function(err2,comment2){
                if(err2 || !comment2){
                    return callback("删除评论出错，请稍后重试",0);
                }

                var beReplyedIdArr = ArrayHelper.removeElementAndAfter(comment2.replyList,commentid);
                comment2.save(function(err3){
                    if(err3){
                        return callback("删除评论失败！",0);
                    }
                    beReplyedIdArr.push(commentid);
                    var query = {
                        '$or':[
                            {"_id":{"$in":beReplyedIdArr}},
                            {"replyTo":commentid},
                        ]
                    };
                    CommentModel.update(query,{$set:{'is_deleted':true}},{multi:true},function(err4){
                        if(err4){
                            return callback("删除评论失败！",0);
                        }

                        return callback("删除评论成功！",2);
                    });
                });
            });
        }
    });
};