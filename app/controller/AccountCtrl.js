var user = require('../models/user2');

exports.login = function(req, res, next)
{
	//如果已经登录 和isUnauthenticated()相反
	if(req.isAuthenticated() && req.user){
		return this.loginout(req, res, next);
	}
	return res.status(200).render('user/login',{
				error:req.flash('error').toString(),
				success:req.flash('success').toString(),
			});
}
exports.loginPost = function(req, res, next)
{
	console.log('loginPost...');
	//路由中已经写了认证中间件，
	//只要执行到这说明认证成功，设置session即可
	// req.session.save(function (err) {
 //        if (err) {
 //            return next(err);
 //        }
 //        res.redirect('/');
 //    });
}
exports.loginout = function(req, res, next)
{
	req.logout();
    // req.session.save(function (err) {
    //     if (err) {
    //         return next(err);
    //     }
    //     return res.redirect('/user/login');
    // });
	return res.redirect('/user/login');
}
exports.register = function(req, res, next)
{
	return res.status(200).render('user/register',{
		error:req.flash('error').toString(),
		success:req.flash('success').toString(),
	});
}
exports.registerPost = function(req, res, next)
{
	var u = new user({
		username : req.body.uname,
		password: req.body.upwd,
	    email:req.body.uemail,
	    school:req.body.uschool,
	});
	u.Register(function(err,user,info){
		if (err || !user) {
		  req.flash('error',info.message);
          return res.redirect("/user/register");
        }
        req.flash('success',info.message);
        return res.redirect("/user/register");
	});
}

exports.space = function(req, res, next)
{
	if(!req.user) return res.redirect('/user/login');
	return res.render('user/space',{
		user:req.user,
		error:req.flash('error').toString(),
		success:req.flash('success').toString(),
	});
}