var shop = require('../model/shop');

exports.getMyShop = function(req, res, next)
{
	res.status(200).send(new shop().myshop());
}