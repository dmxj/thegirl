// passport设置
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Account = require('../app/models/user');

passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());
passport.use(new LocalStrategy({ usernameField: 'uname' },function(username, password, done) {
	Account._authenticate(username, password, done);
}));

module.exports = passport;