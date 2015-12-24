var mongoose = require('mongoose');
var mogokeeper = require('../services/mongoosekeeper');

//如果数据库未打开
if(mogokeeper.db.readyState !== 1){
	mogokeeper.init();
	mogokeeper.open();
}

// mongoose.connect(config.db, {
//   server: {poolSize: 20}
// }, function (err) {
//   if (err) {
//     logger.error('connect to %s error: ', config.db, err.message);
//     process.exit(1);
//   }
// });


exports.User         = require('./user');
exports.Shop        = require('./shop');
