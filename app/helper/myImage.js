var fs = require('fs'),
	gm = require('gm').subClass({imageMagick: true});

function resize(srcPath,dstPath,option,onSucess,onError)
{
	var opt = option || {};
	var handler = gm(srcPath);
	var width = 100 , height = 100;
	if(opt.hasOwnProperty('width') && opt.hasOwnProperty('height'))
	{
		width = opt['width'];
		height = opt['height'];
	}

	if(opt.hasOwnProperty('ignoreRatio') && opt['ignoreRatio'])
	{
		handler.resize(width,height);			 
	}else{
		handler.resize(width,height,'!');
	}

	if(opt['removeSrc'])
		handler.noProfile();

	handler.write(dstPath,function (err) {
				  console.log('resize error:'+err);
			   	  if(err && onError) onError(err);
				  if (!err && onSucess) onSucess();
				});
}

function getSize(path,onSucess,onError)
{
	gm(path)
	.size(function (err, size) {
		if(err && onError)
			onError(err);
  		if (!err && onSucess)
  			onSucess(size);
	});
}

function crop(srcPath,dstPath,option,onSucess,onError)
{
	var opt = option || {};
	var handler = gm(srcPath);
	var width = 100 , height = 100;
	var posx = 0 , posy = 0;

	if(opt.hasOwnProperty('width') && opt.hasOwnProperty('height'))
	{
		width = opt['width'];
		height = opt['height'];
	}


	if(opt.hasOwnProperty('posx') && opt.hasOwnProperty('posy'))
	{
		posx = opt['posx'];
		posy = opt['posy'];
	}

	handler.flip()
		   .magnify()
		   .crop(width, height, posx, posy)
		   .write(dstPath, function (err) {
		   	  if(err && onError) onError(err);
			  if(!err && onSucess) onSucess();
		   });
}

function rotate()
{

}

function makeIdentifyCode()
{

}

exports.resize = resize;
exports.getSize = getSize;
exports.crop = crop;
exports.rotate = rotate;
exports.makeIdentifyCode = makeIdentifyCode;
