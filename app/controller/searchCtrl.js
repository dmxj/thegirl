var Models = require('../models');
    UserModel = Models.User,
    GoodModel = Models.Good,
    StoreModel = Models.Store,
    TopicModel = Models.Topic;
var UserProxy = require('../proxy/user'),
    GoodProxy = require('../proxy/good'),
    StoreProxy = require('../proxy/store'),
    TopicProxy = require('../proxy/topic');

var searchService = require('../services/search');

//主页搜索
exports.search = function(req,res,next){
    var type = req.query.type || 'good';
    var q = req.query.q;
    if(!q){
        return res.redirect('/');
    }

    var pattern = new RegExp(q);
    if(type == 'store'){ //店铺
        console.log('search store...');
        var query = {$or:[
            {storename:pattern},
            {describe:pattern}
        ]};
        StoreProxy.divderPageGetStores(1,30,query,{},function(err,stores){
            return res.render200("search/index",{stores:stores});
        });
    }else if(type == 'topic'){   //话题
        console.log('search topic...');
        var query = {$or:[
            {title:pattern},
            {content:pattern},
        ]};
        TopicProxy.divderPageGetStores(1,20,query,{},function(err,topics){
            console.log(topics);
            return res.render200("search/index",{topics:topics});
        });
    }else{  //商品东西
        console.log('search good...');
        var query = {$or:[
            {goodname:pattern},
        ]};
        GoodProxy.divderPageGetGoods(1,20,query,{},function(err,goods){
            return res.render200("search/index",{goods:goods});
        });
    }

};

//搜索用户，列表显示
exports.searchUser = function(req,res,next){

};
//搜索店铺，列表显示
exports.searchStore = function(req,res,next){

};
//搜索商品，列表显示
exports.searchGood = function(req,res,next){

};
