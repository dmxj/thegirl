var ShopCartModel = require('../models/shopCart');
var GoodModel = require('../models/good');

//获取某人购物车的数量
exports.fetchShopCartNumByUid = function(uid,callback){
    ShopCartModel.count({author:uid},function(err,total){
        if(err){
            return callback(0);
        }

        return callback(total);
    });
};

//将某商品加入购物车
exports.addGoodToCart = function(uid,goodid,choice,num,callback){
    if(!uid){
       return callback("请您登录后再进行操作");
    }

    GoodModel.find({_id:goodid,inSell:true,inUse:true,is_valid:true},function(err,good){
        if(err || !good){
            return callback("未找到对应商品");
        }

        ShopCartModel.find({author:uid,good:goodid},function(err1,shopCart){
            if(err1){
                return callback("服务器错误...");
            }

            if(!shopCart){  //如果购物车中没有该商品
                var newCart = new ShopCartModel();
                newCart.good = goodid;
                newCart.info.push({quantity:num,choice:choice});
                shopCart = newCart;
            }else{  //如果购物车有该商品
                var same = false;
                shopCart.info.length > 0 && shopCart.info.forEach(function(item,index){
                    if(item.choice && item.choice == choice){
                        shopCart.info[index].quantity+=num;
                        same = true;
                        return false;
                    }
                });

                if(!same){
                    shopCart.info.push({quantity:num,choice:choice});
                }
            }

            shopCart.save(function(err2){
                if(err2 && err2.name == "RuleError"){
                    return callback(err2.message);
                }else if(err2){
                    return callback("加入购物车失败");
                }else{
                    return callback(null);
                }
            });
        });
    });
};


//将购物车中的商品删除
exports.deleteShopCart = function(uid,shopCartId,callback){
    if(!uid){
        return callback("请您登录后再进行操作");
    }
    ShopCartModel.remove({author:uid,_id:shopCartId},function(err){
        if(err){
            return callback("商品移除购物车失败");
        }

        return callback("商品移除购物车成功");
    });
};

//将购物车清空
exports.clearShopCart = function(uid,callback){
    if(!uid){
        return callback("请您登录后再进行操作");
    }
    ShopCartModel.remove({author:uid},function(err){
        if(err){
            return callback("购物车清空失败");
        }

        return callback("购物车清空成功");
    });
}