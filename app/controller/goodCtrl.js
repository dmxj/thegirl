var GoodModel = require('../models/good');
var GoodProxy = require('../proxy/good');
var checkService = require('../services/check');

//商品模块主页,分页显示热门商品
exports.listGood = function(req, res, next){

};

//查看商品详情页面
exports.showGood = function(req, res, next){
    var goodid = req.params.goodid;
    goodid = goodid ? goodid.trim().toLowerCase() : null;

    if(goodid){    //
        GoodProxy.getGoodById(goodid,function(err,good){
            if(err || !good){
                return res.redirect("/");
            }

            //根据类型进行跳转：活动、拍卖、二手、任务
            if(good.activity){
                return res.redirect("/activity/"+good.activity);
            }
            if(good.auction){
                return res.redirect("/auction/"+good.auction);
            }
            if(good.task){
                return res.redirect("/task/"+good.task);
            }

            //只有店主拥有店铺才有资格下架，才有下架操作
            if(!good.inSell){   //商品被店主下架，暂时不卖
                return res.render200("good/nosell",{msg:"该商品已下架，暂时不出售"});
            }
            if(!good.inUse){    //商品被店主删除
                return res.render200("good/deleted",{msg:"该商品已被作者删除"});
            }
            if(!good.is_valid){ //商品违法
                return res.render200("good/invalid",{msg:"该商品违反规定"});
            }


            checkService.checkIsLogin(req,function(user){
                var isFollow = false;
                if(user){
                    isFollow = good.isFollowedBy(user.id);
                }
                return res.render200("good/home",{good:good,isFollow:isFollow,master:user});
            });
        });
    }else{  //直接跳转到店铺模块主页
        return res.redirect("/");
    }

};

//显示发布商品页面
exports.showPostGood = function(req, res, next){

};
//发布商品
exports.postGood = function(req, res, next){

};

//显示编辑商品页面
exports.showEditGood = function(req, res, next){

};
//编辑商品
exports.editGood = function(req, res, next){

};

//商品上架===AJAX
exports.putGoodInStore = function(req, res, next){

};
//商品下架===AJAX
exports.removeGoodOutStore = function(req, res, next){

};
//删除商品
exports.deleteGood = function(req, res, next){

};

//Ajax获取商品的评论们
exports.fetchGoodComment = function(req,res,next)
{

};
