var crypto = require('crypto');

exports.md5 = function(str){
	return crypto.createHash('md5').update(str).digest();
};

exports.sha1 = function(str){
	return crypto.createHash('sha1').update(str).digest();
};

exports.sha256 = function(str){
	return crypto.createHash('sha256').update(str).digest();
};

exports.sha512 = function(str){
	return crypto.createHash('sha512').update(str).digest();
};