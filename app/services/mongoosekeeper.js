'use strict';

var mongoose = require('mongoose');
var util = require("util");
var conf = require('../../bin/config/config'),
    conf_db = conf.db;

function MongooseKeeper() {
    this.db = mongoose.createConnection();
    this.open_count = 0;
}

MongooseKeeper.prototype.init = function() {
    var options = {
        db: { native_parser: true },
        server: { poolSize: 5 },
        user: conf_db.db_author,
        pass: conf_db.db_pwd
    };


    var constr = "";
    if(process.env.MONGO_DB_STR){
        constr = process.env.MONGO_DB_STR ;
    }
    else{
        //'mongodb://user:pass[@localhost](/user/localhost):port/database'
        constr = util.format("mongodb://%s:%s@%s:%s/%s",conf_db.db_author,conf_db.db_pwd,conf_db.db_host,conf_db.db_port,conf_db.db_name);
    }
    this.dbUri = constr;
    this.options = options;
  
}

MongooseKeeper.prototype.open =function() {

    this.open_count++;
    if(this.open_count ==1 && this.db.readyState == 0)
    {        
        this.db.open(this.dbUri,this.options,function() {
            console.log("数据库已经成功打开...");
        });
    }
}
MongooseKeeper.prototype.close =function() {

    this.open_count--;
    if(this.open_count == 0 )
    {
        this.db.close(function(){
            console.log("数据库已经关闭...");
        });
    }
  
}


MongooseKeeper.prototype.use = function(action,callback) {
    //OPEN
    var self = this;
    self.open();
    action.call(null,function() {
        //CLOSE
        console.log("正在访问的数据库请求量"+self.open_count);
        self.close();
        callback.apply(null, arguments);
        //DONE
        self = null;
    })
};

exports = module.exports = new MongooseKeeper();