var EventProxy = require('eventproxy');
var UserModel = require('../models/user');
var FollowModel = require('../models/follow');
var TimeHelper = require('../helper/myTime');
var ArrayHelper = require('../helper/myArray');
var emailService = require('../services/email');

//根据ID获取一个用户
exports.getUserById = function (id, callback)
{
	if (!id) {
		return callback('id is empty',null);
	}
	UserModel.myFindOne({_id: id,confirm:true}, {},callback);
};

//安全的获取一个用户，只获取基本信息
exports.getUserByIdSavely = function (id, callback) {
	if (!id) {
		return callback(null);
	}
	UserModel.findOne({_id: id, confirm: true})
		.populate("emotion_state school education albums follow.users follow.goods follow.stores follow.topics fans")
		.exec(function(err,user){
			if(err || !user){
				return callback(null);
			}

			delete user.hashed_password;
			delete user.salt;
			delete user.randomKey;
			delete user.stores;
			delete user.goods;
			delete user.topics;

			return callback(user);
		});
}

//根据用户名查找一个用户
exports.getUserByName = function(username,callback)
{
	if(!username){
		return callback('username is empty',null);
	}
	UserModel.myFindOne({username:username,confirm:true},{},callback);
}
//根据邮箱查找一个用户
exports.getUserByEmail = function (email, callback) {
	if(!email){
		return callback('email is empty',null);
	}
	UserModel.myFindOne({email: email}, {},callback);
};
//根据邮箱以及通过验证查找复合条件的用户
exports.getUserByEmailAndConfirm = function (email, callback) {
	if(!email){
		return callback('email is empty',null);
	}
	UserModel.myFindOne({email: email,confirm:true}, {},callback);
};
//根据手机号查找一个用户
exports.getUserByPhone = function (phone, callback) {
	if(!phone){
		return callback('telphone is empty',null);
	}
	UserModel.myFindOne({telphone: phone,confirm:true},{}, callback);
};

//根据学校ID查找用户组
exports.getUsersBySchool = function (school,opt,callback){
	UserModel.myFind({school: school,confirm:true}, opt || {},callback);
}

//根据学校ID和性别查找用户
exports.getUsersBySchoolAndGender = function (school,gender,callback){
	UserModel.myFind({school: school,gender:gender,confirm:true}, {},callback);
}

//根据查询条件获取一组用户
exports.getUsersByQuery = function (query, opt, callback) {
	var _query = merge(query,{confirm:true});
	UserModel.myFind(_query, opt || {}, callback);
};

//分页获取用户
exports.divderPageGetUsers = function(index,perpage,query,option,callback)
{
	var _query = merge(query,{confirm:true});
	var _option = merge(option,{limit:perpage,skip:(index-1)*perpage});
	exports.getUsersByQuery(_query,_option,callback);
};

//保存新用户
exports.newAndSaveUser = function(userInstance,userpwd,callback){
	if(!userInstance) return callback('用户信息为空');
	userInstance.password = userpwd;
	if(userInstance.email){	//通过邮箱注册
		exports.getUserByEmail(userInstance.email,function(err,user){
			if(err) return callback('出现错误，注册失败，请稍后重试');
			if(user && user.confirm){	//已经存在有效用户
				return callback("该邮箱已被注册，请更换邮箱");
			}

			if(!emailService.sendRegEmailConfirm(userInstance.email)){
				return callback("邮件发送失败，请过一会儿重试！");
			}

			if(user){	//用户没有确认邮箱
				user.email = userInstance.email;
				user.username = userInstance.username;
				user.password = userpwd;
				user.gender = userInstance.gender;
				user.school = userInstance.school;

				user.save(function(err){
					if(err) return callback('出现错误，注册失败，请稍后重试');
					return callback(null);
				});
			}else{	//新的邮箱
				userInstance.save(function(err){
					if(err) return callback('出现错误，注册失败，请稍后重试'+ err);
					return callback(null);
				});
			}
		});
	}else{	//通过手机号注册
		exports.getUserByPhone(userInstance.telphone,function(err,user){
			if(err) return callback('出现错误，注册失败，请稍后重试'+err);
			if(user) return callback('对不起，该手机号已被注册，请更换手机号重新注册');
			userInstance.save(function(err){
				if(err) return callback('出现错误，注册失败，请稍后重试'+err);
				return callback(null);
			});
		});
	}
};


//用户关注者添加
//fanUid关注myUid
exports.addFans = function(myUid,fanUid,callback)
{
	UserModel.findOne({_id:myUid,confirm:true},function(err,user){
		if(err || !user){
			return callback('no find user');
		}

		user.fans.indexOf(fanUid) < 0 && user.fans.push(fanUid);
		user.followers.indexOf(followerUid) < 0 && user.followers.push(followerUid);
		user.save(function(err2){
			if(err2){
				return callback(err2);
			}
			return callback(null);
		});
	});
};

//用户关注者移除
exports.removeFans = function(myUid,fanUid,callback)
{
	UserModel.findOne({_id:myUid,confirm:true},function(err,user){
		if(err || !user){
			return callback('no find user');
		}

		user.fans = ArrayHelper.removeElement(user.fans,fanUid);
		user.save(function(err2){
			if(err2){
				return callback(err2);
			}

			return callback(null);
		});
	});
};

function merge(obj, defaults) {
	obj = obj || {};
	for (var key in defaults) {
		if (typeof obj[key] === 'undefined') {
			obj[key] = defaults[key];
		}
	}
	return obj;
}

function giveValue(obj,other){
	for(var key in other){
		obj[key] = other[key];
	}

	return obj;
}
