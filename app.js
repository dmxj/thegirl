var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('express-flash');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var mongoosekeeper = require('./app/services/mongoosekeeper');

mongoosekeeper.init();

var conf = require('./bin/config');
//var ppSetting = require('./bin/ppSetting');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Account = require('./app/models/user');

// passport.serializeUser(Account.serializeUser());
// passport.deserializeUser(Account.deserializeUser());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Account.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy({ usernameField: 'uname' },function(username, password, done) {
  //Account._authenticate(username, password, done);
  console.log('密码不匹配');
  return done(null, false, '密码不匹配');
}));

var routerIndex = require(path.join(conf.router_dir, 'index'));
var routerAdmin =  require(path.join(conf.router_dir, 'routerAdmin'));

var app = express();

// view engine setup
app.set('views', conf.views_dir);
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
	resave: true,  
  saveUninitialized: true, 
	secret:"helloworld"
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use('/upload',express.static(path.join(__dirname, 'asset')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routerIndex);
app.use('/admin', routerAdmin);

// passport 设置
// var Account = require('./app/models/user');
// passport.use(new LocalStrategy(Account.authenticate()));
// passport.serializeUser(Account.serializeUser());
// passport.deserializeUser(Account.deserializeUser());

//连接数据库
//mongoose.connect('mongodb://mongo.duapp.com:8908/lTOFNhqRLSHUYTQTGmth');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
