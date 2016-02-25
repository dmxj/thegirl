var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CitySchema = new Schema({
    name:{type:String,default:'',trim:true},
    isProvince:{type:Boolean,default:false},    //是否是省
    isCity:{type:Boolean,default:false},    //是否是市
    isDistinct:{type:Boolean,default:false},    //是否是区
    isCounty:{type:Boolean,default:false},    //是否是县
    create_at:{type:Date,default:Date.now},
    update_at:{type:Date,default:Date.now},
},{collection:'citys'});

CitySchema.methods = {};
CitySchema.statics = {};

module.exports = mongoose.model('City',CitySchema);