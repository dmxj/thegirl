var myHash = require('../helper/myHash');

exports.encryptPwd = function(Pwd){
	return myHash.sha1(myHash.md5(Pwd));
};