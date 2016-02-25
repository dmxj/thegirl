var mongoose = require('mongoose');
var mogokeeper = require('../services/mongoosekeeper');

//mongoose.connect('mongodb://bb5129c083d0419296919a2aeee6b4d1:7437193892d643b585aca6f656439e67@mongo.duapp.com:8908/lTOFNhqRLSHUYTQTGmth');
var Schema = mongoose.Schema;
var encrypt = require('../services/encrypt');

var Account = new Schema({
    username: String,
    password: String,
    email:String,
    school:String,
},{safe:true});


var hello = function(err,fuck){
	err = '我是错误..';
	fuck = '我爱中国！';
}

Account.statics._authenticate = function(username, password, done) {
  //实现用户名或邮箱登录
  //这里判断提交上的username是否含有@，来决定查询的字段是哪一个
  // var criteria = (String(username).indexOf('@') === -1) ? {username: username} : {email: username};
  // this.model('account').findOne(criteria, function(err, user) {
  //   if (!user) return done(null, false, { message: '用户名或邮箱 ' + username + ' 不存在'});
  //   if(encrypt.encryptPwd(password) != user.password){
  //   	return done(null, false, { message: '密码不匹配' });
  //   }else{
  //   	return done(null, user);
  //   }
  // });
	console.log('密码不匹配');
	return done(null, false, '密码不匹配');
};
Account.methods.Register = function(done){
	// var timeout = setTimeout(function() {
	//   return done(null, false, { message: '操作超时！'});
	// }, 5000);
	//mongodb未连接！
	mogokeeper.use(hello,function(err,fuck){
		console.log('mogokeeper.use:error:'+err);
		console.log('mogokeeper.use:fuck:'+fuck);
	});
	if (mogokeeper.db.readyState !== 1) {
    	return done(500, false, { message: '数据库未连接'});
  	}
	if(this.password.length>20||this.password.length<6)
		return done(null, false, { message: '密码需在6-20个字符之间'});
	this.model('account').findOne({email:this.email},function(err,user){
		if(user) return done(null, false, { message: '邮箱已被注册...'});
		this.model('account').findOne({username:this.username},function(err,user){
			if(user) return done(null, false, { message: '用户名已存在...'});
			this.save(function(err,user){
				if(err){
					console.log('保存失败：'+err);
					return done(err, false, { message: '注册用户失败'});
				}
				return done(null, user, { message: '注册用户成功！'});
			});
		});
	});
}

var User = mogokeeper.db.model('account', Account);

module.exports = User;