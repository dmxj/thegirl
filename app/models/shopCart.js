var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');

//购物车集合
var ShopCartSchema = new Schema({
    author:{type:Schema.Types.ObjectId,ref:'User'},
    good:{type:Schema.Types.ObjectId,ref:'Good'},
    info:[{
        quantity:{type:Number,default:1},//商品数量
        choice:{type:String,trim:true}, //商品选择
    }],
    create_at:{type:Date,default:Date.now},
},{collection:'shopcarts'});

ShopCartSchema.methods = {};
ShopCartSchema.statics = {};

module.exports = mongoose.model('ShopCart',ShopCartSchema);