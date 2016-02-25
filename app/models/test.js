var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TestSchema = new Schema({
    name:{type:String,trim:true,default:''},
    pwd: {type:String,trim:true,default:'',validate:
    [{
        validator:function(v){
            console.log('pwd length:'+ v.length+"="+v);
            return v.length > 6;
        },
        message:'pwd {VALUE} too short'
    },
    {
        validator:function(v){
            console.log('pwd length:'+ v.length+"="+v);
            return v.length < 20;
        },
        message:'pwd {VALUE} too long'
    }]
    },
},{safe:true});

TestSchema.virtual('sike').get(function(){
    return this.name + this.pwd;
}).set(function(sike){
    this.name = this.pwd = sike+"-123";
});
TestSchema.path('name').unique(true,'name cant be the same');
//TestSchema.path('pwd').validate(function(pwd){
//    return pwd.length>6 && pwd.length<20;
//},'password must long than 6,and short than 20');
TestSchema.pre('save',function(next){
    if(this.name.indexOf('ke') < 0){
        var err = new Error("your name must container 'ke'");
        err.name="noke";
        next(err);
    }else{
        next();
    }
});


TestSchema.plugin(require('./baseModel'));
//require('./baseModel')(TestSchema);

TestSchema.methods = {
    saveNew:function(test){
        this.name = test.name;
        this.pwd = test.pwd;
        return this.save();
    },
    find:function(name,done){
      this.model('Test').findOne({name:name},function(err,user){
          if(user){
              done(user);
          }else{
              done("no users");
          }
      });
    },
    update:function(_id,test){
        this.model('Test').update({_id:_id},test,{upsert:false},function(err){
            if(err) console.log("update failed"+err);
            else console.log("update ok");
        });
    },
    list:function(done){
        this.model('Test').find({},function(err,users){
            if(users){
                done(users);
            }else{
                done('no one users');
            }
        });
    },
    //saves : function(done){
    //    return this.model('Test').save(function(err){
    //        if(err){
    //            console.log('save error:'+util.inspect(err));
    //            var errorMsg = err.errors ? subErrMsg(err.errors.toString()) :err.message;
    //            done(errorMsg);
    //        }else{
    //            done(null);
    //        }
    //    });
    //}
};

TestSchema.statics = {

};


var testModel = mongoose.model('Test',TestSchema);
module.exports = testModel;
