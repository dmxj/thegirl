var AskBuyModel = require('../models/askbuy');

//分页获取求购
exports.divderPageGetAskbuys = function(index,perpage,query,option,callback)
{
    var _query = query || {};
    _query.is_valid = true;
    _query.is_delete = false;
    var _option = option || {};
    AskBuyModel.find(_query,'',_option)
        .skip((index-1)*perpage)
        .limit(perpage)
        .populate('author mayScope fans')
        .exec(callback);
};

//根据id获取求购
exports.getAskBuyById = function(id,callback)
{
    AskBuyModel.myFindOne({_id:id},{},callback);
};

//添加保存新的求购
exports.newAndSave = function(askbuy,callback){
    if(!askbuy) return callback('askbuy undefined!');
    askbuy.save(function(err){
        if(err && err.name && err.name == "RuleError"){
            return callback(err.message);
        }
        if(err){
            return callback("保存求购失败！请稍后重试");
        }
        return callback(null);
    });
};

//浏览次数增加
exports.incrViewCount = function(_id){
    askbuy.findOne(_id,function(err,askbuy){
        if(!err && askbuy && askbuy.visitCount < 10000000){
            askbuy.visitCount = askbuy.visitCount + 1;
            askbuy.save();
        }
    });
};