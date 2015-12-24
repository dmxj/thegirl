var path = require('path');
var crypto = require('crypto');

module.exports = {
	info:{
		appname:'thegirl',
		author:'任思可',
	},
	db:{
		db_host:'mongo.duapp.com',
		db_port:8908,
		db_name:'lTOFNhqRLSHUYTQTGmth',
		db_author:'bb5129c083d0419296919a2aeee6b4d1',
		db_pwd:'7437193892d643b585aca6f656439e67'
	},
	views_dir:path.join(__dirname, '../app/views'),
	router_dir:path.join(__dirname, '../app/routes'),
	session_token:crypto.createHash('sha1').update('leilei_cr7').digest(),
	session_key:'youaremyworld',
	upload_default_dir:path.join(__dirname, '../upload/default'),
	upload_goods_dir:path.join(__dirname, '../upload/goods'),
};