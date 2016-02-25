var myTime = require('../helper/myTime');
var util = require('util');

var subErrMsg = function(errMsg){
  var subChar = 'ValidationError: ';
  return errMsg.substr(errMsg.indexOf(subChar)+subChar.length,errMsg.length).trim();
}

module.exports = function (schema) {
  schema.methods.create_at_ago = function () {
    return myTime.formatDate(this.create_at, true);
  };

  schema.methods.update_at_ago = function () {
    return myTime.formatDate(this.update_at, true);
  };

  //schema.pre('save',function(next){
  //  if(this.isNew){ //如果是新创建的
  //    this.create_at = Date.now();
  //  }
  //
  //  this.update_at = Date.noe();
  //
  //});

  //schema.methods.save = function(done){
  //  return this.model().save(function(err){
  //    if(err){
  //      console.log('save error:'+util.inspect(err));
  //      var errorMsg = err.errors ? subErrMsg(err.errors.toString()) :err.message;
  //      done(errorMsg);
  //    }else{
  //      done(null);
  //    }
  //  });
  //};
};