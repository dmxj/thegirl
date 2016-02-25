var EventProxy = require('eventproxy');
var GoodModel = require('../models/good');
var CommentModel = require('../models/comment');
var CommentType = require('../const/commentType');
var CommentProxy = require('../proxy/comment');
var ArrayHelper = require('../helper/myArray');
var ObjectHelper = require('../helper/myObject');
var util = require('util');

//分页获取商品
exports.divderPageGetGoods = function(index,perpage,query,option,callback){
    var _query = query || {};
    _query.inSell = true;
    _query.inUse = true;
    _query.is_valid = true;
    var _option = option || {};
    _option.sort = {score:-1};
    GoodModel.find(_query,'',_option)
        .skip((index-1)*perpage)
        .limit(perpage)
        .populate('boss store comments type scope')
        .exec(callback);
};

//根据id获取商品
exports.getGoodById = function(id,callback){
    GoodModel.findOne({_id:id}).populate('boss store comments type scope').exec(function(err,good){
        if(err || !good){
            return callback(err,good);
        }

        good.incrViewCount(function(){
            return callback(null,good);
        });
    });
}

//商品收藏者添加
//fanId用户收藏商品gid
exports.addFans = function(gid,fanUid,callback)
{
    GoodModel.findOne({_id:gid,inSell:true,inUse:true,is_valid:true},function(err,good){
        if(err || !good){
            return callback('no find good');
        }

        good.fans.indexOf(fanUid) < 0 && good.fans.push(fanUid);
        good.save(function(err2){
            if(err2){
                return callback(err2);
            }
            return callback(null);
        });
    });
};

//商品收藏者移除
exports.removeFans = function(gid,fanUid,callback)
{
    GoodModel.findOne({_id:gid,inSell:true,inUse:true,is_valid:true},function(err,good){
        if(err || !good){
            return callback('no find good');
        }

        good.fans = ArrayHelper.removeElement(good.fans,fanUid);
        good.save(function(err2){
            if(err2){
                return callback(err2);
            }

            return callback(null);
        });
    });
};

//查找某用户所有的不合法且未删除的商品
exports.findInvalidGoodByUid = function(uid,callback)
{
    GoodModel.find({boss:uid,inUse:true,is_valid:false},function(err,goods){
        if(err || !goods || goods.length <=0 ){
            return callback(null);
        }
        return callback(goods);
    });
};


//判断用户是否发布了指定数目及以上的合法商品
exports.findGoodTotalIsEnough = function(uid,total,callback)
{
    GoodModel.find({boss:uid,inUse:true,is_valid:true})
            .skip(total - 1)
            .exec(function(err,goods){
                if(err || !goods || goods.length <= 0){
                   return  callback(false);
                }
                return callback(true);
            })
};

//商品组是否包含对应条件的商品
exports.findGoodsIsHavaThe = function(goodArr,query,callback)
{
     if(!util.isArray(goodArr)){
        return callback("发生一些错误");
     }

     query = ObjectHelper.merge(query,{"_id":{"$in":beReplyedIdArr}});
     GoodModel.find(query,function(err,goods){
        if(err){
            return callback("发生一些错误");
        }

         if(!goods || goods.length <= 0){
             return callback(null);
         }

         return callback(true);
     });
};


//给商品发表评论
exports.postComment = function (uid,goodid,content,callback)
{
    CommentProxy.postComment(uid,content,goodid,CommentType.REPLY_GOOD,function(err,comment) {
        if(err){
            return callback(err,null);
        }
        return callback(null,comment);

        //GoodModel.findOne({_id:goodid,inSell:true,inUse:true,is_valid:true},function(err1,good){
        //    if(err1){
        //        return callback("未找到该商品",null);
        //    }
        //
        //    good.comments.push(comment._id);
        //    good.save(function(err2){
        //        if(err2){
        //            comment.remove(function(){
        //                return callback("评论发表失败，请稍后重试",null);
        //            })
        //        }
        //
        //        return callback(null,comment);
        //    });
        //});
    });
};


//获取商品的热门评论
//根据评论的总数判断是否显示热门评论或者热门评论的数量
exports.fetchHotGoodComments = function(goodid,callback)
{
    CommentModel.count({"good":goodid,"is_deleted":false},function(err,total){
        if(err || total < 30){
            return callback([]);
        }
        var num = 3;
        if(total > 100){
            num = 5;
        }
        CommentModel.find({"good":goodid,"is_deleted":false},'',{sort:{likeUser:-1}})
                    .limit(num)
                    .exec(function(err1,comments){
                        if(err1 || !comments){
                            return callback([]);
                        }
                        return callback(comments);
                    });
    });
};

//分页获取某商品的评论们
exports.divderPageGetGoodComments = function(uid,goodid,index,perpage,query,option,callback)
{
    var _query = query || {};
    _query.good = goodid;
    _query.is_deleted = false;
    var _option = option || {};
    _option.sort = {publish_time:-1};
    CommentModel.find(_query,'',_option)
        .skip((index-1)*perpage)
        .limit(perpage)
        .populate('author underList underList.author')
        .exec(function(err,comments){
            if(err || !comments || comments.length <= 0){
                return callback(null);
            }
            console.log('终于查到了评论！');
            comments = comments.map(function(item){
               return item.change(uid);
            });
            return callback(comments);
        });
};

//获取评论的总数
exports.getGoodCommentsNumber = function(goodid,query,callback){
    var _query = query || {};
    _query.good = goodid;
    _query.is_deleted = false;
    CommentModel.count(_query,function(err,total){
        if(err || !total){
            return callback(0);
        }

        return callback(total);
    });
};