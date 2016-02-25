var EventProxy = require('eventproxy');
var StoreModel = require('../models/store');
var GoodProxy = require('../proxy/good');
var ArrayHelper = require('../helper/myArray');
var validator = require('validator');

//分页获取店铺
exports.divderPageGetStores = function(index,perpage,query,option,callback)
{
    var _query = query || {};
    _query.inuse = true;
    _query.is_valid = true;
    var _option = option || {};
    StoreModel.find(_query,'',_option)
        .skip((index-1)*perpage)
        .limit(perpage)
        .populate('boss goods comments credit')
        .exec(callback);
};

//获取热门店铺
exports.getHotStore = function(num,callback)
{
    var opt = {limit:num};
    StoreModel.myFind({inuse:true,is_valid:true},opt,callback);
};

//根据id获取店铺
exports.getStoreById = function(id,callback)
{
    StoreModel.myFindOne({_id:id},{},callback);
};

//检验店铺是否属于该用户，并校验合法性
//检验商品id数组是否属于店铺，是否合法
exports.checkStoreBossAndGood = function(uid,goodArr,query,invalidTip,storeId,callback)
{
    StoreModel.findOne({_id:storeId},function(err,store){
       if(err || !store){
           return callback("未找到店铺信息");
       }

        if(uid && store.boss != uid){
            return callback("您无权进行此操作");
        }

        if(!store.inuse){
            return callback("该店铺已被移除，无法继续操作");
        }

        if(!store.is_valid){
            return callback("该店铺不合法，无法继续操作");
        }

        if(goodArr && typeof goodArr != "undefined") {
            if (!util.isArray(goodArr)) {
                return callback("服务器错误，无法继续操作");
            } else {
                goodArr.forEach(function (goodId) {
                    if (!validator.isMongoId(goodId.toString()) || store.goods.indexOf(goodId) < 0) {
                        return callback("您不能操作不属于该店铺的商品");
                    }
                });
            }
        }


        query = query || {};
        GoodProxy.findGoodsIsHavaThe(goodArr,query,function(err){
           if(err === true){
               return callback(invalidTip);
           }
            return callback(null);
        });
    });
};

//根据id移除店铺
exports.removeStoreById = function(userid,storeid,callback){
    if(!userid){
        return callback('请登录后再进行操作',1);
    }

    if(!storeid){
        return callback('未找到该店铺',0);
    }
    exports.getStoreById(storeid,function(err,store){
        if(err || !store || store.boss._id != userid){
            return callback('未找到该店铺',0);
        }

        store.inuse = false;    //置店铺不可用
        store.save(function(err2){
            if(err2){
                return callback('删除店铺失败',0);
            }

            return callback('删除店铺成功！',0);
        });
    });
};

//店铺收藏者添加
exports.addFans = function(sid,fanUid,callback)
{
    StoreModel.findOne({_id:sid,inuse:true,is_valid:true},function(err,store){
        if(err || !store){
            return callback('no find store');
        }

        store.fans.indexOf(fanUid) < 0 && store.fans.push(fanUid);
        store.save(function(err2){
            if(err2){
                return callback(err2);
            }
            return callback(null);
        });
    });
};

//店铺收藏者移除
exports.removeFans = function(sid,fanUid,callback)
{
    StoreModel.findOne({_id:sid,inuse:true,is_valid:true},function(err,store){
        if(err || !store){
            return callback('no find store');
        }

        store.fans = ArrayHelper.removeElement(store.fans,fanUid);
        store.save(function(err2){
            if(err2){
                return callback(err2);
            }

            return callback(null);
        });
    });
};

//查找某用户所有的不合法且未删除的店铺
exports.findInvalidStoreByUid = function(uid,callback)
{
    StoreModel.find({boss:uid,inuse:true,is_valid:false},function(err,stores){
        if(err || !stores || stores.length <= 0){
            return callback(null);
        }
        return callback(stores);
    });
};