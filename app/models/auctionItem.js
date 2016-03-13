var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');
var TimeHelper = require('../helper/myTime');

//拍卖记录集合，一旦进行拍卖，就不能进行删除
var AuctionItemSchema = new Schema({
    user:{type:Schema.Types.ObjectId,ref:'User'},  //用户
    bidPrice:{type:Number,default:0.0},    //出价
    bidCondition:{type:String,default:'',trim:true},    //出条件
    likeUser:[{type:Schema.Types.ObjectId,ref:'User'}], //赞的人
    create_at:{type:Date,default:Date.now}, //拍卖时间
},{collection:'auctionitems'});

var AuctionItemRule = {
    bidPrice:{
        min:0,
        ruleType:ruleType.NUMVAL,
        msg:"出价必须大于等于0元"
    },
    bidCondition:{
        min:1,
        max:80,
        ruleType:ruleType.STRLEN,
        msg:"出条件长度需在1~80个字符之间"
    }
};

AuctionItemSchema.virtual("likeCount")
            .get(function(){
               return this.likeUser.length;
            });

AuctionItemSchema.virtual('bidTime')
            .get(function(){
               return TimeHelper.formatDate(this.create_at,false)
            });

AuctionItemSchema.methods = {

};

AuctionItemSchema.statics = {

};

baseSchemaMethod.regBeforeSave(AuctionItemSchema,null,AuctionItemRule);

module.exports = mongoose.model('AuctionItem',AuctionItemSchema);