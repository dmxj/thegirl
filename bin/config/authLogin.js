var join = require('path').join;
var conf = require('./config');
var auth = require(join(conf.root,'app/middleware/auth'));

var noLoginPath = ['','demo'];
var needLogin = function(path){
    for(var i=0;i<noLoginPath.length;i++){
        var item = noLoginPath[i];
        if(path == item){
            return false;   //不需要登录
        }
    }
    return true;
};
/**
 * 登录中间件
 * @param app
 */
module.exports = function(app) {
    app.use(function(req,res,next){
        var path = req.originalUrl;
        if(needLogin(path)){
            if(!auth.passAuth(req)){    //没通过验证，就跳转到登录
                return res.redirect('/login');
            }
        }
        next();
    });
}
