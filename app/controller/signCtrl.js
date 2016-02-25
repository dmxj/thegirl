var validator      = require('validator');
var checkService = require('../services/check');
var emailService = require('../services/email');
var UserModel = require('../models/user');
var UserProxy = require('../proxy/user');

//登录页面
exports.showLogin = function(req, res, next){
    //req.session.destory(); 销毁所有的session
    res.render200("sign/login",{title:'校园集市——登录'});
};
//提交登录
exports.login = function(req, res, next){
    var username = req.body.username;
    var userpwd  = req.body.userpwd;
    var redirectUrl = req.body.location;
    var backdata = {code:0,msg:'',redirectUrl:''};
    if(!username){
        backdata.msg = "用户名不能为空";
        return res.json(backdata);
    }
    if(!userpwd){
        backdata.msg = "密码错误";
        return res.json(backdata);
    }
    checkService.checkUser(username,userpwd,function(err,user){
        console.log("登录校验。。。");
        if(err){
            console.log("登录失败。。。");
            console.log(err);
            backdata.msg = err;
        }else{
            console.log("登录成功。。。");
            backdata.code = 1;
            backdata.msg = '登录成功';
            backdata.redirectUrl = redirectUrl ? redirectUrl : '/';

            req.app.locals.uid = user._id;
            res.locals.myuid = user._id;
            res.locals.myuname = user.username;

            req.session.userid = user._id;
            req.session.username = user.username;
            console.log("设置session.userid:"+req.session.userid);
            console.log("设置session.username:"+req.session.username);
        }

        return res.json(backdata);
    });
};

//注册页面
exports.showRegister = function(req, res, next){
    res.render200("sign/register",{title:'校园集市——注册'});
};


//提交注册
exports.register = function(req, res, next){
    var email = req.body.email;
    var username = req.body.username;
    var userpwd  = req.body.userpwd;
    var userrepwd = req.body.userrepwd;
    var usergender = req.body.usergender;   //性别
    var telphone = req.body.telphone;
    var phone_checkcode = req.body.phone_checkcode;
    var school = req.body.school;
    var checkcode = req.body.registercheckcode;
    var isRegByMail = req.body.isRegByMail == "1";
    console.log("isRegByMail:"+isRegByMail);
    var backdata = {code:0,msg:'',redirectUrl:''};
    var newuser = new UserModel();
    if(isRegByMail && !email){
        backdata.msg = "邮箱不能为空";
        return res.json(backdata);
    }
    if(isRegByMail && !validator.isEmail(email)){
        backdata.msg = "邮箱格式有误";
        return res.json(backdata);
    }
    if(!username){
        backdata.msg = "用户名不能为空";
        return res.json(backdata);
    }
    if(!userpwd){
        backdata.msg = "密码不能为空";
        return res.json(backdata);
    }
    if(userpwd.length < 6 || userpwd.length > 20){
        backdata.msg = "密码长度必须在6~20之间";
        return res.json(backdata);
    }
    if(userpwd !== userrepwd){
        backdata.msg = "两次密码输入不一致";
        return res.json(backdata);
    }
    if(!isRegByMail && !telphone){
        backdata.msg = "手机号码不能为空";
        return res.json(backdata);
    }
    if(!isRegByMail && validator.isMobilePhone(telphone)){
        backdata.msg = "手机号码格式有误";
        return res.json(backdata);
    }
    if(!isRegByMail && !phone_checkcode){
        backdata.msg = "请输入手机号码验证码";
        return res.json(backdata);
    }
    if(!isRegByMail && !checkService.checkTelphoneCode()){
        backdata.msg = "手机号码验证码输入有误";
        return res.json(backdata);
    }
    if(!school){
        backdata.msg = "学校不能为空";
        return res.json(backdata);
    }

    //验证school id的有效性
    //以下在异步回调中执行

    if(!checkcode){
        backdata.msg = "验证码不能为空";
        return res.json(backdata);
    }
    if(isRegByMail){
        newuser.email = email;
        newuser.confirm = true;
    }else{
        newuser.telphone = telphone;
        newuser.confirm = true;
    }


    newuser.username = username;
    newuser.gender = usergender == '1' ? true : false;
    newuser.school = school;

    console.log(require('util').inspect(newuser));
    UserProxy.newAndSaveUser(newuser,userpwd,function(err){
        if(err){
            backdata.msg = err;
            return res.json(backdata);
        }
        //注册成功
        backdata.code = 1;
        if (isRegByMail) {
            backdata.redirectUrl = '/regsuccess';
        } else {
            backdata.redirectUrl = '/regsuccess';
        }

        return res.json(backdata);
    });

};
//注销退出
exports.logout = function(req, res, next){
    res.locals.myuid = null;
    res.locals.myname = null;
    req.app.locals.uid = null;
    delete req.session.userid;
    delete req.session.username;
    req.session.destory(function(){
       return res.redirect('/login');
    });
};

//注册成功
exports.regsuccess = function(req,res,next){
    //if(req.session.regway == "email"){
    //    var email = req.session.email;
    //    if(email){
    //        return res.render200("/sign/regsuccess",{email:email,mailsite:"http://mail.qq.com"});
    //    }
    //}else if(req.session.regway == "phone"){
    //    if(req.session.phonenumer){
    //        return res.render200("/sign/regsuccess",{phonenumber:req.session.phonenumer});
    //    }
    //}
    return res.redirect('/login');
};
