var ShopCartModel = require('../models/shopCart');
var ShopCartProxy = require('../proxy/shopCart');

//获取某人购物车数量
exports.fetchShopCartNumber = function(req,res,next)
{
	var uid = req.app.locals.uid;
	if(!uid){
		return res.json({msg:'',code:0});
	}

	ShopCartProxy.fetchShopCartNumByUid(uid,function(amount){
		return res.json({msg:amount,code:2});
	});
};