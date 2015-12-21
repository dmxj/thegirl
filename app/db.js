var mongoose = require('mongoose');
var conf = require('../bin/config');
mongoose.connect("mongodb://"+conf.db.host+"/"+conf.db.database);

var db = mongoose.connection;
db.on('error',function(){
	console.log('connect db error');
});

module.exports = db;

