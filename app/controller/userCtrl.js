var validator      = require('validator');
var UserModel = require('../models/user');
var UserProxy = require('../proxy/user');
var checkService = require('../services/check');

//用户模块的主页，显示所有用户列表
exports.index = function(req,res,next){
    var searchType = req.query.type;
    var keyword = req.query.q;
    var query = {};
    if(keyword){
        if(searchType == "school"){
            query["school.schoolname"] = new RegExp(keyword);
        }else{
            query["username"] = new RegExp(keyword);
        }
    }

    var params = {};
    checkService.checkIsLogin(req,function(user){
        if(user && !query.hasOwnProperty('school.schoolname')){   //如果用户已经登录，而且不是搜索学校的情况下
            query["school"] = user.school;
            params["master"] = user;
        }else{
            params["master"] = null;
        }

        UserProxy.divderPageGetUsers(1,20,query,{order:{visitCount:-1}},function(err,users){
            if(err || !users) {
                params["users"] = null;
            }else{
                params["users"] = users;
            }
            console.log('user query error:'+err);
            console.log('users query result:'+users.length);
            return res.render200("user/index",params);
        });
    });
};

//进入某人的个人空间
exports.userSpace = function(req,res,next){
    var userid = req.params.uid;
    if(!userid){
        return res.redirect('/users');
    }
    checkService.checkIsLogin(req,function(master){
        if(master && master.id == userid){ //如果用户已经登录，而且现在访问的用户的id是自己的id
            return res.redirect('/myspace');
        }

        UserProxy.getUserByIdSavely(userid,function(user){
            if(!user){
                return res.renderError("该用户不存在",404);
            }
            var followed = master ? user.isFollowedBy(master.id) : false;
            return res.render200("user/home",{user:user,followed:followed});
        });
    });
};

//进入自己的个人空间
exports.mySpace = function(req,res,next){
    checkService.checkIsLogin(req,function(user){
        if(!user){
            return res.redirect('/login');
        }

        UserProxy.getUserById(user.id,function(err,master){
            if(err || !master){
                return res.renderError("发生错误，请重新登录",404);
            }
            return res.render200("user/space",{user:master});
        });

    });
};

//Ajax分页获取用户的店铺（公开）
exports.ajaxGetStore = function(req,res,next){

};
//Ajax分页获取用户的所有商品（公开）
exports.ajaxGetGood = function(req,res,next){

};
//Ajax分页获取用户发布的Topic话题（公开）
exports.ajaxGetTopic = function(req,res,next){

};
//Ajax分页获取用户的求购（公开）
exports.ajaxGetAskbuy = function(req,res,next){

};

//Ajax分页获取用户的订单（私人）
exports.ajaxGetOrder = function(req,res,next){

};
//Ajax分页获取用户的评论留言等（私人）
exports.ajaxGetComment = function(req,res,next){

};


//找回密码页面
exports.showFindBackPass = function(req, res, next){

};
//找回密码提交
exports.findBackPass = function(req, res, next){

};

//修改密码
exports.showModifyPass = function(req, res, next){

};
//修改密码提交
exports.modifyPass = function(req, res, next){

};

//查看个人资料
exports.showProfile = function(req, res, next){

};
//修改个人资料
exports.editProfile = function(req, res, next){

};

/**
 * 上传头像，如果是新注册用户上传头像，则先将上传后的头像URL放在session中；
 * 如果是已注册用户上传头像则直接更改数据库
 * @param req
 * @param res
 * @param next
 */
exports.postAvatar = function(req, res, next){

};