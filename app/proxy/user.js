var EventProxy = require('eventproxy');
var models = require('../models');
var UserModel = models.User;

exports.getUserById = function (id, callback)
{
	callback(null,'这个是查询id = '+id+'得到的用户。');
};