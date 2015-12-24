var EventProxy = require('eventproxy');
var models = require('../models');
var ShopModel = models.Shop;

exports.getShopById = function (id, callback)
{
	callback(null,'这个是查询id = '+id+'得到的结果。');
};