var AuctionModel = require('../models/auction');
var AuctionProxy = require('../proxy/auction');
var validator = require('validator');
var checkService = require('../services/check');

//拍卖模块的主页
exports.index = function(req,res,next)
{
    var page = req.query.p; //页码
    var sort = req.query.sort;  //排序

    page = page?Math.floor(parseInt(page.trim().toLowerCase())):1;
    sort = sort?sort.trim().toLowerCase():"";

    var query = {};
    var option = {sort:{visitCount:-1}};

    if(sort == "hot"){  //最热
        option.sort = {visitCount:-1};
    }else if(sort == "new"){    //最新
        option.sort = {create_at:-1};
    }

    var params = {};
    checkService.checkIsLogin(req,function(user){
        params['master'] = user;
        if(user){
            query["boss.school"] = user.school;
        }
        AuctionProxy.findAuctionListByPage(page,10,query,option.sort,function($query){
            params['auctions'] = $query ? $query.results : null;
            params['pageCount'] = $query ? $query.pageCount : 0;

            return res.render200('auction/index',params);
        });
    });
};


//商品拍卖的主页
exports.home = function(req,res,next)
{
    var auctionId = req.params.auctionId;
    if(!auctionId || auctionId.toString().trim() == "")
    {
        return res.redirect('/auction');
    }

    AuctionProxy.findAuctionById(auctionId,function(auction){
        if(!auction || auction.is_delete){
            return res.render200('unusual/deleted',{"msg":"该拍卖不存在或已被发布者移除"});
        }
        if(!auction.is_valid){
            return res.render200('unusual/invalid',{"msg":"该拍卖不合法，不予以显示"});
        }

        return res.render200('auction/home',{auction:auction});
    });
};

//提交竞拍
exports.submitBid = function(req,res,next){
    checkService.checkIsLogin(req,function(user){
        if(!user){
            return res.json({msg:'请登录后操作！',code:1});
        }

        AuctionProxy.postAuction(user.id,req.body.id,req.body.data,function(err){
            if(err){
                return res.json({msg:err,code:0});
            }
            return res.json({msg:'竞拍成功!',code:2});
        });
    });
};


