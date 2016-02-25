var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');
var TimeHelper = require('../helper/myTime');
var couponType = require('../const/couponType');
var couponTypeConst = couponType.const;
var couponTypeCollection = couponType.collection();

console.log("couponTypeCollection:"+couponTypeCollection);

/**
 * 店铺优惠券，满减、打折、送积分、送抽奖
 */
var CouponSchema = new Schema({
    type:{type:Number,enum:couponTypeCollection}, //优惠券类型
    forGoods:[{type:Schema.Types.ObjectId,ref:'Good'}], //适用的商品，如果是空数组，则适用所有商品
    quantity:{type:Number,default:-1},  //数量,默认-1为不限量
    params:{
        fullCut:{   //满减
            fullPrice:{type:Number,default:null},   //满价
            cutPrice:{type:Number,default:null},    //减价
        },

        cheaper:{   //优惠
            cheaperPrice:{type:Number,default:null},   //优惠金额
        },

        disCount:{  //打折
            percent:{type:Number,default:null},   //折扣，必须大于0，小于10，
        },

        giveScore:{ //送积分
            score:{type:Number,default:null},   //送出去的积分是多少
        },

        lottery:{   //抽奖
            lottery:{type:Schema.Types.ObjectId,ref:'Lottery',default:null},
        },

    },
    create_at:{type:Date,default:Date.now},
},{collection:'coupons'});

var NotNullRule = [
    {col:'type',msg:'优惠券的类型不能为空'},
];

var CouponRule = {
    type:{
        array:couponTypeCollection,
        ruleType:ruleType.ARRAYIN,
        msg:"不是合法的优惠券类型"
    },
    "params.fullCut.fullPrice":{
        min:0,
        ruleType:ruleType.NUMVAL,
        msg:"符合满减条件的价格不能小于0元"
    },
    "params.fullCut.cutPrice":{
        min:1,
        ruleType:ruleType.NUMVAL,
        msg:"满减的价格必须不能小于1元"
    },
    "params.cheaper.cheaperPrice":{
        min:1,
        ruleType:ruleType.NUMVAL,
        msg:"优惠金额必须不能小于1元"
    },
    "params.disCount.percent":{
        min:0,
        max:9.99,
        ruleType:ruleType.NUMVAL,
        msg:"折扣必须在0折(免费)~9.99折之间"
    },
    "params.giveScore":{
        min:0,
        ruleType:ruleType.NUMVAL,
        msg:"赠送的积分不能小于0"
    },

};


CouponSchema.virtual('create_time')
    .get(function(){
        return TimeHelper.formatDate(this.create_at,false);
    });

CouponSchema.methods = {

};
CouponSchema.statics = {

};

baseSchemaMethod.regBeforeSave(CouponSchema,NotNullRule,CouponRule);

module.exports = mongoose.model('Coupon',CouponSchema);