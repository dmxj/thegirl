var AlbumModel = require('../models/album');

//根据ID获取一个相册
exports.getAlbumById = function (id, callback)
{
    if (!id) {
        return callback('id is empty',null);
    }
    AlbumModel.myFindOne({_id: id}, {},callback); //合法相册
};

//根据查询条件获取一组相册
exports.getAlbumsByQuery = function (query, opt, callback) {
    var _query = merge(query,{is_delete:false});
    AlbumModel.myFind(_query, opt || {}, callback);
};

//分页获取用户
exports.divderPageGetAlbums = function(index,perpage,query,option,callback)
{
    var _query = merge(query,{is_delete:false});
    var _option = merge(option,{limit:perpage,skip:(index-1)*perpage});
    exports.getAlbumsByQuery(_query,_option,callback);
};