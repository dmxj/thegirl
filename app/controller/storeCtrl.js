var StoreModel = require('../models/store');
var StoreProxy = require('../proxy/store');
var checkService = require('../services/check');

//店铺模块的主页，分页显示所有的店铺
//如果用户已登录，则显示该用户所属学校的所有的店铺
//如果用户未登录，则显示全国所有的店铺
exports.index = function(req, res, next){
    var keyword = req.query.q;
    var sortby = req.query.sort;
    var page = req.query.page;
    keyword = keyword?keyword.trim().toLowerCase():null;
    sortby = sortby?sortby.trim().toLowerCase():"";
    page = page?Math.floor(parseInt(page.trim().toLowerCase())):1;
    var query = {};
    var option = {sort:{visitCount:-1}};
    if(keyword){
        query['$or'] = [
            {'storename':new RegExp(keyword)},
            {'describe':new RegExp(keyword)},
        ];
    }

    if(sortby == "score"){    //根据评分排序
        option.sort = {score:-1};
    }else if(sortby == "new"){  //根据创建日期排序，新的在前
        option.sort = {create_at:-1};
    }else if(sortby == "goodnum"){  //根据拥有的商品数排序
        option.sort = {goodCount:-1};
    }else{  //hot,默认按照热度排序
        option.sort = {hotlevel:-1};
    }

    var params = {keyword:keyword};
    checkService.checkIsLogin(req,function(user){
        if(user){   //登录了
            query["boss.school"] = user.school;
            params['master'] = user;
        }else{
            params['master'] = null;
        }

        var perpage = 2;
        StoreProxy.divderPageGetStores(page,perpage,query,option,function(stores,pageCount){
            params['stores'] = stores;
            params['pageCount'] = pageCount;
            //if(err || !stores || stores.length <= 0) {
            //    params['stores'] = null;
            //    params['pageCount'] = 0;
            //}else{
            //    params['stores'] = stores;
            //    params['pageCount'] = 0;
            //}
            return res.render200("store/index",params);
        });
    });
};

//查看店铺详情，某个店铺的主页
exports.showStore = function(req, res, next){
    var storeid = req.params.storeid;
    storeid = storeid ? storeid.trim().toLowerCase() : null;

    if(storeid){    //
        StoreProxy.getStoreById(storeid,function(err,store){
            if(err || !store){
                return res.redirect("/store");
            }
            if(!store.inuse){
                return res.render200("store/deleted",{msg:"该店铺已被作者删除"});
            }
            if(!store.is_valid){
                return res.render200("store/invalid",{msg:"该店铺因违反有关规定，不予以显示"});
            }
            return res.render200("store/home",{store:store});
        });
    }else{  //直接跳转到店铺模块主页
        return res.redirect("/store");
    }

};

//创建店铺
//创建之前验证：
//积分？
//用户必须已经发布了5个以上的商品 && 用户发布的商品中不合法的商品必须都已移除 && 用户创建的不合法的店铺必须都已移除
exports.createStore = function(req, res, next){

};


//移除店铺，置店铺不可用
exports.removeStore = function(req, res, next){
    StoreProxy.removeStoreById(req.app.locals.uid,req.body.sid,function(msg,code){
        return res.json({msg:msg,code:code});
    });
};



