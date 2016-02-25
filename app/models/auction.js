var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//拍卖集合
var AuctionSchema = new Schema({
    goodId:{type:Schema.Types.ObjectId,ref:'Good'},  //对应的商品
    isAuction:{type:Boolean,default:false},  //是否在拍卖
    auctionStartPrice:{type:Number,default:0.0}, //拍卖起始价格
    auctionDateline:{type:Date,default:Date.now}, //拍卖截止日期
    auctionHandIllustration:{type:String,trim:true,default:''},   //拍卖说明
    //============公益拍卖=============
    donationOrg:{type:Schema.Types.ObjectId,ref:'DonationOrg'},  //捐献的组织
    donationLevel:{type:Number,default:0},  //捐献的百分比，占收入的
    //============公益拍卖=============
    create_time:{type:Date,default:Date.now},
    last_update_time:{type:Date,default:Date.now}
},{collection:'auctions'});

AuctionSchema.methods = {};
AuctionSchema.statics = {};

module.exports = mongoose.model('Auction',AuctionSchema);