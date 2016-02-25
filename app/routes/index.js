var express = require('express');
var router = express.Router();
var conf = require('../../bin/config/config');
var myUpload = require('../helper/myUpload');
var myImage = require('../helper/myImage');
var gm = require('gm').subClass({imageMagick: true});
//var userCtrl = require('../controller/AccountCtrl');
var signCtrl = require('../controller/signCtrl');
var indexCtrl = require('../controller/indexCtrl');
var	searchCtrl = require('../controller/searchCtrl');
var userCtrl = require('../controller/userCtrl');
var storeCtrl = require('../controller/storeCtrl');
var topicCtrl = require('../controller/topicCtrl');
var goodCtrl = require('../controller/goodCtrl');
var albumCtrl = require('../controller/albumCtrl');
var askbuyCtrl = require('../controller/askbuyCtrl');
var notifyCtrl = require('../controller/notifyCtrl');
var followCtrl = require('../controller/followCtrl');
var commentCtrl = require('../controller/commentCtrl');
var shopCartCtrl = require('../controller/shopCtrl');

var authMiddleware = require('../middleware/auth');


//===============测试mongoDB==============
var testModel = require('../models/test');
router.get('/testmongo/all',function(req,res,next){
	var testInstance = new testModel();
	testInstance.list(function(users){
		res.status(200).send(users);
	});
});

router.get('/testmongo/not/:uname',function(req,res,next){
	var uname = req.params.uname;
	testModel.find({name:{$ne:uname}},function(err,test){
		if(err){
			return res.send(err);
		}else{
			return res.status(200).send(test);
		}
	});
});

router.get('/testmongo/find/:uname',function(req,res,next){
	var uname = req.params.uname;
	//var testInstance = new testModel();
	//testInstance.find(uname,function(result){
	//	if(result.hasOwnProperty(('name'))){
	//		res.status(200).send(result['name']);
	//	}else{
	//		console.log('no property name');
	//		res.status(200).send(result);
	//	};
	//});
	testModel.find({name:uname},function(err,doc){
		if(err) return console.log('find error');
		else if(!doc || doc.length == 0) return console.log('没有发现该用户');
		else res.send("name:"+doc[0].name+" ===== pwd:"+doc[0].pwd+" ===== sike:"+doc[0].sike);
	});
});

router.get('/testmongo/new',function(req,res,next){
	res.status(200).render('test/new',{test:new testModel()});
});

router.post('/testmongo/new',function(req,res,next){
	var name = req.body.name;
	var pwd = req.body.pass;
	if(!name || !pwd){
		return res.redirect('/testmongo/new');
	}else{
		var testInstance = new testModel(req.body);
		testInstance.pwd = pwd;
		testInstance.save(function(err){
			if(err){
				//console.log('保存失败：'+require('util').inspect(err.errors));
				//if(err.name == 'noke'){
				//	return res.send(err.message);
				//}
				return res.send('保存错误：'+err);
			}else{
				console.log('保存成功');
			}
			return res.redirect('/testmongo/all');
		});
		//var saveResult = testInstance.saveNew({name:name,pwd:pwd});
		//var util = require('util');
		//if(saveResult){
		//	console.log('保存成功:');
		//	return res.redirect('/testmongo/all');
		//}else{
		//	console.log('出现错误:');
		//	return res.redirect('/testmongo/all');
		//}

	}
});

router.get('/testmongo/virtual/:sike',function(req,res,next){
	var testInstance = new testModel();
	var sike = req.params.sike;
	testInstance.sike = sike;
	testInstance.save(function(err,doc){
		if(err) return console.log('save error:' + err);
		return res.send("name:"+doc['name']+" ===== pwd:"+doc['pwd']);
	});
});


var test2Model = require('../models/test2');
router.get('/test2add/:id/:title',function(req,res,next){
	var id = req.params.id;
	var title = req.params.title;
	if(!id || !title){
		return res.redirect('/test2/all');
	}else{
		var test2 = new test2Model({testid:id,title:title});
		test2.save(function(err){
			if(err) return res.send('save test2 error:'+err);
			return res.redirect('/test2/all');
		});
	}
});

router.get('/test2/all',function(req,res,next){
	//test2Model.find({},function(err,data){
	//	if(err){
	//		return res.send('error:'+err);
	//	}else{
	//		var hh = '';
	//		for(var item in data){
	//			hh += 'title:'+data[item].title+"\t"+"date:"+data[item].today+"\n";
	//		}
    //
	//		data[0].populate('testid').exec(function(err,followers){
	//			console.log(followers);
	//			hh += followers.toString();
	//			return res.send(hh);
	//		});
	//	}
	//});


	test2Model.find({},'',{title:{$ne:null}}).populate('testid').exec(function(err,data){
		if(err){
			return res.send('error:'+err);
		}else{
			var hh = '';
			for(var item in data){
				hh += 'title:'+data[item].title+"\t"+",date:"+data[item].today+"\t"+",name:"+data[item].testid.name+">>>>>"+data[item].testid.pwd+"\n";
			}
			return res.send(hh);
		}
	});
});

router.get('/test2/search',function(req,res,next){
	var q = req.query.q.trim();
	console.log("1、query:"+q);
	console.log("2、query:"+String.fromCharCode(q));
	if(!q){
		test2Model.find({},function(err,data){
			if(err) return res.send('error:'+err);
			return res.status(200).send(data);
		});
	}else{
		//var pattern = "/"+q+"/";
		//test2Model.find({title:{$regex:pattern,$options:'m'}},function(err,data){
		//	if(err) return res.send('error:'+err);
		//	return res.status(200).send(data);
		//});
		var query = {};
		if(q.indexOf(" ")>0){
			var words = q.split(" ");
			console.log("words:"+words);
			var orFind = [];
			for(var i in words){
				orFind.push({title:new RegExp(words[i])});
			}
			query = {"$or":orFind};
		}else{
			query = {title:new RegExp(q)};
		}
		test2Model.find(query,function(err,data){
			if(err) return res.send('error:'+err);
			return res.status(200).send(data);
		});
	}
});

var CityModel = require('../models/city');
router.get('/city/add/:name',function(req, res, next){
	var name = req.params.name;
	if(!name){
		return res.send("城市不能为空");
	}else{
		var city = new CityModel();
		city.name = name;
		city.isCity = true;
		city.save(function(err){
			if(err){
				return res.send('保存失败');
			}
			return res.redirect("/city/all");
		});
	}
});
router.get('/city/all',function(req, res, next){
	CityModel.find({},function(err,citys){
		if(err || !citys){
			return res.send("没有城市");
		}else{
			return res.send(citys);
		}
	});
});

var SchoolModel = require('../models/school');

router.get('/school/add/:name/:cityid',function(req, res, next){
	var name = req.params.name;
	var cityid = req.params.cityid;
	if(!name){
		return res.send("学校不能为空");
	}else if(!cityid){
		return res.send("城市id不能为空");
	}else{
		var school = new SchoolModel();
		school.schoolname = name;
		school.city = cityid;
		school.describe = "学校描述";
		school.location = "学校地址";
		school.save(function(err){
			if(err){
				return res.send('保存失败');
			}
			return res.redirect("/school/all");
		});
	}
});
router.get('/school/all',function(req, res, next){
	SchoolModel.find({},function(err,schools){
		if(err || !schools){
			return res.status(200).send("没有学校");
		}else{
			return res.status(200).send(schools);
		}
	});
});

var UserModel = require('../models/user');
router.get('/user/all',function(res,res,next){
	UserModel.myFind({},{},function(err,users){
		if(err || !users){
			return res.status(200).send("没有用户");
		}else{
			var resstr = "";
			for(var i in users){
				var item = users[i];
				resstr += "用户名："+item.username+">>>邮箱："+item.email+">>>手机号："+item.telphone+">>>是否通过验证："+item.confirm+">>>学校:"+item.school.schoolname+"<br/>\n";
			}
			return res.status(200).send(resstr);
		}
	});
});

router.get('/user/delete/:email',function(req,res,next){
	var email = req.params.email;
	if(!email) return res.send('email can not be blank');
	UserModel.remove({email:email},function(err,doc){
		if(err) return res.send('delete error!');
		return res.redirect('/user/all');
	});
});
//===============测试mongoDB==============

//var verifyCode = require('../services/verifyCode');
//router.get('code',function(req, res, next){
//	var code = verifyCode();
//	res.write(code[0]);
//	res.end(code[1]);
//});

//=============middleware===============
var isAuthenticated = function(req, res, next) {
  // if (req.isAuthenticated()) return next();
  next();
  res.redirect('/user/login');
};

router.get('/html',function(req,res,next){
	res.sendHtml('shop/test.html');
});

router.get('/mm',function(req,res,next){
	res.send("hello world");
});

/* GET home page. */
router.get('/index2', function(req, res, next) {
	return res.render('index2', { title: 'Express' });
});
/* GET index page. */
router.get('/index', function(req, res, next) {
	return res.render('index', { title: '这是网站的主页' });
});


function zhongjian(req,res,next){
	// if(!req.session.user){
	// 	res.status(200).send('对不起，您还未登录!');
	// 	next();
	// }
	next();
}

router.get('/tryupload',function(req,res,next){
	return res.status(200).render('try/upload');
});

router.post('/tryupload',function(req,res,next){
	console.log('============执行上传=============');
	myUpload.upload(req,res,{
		'uploadPath':conf.upload_goods_dir,
		'maxFieldsSize':2 * 1024 *1024
	},function(percent){ //onProgress
		console.log('上传了'+percent+"%");
	},function(file,saveFileName){ //onEnd
		console.log('上传结束');
		var srcPath = conf.upload_goods_dir+"\\"+saveFileName;
		var dstPath = conf.upload_goods_dir+"\\resize_"+saveFileName;
		return res.sendFile(srcPath);
	   	// myImage.resize(srcPath,dstPath,
	   	// 		{width:200,height:200,ignoreRatio:true},
	   	// 		function(){ //onSucess
	   	// 			console.log('重置图片尺寸成功');
	   	// 			return res.sendFile(dstPath);
	   	// 		},function(err){ //onError
	   	// 			console.log('重置图片尺寸发生错误:'+err);
	   	// 		});

		// gm(srcPath).resize(200,200,'!')
		// 		.write(dstPath,function (err) {
		// 	   	  if(err) {
		// 	   	  	console.log('resize image err:'+err);
		// 	   	  	res.end();
		// 	   	  }else{
		// 	   	  	console.log('resize image success!');
		// 			return res.sendFile(srcPath);
		// 		  }
		// 		});

		//return res.status(200).redirect('/admin');
	},function(err){  //onError
		console.log('上传出错：'+err);
	});
});

router.get('/login',signCtrl.showLogin);
router.post('/login',signCtrl.login);
router.get('/logout',signCtrl.logout);
router.get('/register',signCtrl.showRegister);
router.post('/register',signCtrl.register);
router.get('/regsuccess',signCtrl.regsuccess);

router.get('/',indexCtrl.index);
router.get('/search',searchCtrl.search);
router.get('/users',userCtrl.index);
router.get('/user',userCtrl.userSpace);
router.get('/myspace',userCtrl.mySpace);
router.post('/user/follow',authMiddleware.authAjax,followCtrl.followSomebody);	//关注某人
router.post('/user/cancelFollow',authMiddleware.authAjax,followCtrl.cancelFollowSomebody);	//取消关注某人

router.post('/getnotify',authMiddleware.authAjax,notifyCtrl.fetchNotifications);
router.post('/setreaded',authMiddleware.authAjax,notifyCtrl.setReaded);
router.post('/setreadedall',authMiddleware.authAjax,notifyCtrl.setReadedAll);

//router.post('/getcartnumber',authMiddleware.authAjax,shopCartCtrl.fetchShopCartNumber);	//获取购物车的数量

router.get('/user/:uid/album',albumCtrl.index);	//某用户的全部相册列表
router.get('/user/:uid/album/:albumid',albumCtrl.showAlbum);	//某用户的某相册主页

router.get('/store',storeCtrl.index);
router.get('/store/:storeid',storeCtrl.showStore);
router.post('/store/favorite',authMiddleware.authAjax,followCtrl.collectStore);	//收藏店铺
router.post('/store/cancelFavorite',authMiddleware.authAjax,followCtrl.cancelCollectStore);	//取消收藏店铺

router.get('/good/:goodid',goodCtrl.showGood);	//商品主页
router.post('/good/favorite',authMiddleware.authAjax,followCtrl.collectGood);	//收藏商品
router.post('/good/cancelFavorite',authMiddleware.authAjax,followCtrl.cancelCollectGood);	//取消收藏商品
router.post('/good/comment',authMiddleware.authAjax,commentCtrl.commentGood);	//评论商品
router.post('/good/fetchComment',commentCtrl.fetchGoodCommentsByPage);	//Ajax分页获取商品的评论

router.get('/askbuy',askbuyCtrl.index);	//求购模块主页
router.get('/askbuy/:askid',askbuyCtrl.showAskbuy);

router.get('/topic',topicCtrl.index);
router.get('/topic/:topicid',topicCtrl.showTopic);
router.post('/topic/follow',authMiddleware.authAjax,followCtrl.followTopic);	//关注某话题
router.post('/topic/cancelFollow',authMiddleware.authAjax,followCtrl.cancelFollowTopic);	//取消关注某话题

router.post('/comment/reply',authMiddleware.authAjax,commentCtrl.replyTheComment);	//回复某一评论
router.post('/comment/like',authMiddleware.authAjax,commentCtrl.likeComment);	//赞某一评论
router.post('/comment/delete',authMiddleware.authAjax,commentCtrl.deleteComment);	//删除某一评论

module.exports = router;
