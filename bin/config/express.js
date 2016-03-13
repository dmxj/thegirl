var express = require('express');
var favicon = require('serve-favicon');
var path = require('path');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('express-flash');
var bodyParser = require('body-parser');
var csrf = require('csurf');
var swig = require('swig');
var conf = require('./config');
var resMethodMiddleware = require(path.join(conf.root,'app/middleware/res_method'));
var errorPageMiddleware = require(path.join(conf.root,'app/middleware/error_page'));
var RedisStore = require('connect-redis')(session);
var checkService = require(path.join(conf.root,'app/services/check'));

var env = process.env.NODE_ENV || 'development';

module.exports = function(app){

    // Swig templating engine settings
    //if (env === 'development' || env === 'test') {
    //    swig.setDefaults({
    //        cache: false
    //    });
    //}

    //路径与使用view模版为html
    app.set('views', conf.views_dir);
    app.set('view engine', 'html');
    //app.engine('html', swig.renderFile);
    app.engine('.html', require('ejs').__express);


    // 设置中间件
    app.use(favicon(path.join(conf.root, 'public', 'favicon.ico')));
    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(session({
        resave: true,
        saveUninitialized: true,
        secret:"zhangmebglei,can you marry me?",
        cookie:{
            maxAge:1000*60*60,
        },
        //store: new RedisStore({
        //    port: conf.redis.redis_port,
        //    host: conf.redis.redis_host,
        //})
    }));

    app.use(flash());
    //设置静态资源路径
    app.use(express.static(path.join(conf.root, 'public')));
    app.use('/upload',express.static(path.join(conf.root, 'asset')));
    app.use('/hm',express.static(path.join(conf.root, 'app/html')));

    //if (env !== 'test') {
    //    app.use(function (req, res, next) {
    //            csrf()(req, res, next);
    //            res.locals.csrf = req.csrfToken ? req.csrfToken() : '';
    //            next();
    //    });
    //}

    app.use(function(req,res,next){ //如果用户已登录，res.locals赋值用户信息
        req.session._garbage = Date();
        req.session.touch();
        if(!req.session){
            console.log("redis 连接失败，无法启用session...");
        }else{
            console.log("redis 连接成功！session id："+req.session.id);
        }
        checkService.checkIsLogin(req,function(user){
            if(user){   //已登录
                res.locals.myuid = user.id;
                res.locals.myuname = user.name;
            }else{  //没登录
                res.locals.myuid = null;
                res.locals.myuname = null;
                if(req.originalUrl != '/login'){
                    res.locals.lastUrl = req.originalUrl;
                }
            }
            return next();
        });
    });
    app.use(resMethodMiddleware.ResMethod);
    app.use(errorPageMiddleware.errorPage);
}
