var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//二手集合
var SecondSchema = new Schema({
    goodId:{type:Schema.Types.ObjectId,ref:'Good'},  //对应的商品
    newPercent:{type:Number,enum:[1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9,9.5,10],default:10},  //新旧程度
    secondHandIllustration:{type:String,trim:true,default:''},   //二手说明
    create_time:{type:Date,default:Date.now},
    last_update_time:{type:Date,default:Date.now}
},{collection:'secondhands'});

SecondSchema.methods = {};
SecondSchema.statics = {};

module.exports = mongoose.model('SecondHand',SecondSchema);
