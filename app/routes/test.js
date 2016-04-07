var express = require('express');
var router = express.Router();
var checkService=  require('../services/check');
var conf = require('../../bin/config/config');

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

router.get('/swig',function(req,res,next){
    return res.render('test/testswig',{title:'测试swig好不好用'});
});


var AuctionProxy = require('../proxy/auction');
var moment = require('moment');
moment.locale('zh-cn'); // 使用中文
router.get('/auction/add/:goodid',function(req,res,next){
    var goodid = req.params.goodid;
    var postData = {
        startTime:Date.now(),
        dateline:moment().add(7,"d"),
        illustration:"这次拍卖纯粹为了筹集我个人下学期的学费，我们家很穷，交不起学费了，请大家帮帮我，好人一生平安，爱你们！",
        isDonation:false,
        donationFor:"",
        aboutDonationFor:"",
        donationLevel:0,
    };
    console.log("dateline:"+postData.dateline);
    AuctionProxy.createAuction(req.app.locals.uid,goodid,postData,function(err,auction){
        if(err){
            return res.send(err);
        }
        return res.redirect('/auction/'+auction._id);
    });
});

var VoteModel = require('../models/vote');
router.get('/vote/add',function(req,res,next){
    checkService.checkIsLogin(req,function(user){
        if(!user){
            return res.send("登录后再进行操作");
        }

        var vote = new VoteModel();
        vote.author = user.id;
        vote.title = "当今足坛谁是最强";
        vote.content = "没别的意思，就想跟大家探讨一下体育，想知道大家的对足球的偏好";
        vote.options = ["c罗","梅西","内马尔","苏亚雷斯","贝儿","本泽马","莱万多夫斯基"];
        vote.user_limitation = 100;

        vote.save(function(err){
            if(err){
                return res.send("创建投票失败："+err);
            }

            return res.redirect('/vote');
        })
    })
});


var captchapng = require('captchapng');
router.get('/checkcode/:width/:height',function(req,res,next){
    var width = req.params.width;
    var height = req.params.height;
    var p = new captchapng(width,height,parseInt(Math.random()*9000+1000)); // width,height,numeric captcha
    p.color(0, 0, 0, 120);  // First color: background (red, green, blue, alpha)
    p.color(80, 80, 80, 120); // Second color: paint (red, green, blue, alpha)

    var img = p.getBase64();
    var imgbase64 = new Buffer(img,'base64');
    res.writeHead(200, {
        'Content-Type': 'image/png'
    });
    res.end(imgbase64);
});

var TaskModel = require('../models/task');
var validator = require('validator');
router.get('/task/add/:title/:content/:reward/:endtime',function(req,res,next){
    var title = req.params.title;
    var content = req.params.content;
    var reward = req.params.reward;
    var endtime = req.params.endtime;

    if(!validator.isDate(endtime)){
        return res.send("截止日期不是合法的时间格式");
    }

    checkService.checkIsLogin(req,function(user){
       if(!user){
           return res.send("登录后操作");
       }

       var task = new TaskModel({
           author:user.id,
           title:title,
           content:content,
           reward:reward,
           endTime:new Date(endtime),
       });
        task.save(function(err){
            if(err){
                return res.send("save task error:"+err);
            }

            return res.redirect('/task');
        })
    });
});


//上传文件
var UploadHelper = require('../helper/myUpload');
var join = require('path').join;
router.get('/upload',function(req,res,next){
    return res.render200('test/upload');
});
router.post('/upload',function(req,res,next){
    var option = {
        'uploadPath':conf.upload_goods_dir,
        'maxFieldsSize':2 * 1024 *1024
    };
    UploadHelper.upload(req,option,
        function(percent){ //onProgress
            console.log('上传了'+percent+"%");
        },
        function(file,saveFileName){ //ONEnd
            var srcPath = conf.upload_goods_dir+"\\"+saveFileName;
            return res.sendFile(srcPath);
        },function(err){ //OnError
            console.log("上传出错啦啦："+err);
        });
});

//创建活动
var ActivityProxy = require('../proxy/activity');
var ActivityModel = require('../models/activity');
var FormType = require('../const/formType');
router.get("/add/activity",function(req,res,next){
    var myUid = "56b1a447a762e6e40907b184";
    var title = "大咖分享III: 大数据分析中的主流工具实例介绍";
    var detail = "大数据(BigData)相关的技术一直比较火，甚至有很多BigData的公司拿到了大额投资。这期我们也来应下景，由两位专业做大数据的国内外专家来聊聊Go/C/Scala/Spark在BigData的运用，感兴趣的朋友可以过来一起交流下。";
    var maxPeople = 88;
    var offline = req.body.offline;
    var condition = "全日制在校大学生，包括研究生、博士生";
    var position = "（上海长宁）安西路100号一楼";
    var timestart = new Date();
    var timeend = moment().add(2,"d").toDate();
    var canSignAfterStart = true;
    var isNeedReview = true;
    var canOtherUpdateScene = true;
    var formData  = [
        {n:"姓名",t:FormType.INPUT,min:2,max:6,msg:"请输入姓名"},
        {n:"性别",t:FormType.RADIO,msg:"请选择性别",option:["男","女"]},
        {n:"学校",t:FormType.INPUT,msg:"请输入学院"},
        {n:"兴趣爱好",t:FormType.CHECKBOX,option:["看电影","踢球","谈恋爱","吃瓜子","唱歌跳舞","写代码","其他"]},
        {n:"头像",t:FormType.PICTURE,msg:"请上传你的头像",require:false},
        {n:"常用邮箱",t:FormType.PHONE,msg:"请输入您的常用邮箱"},
    ];

    ActivityProxy.createActivity(myUid,title,detail,maxPeople,offline,condition,position,timestart,timeend,canSignAfterStart,isNeedReview,canOtherUpdateScene,formData,function(err,activity){
        if(err){
            return res.send(err);
        }
        console.log("创建活动成功！！！！");
        console.log(activity);
        return res.redirect('/activity/'+activity._id);
    })
});

module.exports = router;