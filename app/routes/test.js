var express = require('express');
var router = express.Router();
var checkService=  require('../services/check');

var GoodTypeModel = require('../models/goodType');
router.get('/goodtype/add/:name',function(req,res,next){
    var name = req.params.name;
    if(!name) return res.send("name need!");
    var type = new GoodTypeModel();
    type.name = name;
    type.save(function(err){
        if(err) return res.send('good type add err:'+err);
        return res.redirect('/test/goodtype/all');
    });
});
router.get('/goodtype/all',function(req,res,next){
    GoodTypeModel.find({}).exec(function(err,types){
        if(err || !types) return res.send("没有商品类型");
        return res.send(types);
    });
});

var GoodModel = require('../models/good');
router.get('/good/add/:boss/:name/:detail/:price',function(req,res,next){
    var boss = req.params.boss;
    var name = req.params.name;
    var detail = req.params.detail;
    var price = req.params.price;
    if(!boss || !name || !detail || !price) return res.send("params need!");
    var good = new GoodModel();
    good.boss = boss;
    good.goodname = name;
    good.detail = detail;
    good.price = price;
    good.alias = ['好玩','服务','性价比高'];
    good.save(function(err){
        if(err) return res.send('good add err:'+err);
        return res.redirect('/test/good/all');
    });
});
router.get("/good/all",function(req,res,next){
    GoodModel.find({}).exec(function(err,goods){
        if(err || !goods) return res.send("没有商品");
        return res.send(goods);
    });
});

var StoreModel = require('../models/store');
router.get('/store/add/:boss/:goodid/:storename/:describe',function(req,res,next){
    var boss = req.params.boss;
    var storename = req.params.storename;
    var goodid = req.params.goodid;
    var describe = req.params.describe;
    if(!boss || !storename || !goodid || !describe) return res.send("params need!");
    var store  = new StoreModel();
    store.boss = boss;
    store.storename = storename;
    store.describe = describe;
    store.goods.push(goodid);
    store.save(function(err){
        if(err) return res.send('store add err:'+err);
        return res.redirect('/test/store/all');
    });
});
router.get('/store/all',function(req,res,next){
    StoreModel.find({}).exec(function(err,stores){
        if(err || !stores) return res.send("没有店铺");
        return res.send(stores);
    });
});

router.get('/store/create',function(req,res,next){
    checkService.checkCreateStorePermisson(req,function(err){
        if(err){
            res.send("你现在无法创建店铺，是因为："+err);
        }else{
            res.send("你可以创建店铺");
        }
    });
});

var TopicModel = require('../models/topic');
router.get('/topic/add/:author/:title/:content',function(req,res,next){
    var author = req.params.author;
    var title = req.params.title;
    var content = req.params.content;
    if(!author || !title || !content) return res.send("params need!");
    var topic  = new TopicModel();
    topic.author = author;
    topic.title = title;
    topic.content = content;
    topic.save(function(err){
        if(err) return res.send('topic add err:'+err);
        return res.redirect('/test/topic/all');
    });
});
router.get('/topic/all',function(req,res,next){
    TopicModel.find({}).exec(function(err,topics){
        if(err || !topics) return res.send("没有话题");
        return res.send(topics);
    });
});

var UserModel = require('../models/user');
router.get('/user/all',function(req,res,next){
    UserModel.find({}).exec(function(err,users){
        if(err || !users) return res.send("没有用户");
        return res.send(users);
    });
});

var NotifyModel = require('../models/notification');
router.get('/notify/add/:uid/:content',function(req,res,next){
    var uid = req.params.uid;
    var content = req.params.content;
    if(!uid || !content){
        return res.send('params lack');
    }

    var notify = new NotifyModel();
    notify.user = uid;
    notify.content = content;
    notify.save(function(err){
       if(err){
           return res.send('notify save error:'+err);
       }

        return res.redirect('/test/notify/all');
    });
});
router.get('/notify/all',function(req,res,next){
    NotifyModel.find({}).exec(function(err,notifys){
        if(err || !notifys) return res.send("没有通知");
        return res.send(notifys);
    });
});


var TaskModel = require('../models/task');
router.get('/task/save',function(req,res,next){
    var myTask = new TaskModel();
    myTask.reward = "这个是任务的报酬，不知不觉中超过了10个字符，哈哈哈哈，该报错了吧！";
    myTask.content = "这个是任务的内容";
    myTask.remarks.push("remark");
    myTask.save(function(err){
        if(err){
            console.log("task save err:"+err.message);
            return res.send('保存任务失败：'+err.message);
        }
        return res.send('保存任务成功');
    });
});

router.get('/task/all',function(req,res,next){
    TaskModel.find({}).exec(function(err,tasks){
        if(err || !tasks) return res.send("没有任务");
        return res.send(tasks);
    });
});

var CommentModel = require('../models/comment');
router.get('/comment/query',function(req,res,next){
    //var commentid = "56c494fb24956aa80ea40fd0";
    //var query = {
    //    '$or':[
    //        {"_id":commentid},
    //        {"replyTo":commentid},
    //        {"underList":commentid}
    //    ]
    //};
    //CommentModel.update(query,{$set:{'is_deleted':true}},{multi:true},function(err,comments){
    //   res.send(comments);
    //});

    CommentModel.find({'$where':"this.pictures.length > 0","good":"56b1ee81b164d828148f7f7b"},function(err,comments){
        res.send(comments);
    });
});


var ShopCartProxy = require('../proxy/shopCart');
router.get('/cart/add/:goodid/:choice/:number',function(req,res,next){
    ShopCartProxy.addGoodToCart(req.app.locals.uid,req.params.goodid,req.params.choice,req.params.number,function(err){
        if(err){
            return res.send(err);
        }

        return res.send("添加购物车成功");
    })
});

var AskbuyModel = require('../models/askbuy');
router.get('/askbuy/add/:title/:describe',function(req,res,next){
    if(!req.app.locals.uid){
        return res.redirect('/login');
    }
    var askbuy = new AskbuyModel({author:req.app.locals.uid,title:req.params.title,describe:req.params.describe});
    askbuy.save(function(err){
        if(err){
            return res.send('save askbuy error:'+err);
        }

        return res.redirect('/test/askbuy/all');
    });
});

router.get('/askbuy/all',function(req,res,next){
    AskbuyModel.find(function(err,askbuys){
        if(err){
           return req.send("find error:"+err);
        }
        return res.send(askbuys);
    });
});

var StrHelper = require('../helper/myStrHelper');
router.get('/uuid',function(req,res,next){
    return res.send(StrHelper.uuid(6));
});

module.exports = router;