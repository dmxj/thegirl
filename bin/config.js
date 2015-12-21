var path = require('path');
var crypto = require('crypto');

module.exports = {
	info:{
		appname:'thegirl',
		author:'任思可',
	},
	db:{
		host:'localhost',
		port:27017,
		database:'thegirl',
	},
	views_dir:path.join(__dirname, '../app/views'),
	router_dir:path.join(__dirname, '../app/routes'),
	session_token:crypto.createHash('sha1').update('leilei_cr7').digest(),
};