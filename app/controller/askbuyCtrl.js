var AskbuyModel = require('../models/askbuy');
var AskbuyProxy = require('../proxy/askbuy');
var checkService = require('../services/check');

//求购模块的主页
//如果用户已登录，则显示该用户所属学校的所有的求购
//如果用户未登录，则显示全国所有的求购
exports.index = function(req,res,next){
    var keyword = req.query.q;
    var sortby = req.query.sortby;
    var page = req.query.page;
    keyword = keyword?keyword.trim().toLowerCase():null;    //搜索关键词
    sortby = sortby?sortby.trim().toLowerCase():"";     //排序类别
    page = page?Math.floor(parseInt(page.trim().toLowerCase())):1;      //页码
    var query = {};
    var option = {order:{create_at:-1}};
    if(keyword){
        query['$or'] = [
            {'title':new RegExp(keyword)},
            {'describe':new RegExp(keyword)},
        ];
    }

    if(sortby == "hot"){
        option.order = {hotlevel:-1};
    }

    var params = {keyword:keyword};
    checkService.checkIsLogin(req,function(user){
        if(user){   //登录了
            query["author.school"] = user.school;
            params['master'] = user;
        }else{
            params['master'] = null;
        }

        AskbuyProxy.divderPageGetAskbuys(page,30,query,option,function(err,askbuys){
            if(err || !askbuys) {
                params['askbuys'] = null;
            }else{
                params['askbuys'] = askbuys;
            }
            return res.render200("askbuy/index",params);
        });
    });
};

//查看求购详情页面
exports.showAskbuy = function(req, res, next){
    var askid = req.params.askid;
    askid = askid ? askid.trim().toLowerCase() : null;

    if(askid){    //求购id不为空
        AskbuyProxy.getAskBuyById(askid,function(err,askbuy){
            if(err || !askbuy){
                return res.redirect("/askbuy");
            }

            if(!askbuy.is_valid){
                return res.render200("unusual/invalid",{msg:"该求购不合法，不予以显示"});
            }

            if(askbuy.id_delete){
                return res.render200("unusual/invalid",{msg:"该求购不存在或已被作者删除"});
            }

            return res.render200("askbuy/home",{askbuy:askbuy});
        });
    }else{  //直接跳转到求购模块主页
        return res.redirect("/askbuy");
    }
};

//显示发布求购页面
exports.showPostAskbuy = function(req, res, next){

};
//发布求购
exports.postAskbuy = function(req, res, next){

};

//显示编辑求购页面
exports.showEditAskbuy = function(req, res, next){

};
//编辑求购
exports.editAskbuy = function(req, res, next){

};

//删除求购
exports.deleteAskbuy = function(req, res, next){

};
