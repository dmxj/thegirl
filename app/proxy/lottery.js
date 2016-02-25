var LotteryModel = require('lottery');
var StoreProxy = require('../proxy/store');
var ArrayHelper = require('../helper/myArray');

//创建抽奖牌
exports.createLottery = function(uid,goodParams,storeId,callback)
{
    var goodArr = ArrayHelper.getAttrArrayMongoId(goodParams,"good");
    var rateArr = ArrayHelper.getAttrArrayNumber(goodParams,"p");
    var numberArr = ArrayHelper.getAttrArrayNumber(goodParams,"n");
    if(!goodArr || goodArr.length != goodParams.length || !rateArr || rateArr.length != goodParams.length || !numberArr || numberArr.length != goodParams.length){
        return callback("提交的商品参数有误，请检查重试");
    }

    var sumChance = ArrayHelper.getSumOfArray(chanceArr);
    if(sumChance <= 50 || sumChance > 100){
        return callback("中奖概率之和必须大于50，小于100");
    }

    var query = {
        '$or':[
            {"inUse":false},
            {"is_valid":false},
            //{"quantity":{"$lte":0}},
        ]
    };
    var invalidTip = "只有不限库存的普通商品和符合规定的商品才能进行抽奖，请重新选择";

    StoreProxy.checkStoreBossAndGood(uid,goodArr,query,invalidTip,storeId,function(err){
       if(err){
           return callback(err,null);
       }

        var goods = [];
        for(var i=0;i<goodParams.length;i++){
            goods.push({
                "good":goodArr[i],
                "rate":rateArr[i],
                "quantity":numberArr[i],
                "user":[],
            });
        }

        if(sumChance != 100){
            goods.push({
                "good":null,
                "chance":100 - sumChance,
                "quantity":-1,
                "user":[],
            });
        }

        var lottery = new LotteryModel({store:storeId,goods:goodArr});
        lottery.save(function(err1){
           if(err1) {
               var errMsg = err1.name == "RuleError" ? err1.message : "创建抽奖牌失败，请稍后重试！";
               return (errMsg,null);
           }
            return (null,lottery);
        });
    });
};

//删除抽奖牌
exports.removeLottery = function(lotteryId,callback)
{
    LotteryModel.remove({_id:lotteryId},function(err){
       if(err){
           return callback("删除抽奖牌失败");
       }

        return callback(null);
    });
};

//进行抽奖，利用回调返回中奖的商品id，空为没中奖
exports.lottery = function()
{

};