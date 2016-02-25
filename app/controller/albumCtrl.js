var Models = require('../models');
var UserModel = Models.User,
    AlbumModel = Models.Album,
    PhotoModel = Models.Photo;

var UserProxy = require('../proxy/user');
var AlbumProxy = require('../proxy/album');
var PhotoProxy = require('../proxy/photo');

var checkService = require('../services/check');

//显示空间中某用户的所有相册列表，相册模块的主页
exports.index = function(req,res,next){
    var uid = req.params.uid;
    var page = req.query.page;
    uid = uid?uid.trim().toLowerCase():null;
    page = page?Math.floor(parseInt(page.trim().toLowerCase())):1;

    if(!uid){   //跳转到自己的空间主页
        return res.redirect('/myspace');
    }

    var params = {"master":null};
    checkService.checkIsLogin(req,function(user){
        if(user && user._id == uid){    //如果访问的用户的相册是自己的相册

        }

        AlbumProxy.divderPageGetAlbums(page,20,{},{order:{create_at:-1}},function(err,albums){
            if(err || !albums){
                params.albums = null;
            }else{
                params.albums = albums;
            }

            return res.render200("user/album/index",params);
        });
    });
};

//显示空间中某用户的某相册，显示所有图片
exports.showAlbum = function(req,res,next){
    var uid = req.params.uid;
    var albumid = req.params.albumid;
    uid = uid?uid.trim().toLowerCase():null;
    albumid = albumid?albumid.trim().toLowerCase():null;

    if(!uid){   //跳转到自己的空间主页
        return res.redirect('/myspace');
    }

    if(!albumid){
        return res.redirect('/user/'+uid+'/album');
    }

    var params = {"master":null};
    checkService.checkIsLogin(req,function(user){
        var ismime = false;
        if(user && user._id == uid){    //如果访问的用户的相册是自己的相册
            ismime = true;
        }

        AlbumProxy.getAlbumById(albumid,function(err,album){
            if(err || !album || album.is_delete){
                return res.render200("user/album/deleted",{msg:'相册不存在或已被删除'});
            }

            if(album.author._id != uid){    //相册的用户id不是对应的用户的id
                return res.redirect('/user/'+uid+'/album');
            }

            if(!album.is_valid){
                return res.render200("user/album/invalid",{msg:'相册不合法'});
            }

            //允许用户浏览的相册的相册id不在session列表中，则跳转到回答题目页面
            if(!ismime)
                if(!res.session.albumPassList || res.session.albumPassList.indexOf(albumid) < 0){
                    return res.render200("user/album/question",{uid:uid,albumid:albumid,albumname:album.albumname,question:album.queStr,msg:null});
                }

            params.album = album;

            return res.render200("user/album/home",params);
        });

    });
};


//用户提交相册答案，为了获取浏览该相册的权利
exports.postAnwserToViewAlbum = function(req,res,next)
{
    var uid = req.params.uid;
    var albumid = req.params.albumid;
    var anwser = req.body.anwser;
    uid = uid?uid.trim().toLowerCase():null;
    albumid = albumid?albumid.trim().toLowerCase():null;
    anwser = anwser?anwser.trim().toLowerCase():null;

    if(!uid){   //跳转到自己的空间主页
        return res.redirect('/myspace');
    }

    if(!albumid){
        return res.redirect('/user/'+uid+'/album');
    }

    if(!anwser){
        return res.redirect('/user/'+uid+'/album/'+albumid);
    }

    checkService.checkIsLogin(req,function(user){
        if(user){
            return res.redirect('/user/'+uid+'/album/'+albumid);
        }

        AlbumProxy.getAlbumById(albumid,function(err,album) {
            if(err || !album || album.is_delete){
                return res.render200("user/album/deleted",{msg:'相册不存在或已被删除'});
            }

            if(album.author._id != uid){    //相册的用户id不是对应的用户的id
                return res.redirect('/user/'+uid+'/album');
            }

            if(!album.is_valid){
                return res.render200("user/album/invalid",{msg:'相册不合法'});
            }

            if(anwser == album.encrypt.anwser) {    //回答正确
                res.session.albumPassList.push(albumid);
                return res.redirect('/user/' + uid + '/album/' + albumid);
            }else{  //回答错误
                return res.render200("user/album/question",{uid:uid,albumid:albumid,albumname:album.albumname,question:album.queStr,msg:null});
            }
        });
    });
};
