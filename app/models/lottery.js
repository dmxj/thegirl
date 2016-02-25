var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');
var ArrayHelper = require('../helper/myArray');

//抽奖集合
//如果goods.good为空，则为不中奖的概率
var LotterySchema = new Schema({
    store:{type:Schema.Types.ObjectId,ref:'Store'},  //所属店铺
    goods:[{
        good:{type:Schema.Types.ObjectId,ref:'Good'},   //商品
        quantity:{type:Number,default:-1},    //奖品数量
        rate:{type:Number,default:0}, //中奖概率
        user:[{type:Schema.Types.ObjectId,ref:'User'}],   //中奖的用户
    }],    //参与抽奖的商品
    create_at:{type:Date,default:Date.now},
},{collection:'lotterys'});

var NotNullRule = [
    {col:'store',msg:'所属店铺不能为空！'},
    {col:'goods',msg:'必须选择2个及2个以上的商品进行抽奖'},
];

var LotteryRule = {
    goods: {
        lengthMax: 16,
        lengthMin: 2,
        ruleType: ruleType.ARRAYLEN,
        msg: "参与抽奖的商品不能少于2个，也不能多于16个"
    },
    "goods.chance":{
        min:0.001,
        max:99.999,
        ruleType: ruleType.NUMVAL,
        msg: "商品的中奖率必须在百分之0.001到百分之99.999之间"
    },
};

LotterySchema.methods = {
    lottery:function(userid,callback){     //执行抽奖
        var goodArr = ArrayHelper.getAttrArray(this.goods,"good");
        var quantityArr = ArrayHelper.getAttrArray(this.goods,"quantity");
        var rateArr = ArrayHelper.getAttrArray(this.goods,"rate");

        var sortRateArr = rateArr;
        sortRateArr.sort(function(a,b){
           return a-b;
        });

        var sortGoodArr = [],sortQuantityArr = [];
        rateArr.forEach(function(item,index){
            var sortIndex = sortRateArr.indexOf(item);
            if(sortIndex < 0) return callback("出现错误！",null);
            sortGoodArr[sortIndex] = goodArr[index];
            sortQuantityArr[sortIndex] = quantityArr[index];
        });

        var sumRate = [],tempRate = 0;
        for(var i=0;i<sortRateArr.length;i++){
            tempRate += sortRateArr[i];
            sumRate.push(tempRate);
        }

        var randomNumber = Math.random() * 100;
        var prizeIndex = sumRate.length - 1;
        for(var i = 0;i < sumRate.length;i++){
            if(randomNumber <= sumRate[i]){
                prizeIndex = i;
                break;
            }
        }

        var quantityOfPrize = sortQuantityArr[prizeIndex];
        if(quantityOfPrize == 0){
            return callback("该奖品已被抽光，请重新尝试",null);
        }else if(quantityOfPrize < 0){
            return callback(null,sortGoodArr[prizeIndex]);
        }else{  //将抽中的商品剩余数减一，并重新计算概率

        }

    },
    reCaculateRate:function(){  //重新计算中奖概率

    }
};

LotterySchema.statics = {

};

baseSchemaMethod.regBeforeSave(LotterySchema,NotNullRule,LotteryRule);

module.exports = mongoose.model('Lottery',LotterySchema);
