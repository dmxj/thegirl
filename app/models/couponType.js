var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');

/**
 * 店铺优惠券类型，满减、打折、送积分、送抽奖
 */
var CouponTypeSchema = new Schema({
    name:{type:String,default:'',trim:true},    //名称
    needParams:[{type:String,default:'',trim:true}],    //需要用到的参数
    create_at:{type:Date,default:Date.now},
},{collection:'coupontypes'});

CouponTypeSchema.methods = {};

CouponTypeSchema.statics = {
    finds:function(callback){
        this.find({})
            .exec(function(err,types){
                if(err || !types || types.length <= 0){
                    return callback([]);
                }

                var results = [];
                for(var i in types){
                    results.push([types[i]._id,types[i].name,types[i].needParams]);
                }
                return callback(results);
            })
    }
};

module.exports = mongoose.model('CouponType',CouponTypeSchema);
