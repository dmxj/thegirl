var path = require('path');
var crypto = require('crypto');

var root = path.join(__dirname, '../..');

module.exports = {

	info:{
		appname:'thegirl',
		author:'任思可',
		description: '大学生购物社交网站',
		motto:'生活就是一场交易',
  		keywords: 'rensike love zhangmenglei',
	},

	db:{
		db_host:'mongo.duapp.com',
		db_port:8908,
		db_name:'lTOFNhqRLSHUYTQTGmth',
		db_author:'bb5129c083d0419296919a2aeee6b4d1',
		db_pwd:'7437193892d643b585aca6f656439e67'
	},

	redis:{
		redis_host: '127.0.0.1',
		redis_port: 6379,
		redis_db: 0,
	},

	root:root,
	views_dir:path.join(root, 'app/views'),
	router_dir:path.join(root, 'app/routes'),
	
	upload_default_dir:path.join(root, 'upload/default'),
	upload_goods_dir:path.join(root, 'upload/goods'),

	session_token:crypto.createHash('sha1').update('leilei_cr7').digest(),
	session_key:'youaremyworld',
	
};