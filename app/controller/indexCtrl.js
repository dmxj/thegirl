//var UserModel = require('../models/user'),
//    GoodModel = require('../models/good'),
//    StoreModel = require('../models/store'),
//    TopicModel = require('../models/topic'),
//    CommentModel = require('../models/comment'),
//    TopicCommentModel = require('../models/topicComment'),
//    CreditModel = require('../models/credit');

var Models = require('../models');
var UserModel = Models.User,
    GoodModel = Models.Good,
    StoreModel = Models.Store,
    TopicModel = Models.Topic;
var UserProxy = require('../proxy/user'),
    GoodProxy = require('../proxy/good'),
    StoreProxy = require('../proxy/store'),
    TopicProxy = require('../proxy/topic');

var async = require('async');

//俗称互联网首页！！！！！
//展示热门话题
//展示热门店铺

//主要区域：展示商品
exports.index = function(req,res,next){
    console.log("主页session.userid:"+req.session.userid);
    console.log("主页session.username:"+req.session.username);
    var params = {};
    async.waterfall([
        function(callback){ //1、先获取热门话题
            TopicProxy.getHotTopic(10,function(err,topics){
                if(err) return callback(err,err);
                params.topics = topics;
                callback(null,null);
            });
        },
        function(data,callback){ //2、获取热门店铺
            StoreProxy.getHotStore(10,function(err,stores){
                if(err) return callback(err,err);
                params.stores = stores;
                callback(null,null);
            });
        },
        function(data,callback){  //2、获取第一页商品
            GoodProxy.divderPageGetGoods(1,30,{},{},function(err,goods){
                if(err) return callback(err,err);
                params.goods = goods;
                callback(null,null);
            });
        }
    ],function(err,results){
        if(results){    //说明有错
            return res.renderError(results,500);
        }

        return res.render200('index',params);
    });
};