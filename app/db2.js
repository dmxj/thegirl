var mongoose = require('mongoose');
var util = require('util');
var conf = require('../bin/config/config'),
	conf_db = conf.db;

var db = mongoose.createConnection();

//var url = util.format("mongodb://%s:%s@%s:%s/%s",conf_db.db_author,conf_db.db_pwd,conf_db.db_host,conf_db.db_port,conf_db.db_name);
var options = {
	db: { native_parser: true },
    server: { poolSize: 5 },
    user: conf_db.db_author,
    pass: conf_db.db_pwd
};

// mongoose.connect('mongodb://bb5129c083d0419296919a2aeee6b4d1:7437193892d643b585aca6f656439e67@mongo.duapp.com:8908/lTOFNhqRLSHUYTQTGmth');

// var db = mongoose.connection;
// db.on('error',function(err){
// 	console.log('connect db error:'+err);
// });

db.open(conf_db.db_host, conf_db.db_name, conf_db.db_port, options);

//监听BAE mongodb异常后关闭闲置连接
db.on('error', function (err) {
   console.log('数据库连接错误：'+err);
   db.close();
});

//监听db close event并重新连接
db.on('close', function () {
	console.log('数据库重新连接...');
    db.open(config.db_host, config.db_name, config.db_port, options);
});

module.exports = db;

