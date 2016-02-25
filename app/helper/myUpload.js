var formidable = require('formidable');
var conf = require('../../bin/config/config');
var myHash = require('./myHash');
var util = require('util');
var fs = require("fs");

function upload(req,res,options,onProgress,onEnd,onError){
	var opt = options || {};
	var file , saveFileName ;
	var isUploadEnd = false , isRenameEnd = false;
	var form = new formidable.IncomingForm();

	form.encoding = 'utf-8';
	form.keepExtensions = true;

	if(opt.hasOwnProperty('uploadPath'))
		form.uploadDir = opt['uploadPath'];
	else
		form.uploadDir = conf.upload_default_dir;

	if(opt.hasOwnProperty('maxFieldsSize'))
		form.maxFieldsSize = opt['maxFieldsSize'];
	else
		form.maxFieldsSize = 2 * 1024 *1024; //默认2M

	form.parse(req, function(err, fields, files) {
	   console.log(util.inspect({fields: fields, files: files}));
	   var fileField = Object.keys(files)[0];
	   file = files[fileField];
	   var types = file.name.split('.');
	   var fileExt = types[types.length-1];
	   var ms = Date.parse(new Date());
	   saveFileName = ms+"."+fileExt;
	   fs.rename(file.path, form.uploadDir+"/"+saveFileName,function(){
	   		isRenameEnd = true;
	   		if(isUploadEnd)
	   			onEnd&&onEnd(file,saveFileName);	   		
	   });	   
	});

	//开始上传
   form.on('fileBegin', function(name, file) {
   		console.log('开始上传...');
   });

   //发生错误
   form.on('error', function(err) {
   		onError&&onError(err);
   		console.log('上传出错..aborted');
   });

   //上传被中断或取消
   form.on('aborted', function() {
   		console.log('上传中断..aborted');
   });

   //上传进度...
   form.on('progress', function(bytesReceived, bytesExpected) {
   		var percent = bytesReceived * 1.0 / bytesExpected * 100;
   		percent = Math.floor(percent);
   		//onProgress&&onProgress(percent);
   });

   //上传结束...
   form.on('end', function() {
   		isUploadEnd = true;
   		if(isRenameEnd)
   			onEnd&&onEnd(file,saveFileName);
   });
	
}

exports.upload = upload;