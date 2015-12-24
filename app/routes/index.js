var express = require('express');
var router = express.Router();
var conf = require('../../bin/config');
var myUpload = require('../helper/myUpload');
var myImage = require('../helper/myImage');
var gm = require('gm').subClass({imageMagick: true});
var passport = require('passport');
var shopCtrl = require('../controller/shopCtrl');
var userCtrl = require('../controller/AccountCtrl');

//=============middleware===============
var isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/user/login');
};

/* GET home page. */
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Express' });
});

router.get('/test',zhongjian,shopCtrl.getMyShop);

function zhongjian(req,res,next){
	if(!req.session.user){
		res.status(200).send('对不起，您还未登录!');
		next();
	}
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

router.get('/user/login',userCtrl.login);
router.post('/user/login',userCtrl.loginPost);
router.get('/user/loginout',userCtrl.loginout);
router.get('/user/register',userCtrl.register);
router.post('/user/register',userCtrl.registerPost);
router.get('/user/space',isAuthenticated,userCtrl.space);



module.exports = router;
