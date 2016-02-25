var express = require('express');
var mongoose = require('mongoose');
var open = require('./bin/open');
var join = require('path').join;
var conf = require('./bin/config/config');
//var mongoosekeeper = require('./app/services/mongoosekeeper');
//
//mongoosekeeper.init();

var app = express();
require('./bin/config/express')(app);
require('./bin/config/authLogin')(app);
require('./bin/config/routes')(app);

connect()
    .on('error', function(err){
      console.log("error:"+err);
      process.exit(1);
    })
    .on('disconnected', connect)
    .once('open', function(){
      open(app);
    });

function connect () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  return mongoose.connect("mongodb://127.0.0.1/thegirl", options).connection;
}

console.log('run app.js...');
module.exports = app;
