var GoodModel = require('../models/good');
var AuctionModel = require('../models/auction');
var AuctionItemModel = require('../models/auctionItem');
var ArrayHelper = require('../helper/myArray');
var checkService = require('../services/check');
var validator = require('validator');
var moment = require('moment');
var async = require('async');

moment.locale('zh-cn'); // 使用中文

function isDefined(val){
    if(!val || val === undefined || typeof val == 'undefined'){
        return false;
    }
    return true;
};

function isStrNull(str){
    if(!isDefined(str) || str.toString().trim() == ""){
        return true;
    }
    return false;
}

//查询拍卖列表
exports.findAuctionListByPage = function(page,perpage,query,sort,callback)
{
    var _query = query || {};
    _query.is_valid = true; //合法拍卖
    var _sort = sort || {};

    AuctionModel.pageQuery(page, perpage,"goodId", _query, _sort,function(err,$page){
        return callback($page);
    });
};

//查询拍卖详情
exports.findAuctionById = function(auctionId,callback)
{
    AuctionModel.findOne({_id:auctionId})
        .deepPopulate("goodId goodId.boss goodId.boss.school auctions auctions.user auctions.user.school")
        .exec(function(err,auction){
            if(err || !auction){
                return callback(null);
            }

            //auction.isEnd = !auction.isAuctioning || moment().isAfter(moment(auction.dateline));
            //auction.bidCount = auction.auctions.length;
            auction.bidUserCount = auction.bidCount == 0 ? 0 : ArrayHelper.getAttrArrayUnique(auction.auctions,"user").length;
            if(auction.type == 0){
                auction.maxPrice = auction.bidCount > 0 ? auction.auctions[auction.bidCount-1].bidPrice : 0;
                console.log("auction.maxPrice:"+auction.maxPrice);
            }

            return callback(auction);
        });
};

//创建拍卖
exports.createAuction = function(userid,goodId,postData,callback)
{
    if(!userid){
        return callback("请登录后再进行操作",null);
    }

    GoodModel.findOne({_id:goodId},function(err,good){
        if(err || !good){
            return callback("未查找到相关商品",null);
        }
        if(good.boss.toString() != userid.toString()){
            return callback("您无权进行此操作",null);
        }

        if(!isDefined(postData.startPrice) && !good.price)
            return callback("请填写拍卖的起始价格",null);
        if(!isDefined(postData.startPrice))
            postData.startPrice = good.price;

        if(!isDefined(postData.startTime))
            postData.startTime = Date.now();
        if(!isDefined(postData.dateline))
            return callback("拍卖截止日期不能为空",null);
        if(moment(postData.dateline).diff(moment(postData.startTime),"hour",true) < 30)
            return callback("拍卖间隔时间不能小于30分钟",null);

        if(isDefined(postData.isDonation) && postData.isDonation == true){
            if(isStrNull(postData.donationFor))
                return callback("公益拍卖的捐献对象不能为空",null);
            if(isStrNull(postData.donationFor))
                return callback("公益拍卖的捐献对象不能为空",null);
            if(!isDefined(postData.donationLevel))
                return callback("公益拍卖的捐献比例不能为空",null);
        }

        postData.goodId = goodId;
        var auctionInstance = new AuctionModel(postData);
        auctionInstance.save(function(err1){
            if(err1) {
                var errMsg = err1.name == "RuleError" ? err1.message : "服务器错误，创建拍卖失败！";
                return callback(errMsg,null);
            }

            good.auction = auctionInstance._id;
            good.save(function(err2){
                if(err2){
                    rollback(auctionInstance._id,function(){
                        return callback(errMsg,null);
                    });
                }else{
                    return callback(null,auctionInstance);
                }
            });
        });

    });

};


//用户提交竞拍：出价或出条件
exports.postAuction = function(userid,auctionId,data,callback)
{
    if(!userid){
        return callback("请登录后再进行操作");
    }

    AuctionModel.findOne({_id:auctionId})
            .populate("goodId auctions")
            .exec(function(err,auction){
                if(err || !auction){
                    return callback("服务器错误，或未找到对应拍卖，请刷新页面重试");
                }

                if(auction.goodId.boss.toString() == userid.toString()){
                    return callback("对不起，您无法竞拍自己的拍品");
                }

                if(!auction.isAuctioning || moment().isAfter(moment(auction.dateline))){
                    return callback("对不起，拍卖已结束，您无法进行竞拍");
                }

                switch (auction.type){
                    case 0: //价格竞拍
                        priceAuction(userid,auction,data,function(err){
                            return callback(err);
                        });
                        break;
                    case 1: //条件竞拍
                        conditionAuction(userid,auction,data,function(err){
                            return callback(err);
                        });
                        break;
                    default:
                        return callback("该拍卖参数出错，无法进行竞拍");
                        break;
                }
            });
};

//价格竞拍
function priceAuction(userid,auction,price,callback){
    if(!price || !validator.isNumeric(price)){
        return callback("请填写正确格式的竞价");
    }

    var maxPrice = auction.auctions.length > 0 ? auction.auctions[auction.auctions.length-1].bidPrice : auction.startPrice;
    if(maxPrice >= price){
        return callback("竞价必须大于目前竞价的最高价");
    }

    var auctionItemInstance = new AuctionItemModel({user:userid,bidPrice:price});
    async.waterfall([
        function(done){ //保存竞价记录
            auctionItemInstance.save(function(err){
               done(err);
            });
        },
        function(done){ //竞价保存到拍卖集合中
            auction.auctions.push(auctionItemInstance._id);
            auction.save(function(err){
                done(err);
            });
        }
    ],function(err,results){
        if(err){
            rollback(auctionItemInstance._id,function(){
                var errMsg = err.name == "RuleError" ? err.message : "服务器错误，竞拍失败，请稍后重试";
                return callback(errMsg);
            })
        }else{
            return callback(null);
        }
    });
}

//条件竞拍
function conditionAuction(userid,auction,condition,callback){
    if(isStrNull(condition)){
        return callback("竞拍条件不能为空");
    }

    if(auction.auctions.length > 0) {   //同一用户发布了同一条件
        var conditionArr = ArrayHelper.getAttrArray(auction.auctions, "bidCondition");
        var userArr = ArrayHelper.getAttrArray(auction.auctions, "user");
        var sameConditionIndex = conditionArr.indexOf(condition.toString().trim());
        var sameUserIndex = userArr.indexOf(userid.toString().trim());
        if (sameConditionIndex == sameUserIndex){
            return callback("您已经提交同样的竞拍条件，请不要重复提交");
        }
    }

    var auctionItemInstance = new AuctionItemModel({user:userid,bidCondition:condition});
    async.waterfall([
        function(done){ //保存竞拍条件记录
            auctionItemInstance.save(function(err){
                done(err);
            });
        },
        function(done){ //竞拍保存到拍卖集合中
            auction.auctions.push(auctionItemInstance._id);
            auction.save(function(err){
                done(err);
            });
        }
    ],function(err,results){
        if(err){
            rollback(auctionItemInstance._id,function(){
                return callback("服务器错误，竞拍失败，请稍后重试");
            })
        }else{
            return callback(null);
        }
    });
}

//错误回退
function rollback(auctionItemId,callback){
    AuctionItemModel.remove({_id:auctionItemId},function(err,auctionItem){
        return callback();
    });
}