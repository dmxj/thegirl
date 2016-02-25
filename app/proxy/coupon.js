var CouponModel = require('../models/coupon');
var StoreModel = require('../models/store');
var StoreProxy = require('../proxy/store');
var util = require('util');
var validator = require('validator');
var async = require('async');
var couponType = require('../const/couponType');
var couponTypeConst = couponType.const;

//根据优惠券的id获取所属店铺
exports.findCouponStore = function(couponId,callback){
    StoreModel.findOne({coupons:couponId},function(err,store){
        if(err || !store){
            return callback(null);
        }
        return callback(store);
    });
};

//校验用户创建优惠券的提交值并创建优惠券实例
function generateCouponInstance(postData,callback){
    var isValid = function(attr){
        return postData[attr] && typeof postData[attr] != "undefined";
    }

    var coupon = new CouponModel();
    if(isValid("goods") && !util.isArray(postData.goods)){
        return callback("优惠券适用商品集合不合法",null);
    }
    coupon.forGoods = isValid("goods") ? postData.goods : [];

    if(isValid("number") && !util.isNumber(postData.number)){
        return callback("优惠券数量必须为数字",null);
    }
    coupon.quantity = isValid("number") && parseInt(postData.number) > 0 ? parseInt(postData.number) : -1;

    if(typeof postData === "object" && Object.getOwnPropertyNames(postData).length > 0 && isValid("type"))
    {
        switch(postData.type){
            case couponTypeConst.FULLCUT:   //满减
                if(!isValid("reachPrice")){
                    return callback("满减券，条件价格不能为空",null);
                }
                if(!isValid("reducePrice")){
                    return callback("满减券，减去价格不能为空",null);
                }
                coupon.params.fullCut.fullPrice = postData.reachPrice;
                coupon.params.fullCut.cutPrice = postData.reducePrice;
                break;
            case couponTypeConst.CHEAPER:   //优惠
                if(!isValid("subtractPrice")){
                    return callback("优惠券，优惠价格不能为空",null);
                }
                coupon.params.cheaper.cheaperPrice = postData.subtractPrice;
                break;
            case couponTypeConst.DISCOUNT:  //打折
                if(!isValid("discount")){
                    return callback("打折券，折扣不能为空",null);
                }
                coupon.params.discount.percent = postData.discount;
                break;
            case couponTypeConst.GIVESCOPE: //送积分
                if(!isValid('score')){
                    return callback("积分券，送分值不能为空",null);
                }
                coupon.params.giveScore.score = postData.score;
                break;
            case couponTypeConst.LOTTERY:   //抽奖
                if(!isValid('lottery') || !validator.isMongoId(postData.lottery)){
                    return callback("抽奖券，抽奖牌不能为空",null);
                }
                coupon.params.lottery.lottery = postData.lottery;
                break;
        }
        return callback(null,coupon);

    }
        return callback("提交的数据为空，添加优惠券失败！",null);
};


//创建优惠券
exports.createCoupon = function(myUid,storeid,postData,callback){
    async.waterfall([
        function(cb){   //校验店铺合法性
            if(!storeid){
                return cb("出现错误，店铺为空");
            }

            var query = {
                '$or':[
                    {"inUse":false},
                    {"is_valid":false},
                ]
            };
            var invalidTip = "您选择的商品中含有不合法或已被删除商品，请重新选择";
            StoreProxy.checkStoreBossAndGood(myUid,postData.goods,query,invalidTip,storeid,function(err){
                if(err){
                    return cb(err);
                }
                return cb(null);
            });
        },
        function(cb){   //利用用户提交的数据生成coupon实例
            generateCouponInstance(postData,function(err,couponInstance){
                if(err){
                    return cb(err,null);
                }
                return cb(null,couponInstance);
            });
        },
        function(coupon,cb){    //保存coupon
            coupon.save(function(err){
               if(err && err.name == "RuleError"){
                   return cb(err.message,null);
               }else if(err){
                   return cb("创建优惠券失败！",null);
               }

                return cb(null,coupon);
            });
        }
    ],function(err,results){
        if(err){
            return callback(err,null);
        }

        return callback(null,results);
    });
}