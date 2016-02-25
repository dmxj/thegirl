var NotifyModel = require('../models/notification');

exports.getNotificationsByUid = function(uid,callback)
{
    NotifyModel.find({user:uid,readed:false},callback);
};

exports.setNotifyReadedById = function(id,callback){
    NotifyModel.findOneAndUpdate({_id:id},{
        $set:{readed:true}
    },callback);
};

exports.setNotifyReadedAll = function(uid,callback){
    NotifyModel.findOneAndUpdate({user:uid},{
        $set:{readed:true}
    },callback);
};