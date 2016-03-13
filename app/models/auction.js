var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ArrayHelper = require('../helper/myArray');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');
var moment = require('moment');

moment.locale('zh-cn'); // 使用中文

//拍卖集合
var AuctionSchema = new Schema({
    goodId:{type:Schema.Types.ObjectId,ref:'Good'},  //对应的商品
    isAuctioning:{type:Boolean,default:true},  //是否在拍卖，发布者可以人为停止拍卖
    type:{type:Number,enum:[0,1],default:0},   //拍卖类型，0代表价格拍卖,1代表条件拍卖

    startPrice:{type:Number,default:0.0}, //拍卖起始价格，只有价格拍卖才有此字段

    startTime:{type:Date,default:Date.now}, //拍卖开始时间
    dateline:{type:Date,default:Date.now}, //拍卖截止日期
    illustration:{type:String,trim:true,default:''},   //拍卖说明

    auctions:[{type:Schema.Types.ObjectId,ref:'AuctionItem'}],  //拍卖记录集合

    isDonation:{type:Boolean,default:false},    //是否公益拍卖，默认不是
    //============公益拍卖=============
    donationFor:{type:String,trim:true,default:''},  //捐献的对象
    aboutDonationFor:{type:String,trim:true,default:''},  //关于捐献的对象
    donationLevel:{type:Number,default:0},  //捐献的百分比，占收入的
    //============公益拍卖=============
    is_delete:{type:Boolean,default:false},   //拍卖是否被删除
    is_valid:{type:Boolean,default:true},   //拍卖是否合法
    visitCount:{type:Number,default:0}, //浏览次数
    create_at:{type:Date,default:Date.now},
    update_at:{type:Date,default:Date.now}
},{collection:'auctions'});

var NotNullRule = [
    {col:'goodId',msg:'拍卖必须从店铺商品中选择'},
    {col:'type',msg:'请选择拍卖类型'},
    {col:'dateline',msg:'拍卖截止日期不能为空'},
];

var AuctionRule = {
    "type":{
      array:[0,1],
      ruleType:ruleType.ARRAYIN,
      msg:"拍卖类型必须为价格拍卖或条件拍卖"
    },
    "startPrice":{
        min:0,
        max:1000,
        ruleType:ruleType.NUMVAL,
        msg:"拍卖起始价格必须在0-1000元之间"
    },
    "startTime":{
        isNew:true,
        ruleType:ruleType.DATEAFTER,
        msg:"拍卖开始时间必须在此刻之后"
    },
    "dateline":{
        isNew:true,
        minute:30,
        ruleType:ruleType.DATEAFTER,
        msg:"拍卖时间至少为30分钟"
    },
    "dateline":{
        isNew:true,
        day:30,
        ruleType:ruleType.DATEBEFORE,
        msg:"拍卖时间最多为30天"
    },
    "illustration":{
        min:1,
        max:400,
        ruleType:ruleType.STRLEN,
        msg:"拍卖说明长度需在1~400个字符之间"
    },
    "donationFor":{
        min:1,
        max:15,
        ruleType:ruleType.STRLEN,
        msg:"公益拍卖捐赠对象的长度必须在1-15个字符之间"
    },
    "aboutDonationFor":{
        min:1,
        max:200,
        ruleType:ruleType.STRLEN,
        msg:"关于公益拍卖捐赠对象的长度必须在1-200个字符之间"
    },
    "donationLevel":{
        min:30,
        max:100,
        ruleType:ruleType.NUMVAL,
        msg:"公益拍卖捐赠比例必须大于百分之三十，小于百分之百"
    }
};

//剩余时间
AuctionSchema.virtual('restTime')
        .get(function(){
            var diffSecond = moment().isAfter(moment(this.dateline)) ? 0 : moment(this.dateline).diff(moment(),"second",true);
            return Math.max(Math.round(diffSecond),0);
        });

//是否结束
AuctionSchema.virtual('isEnd')
        .get(function(){
            return !this.isAuctioning || moment().isAfter(moment(this.dateline));
        });
//竞拍总数
AuctionSchema.virtual('bidCount')
        .get(function(){
            return this.auctions.length;
        });

AuctionSchema.methods = {

};

AuctionSchema.statics = {

};

AuctionSchema.plugin(deepPopulate,{})

baseSchemaMethod.regBeforeSave(AuctionSchema,NotNullRule,AuctionRule);
baseSchemaMethod.regPageQuery(AuctionSchema,'Auction');

var AuctionModel = mongoose.model('Auction',AuctionSchema);
module.exports = AuctionModel;