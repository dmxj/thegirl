// ResMethod middleware
exports.ResMethod = function (req, res, next) {

    console.log("执行了ResMethod...");

    res.sendHtml = function(path,option){
        var _option = option || {};
        return res.status(200).sendFile(join(join(conf.root,'app/html'),path),_option);
    }

    res.render200 = function(path,option){
        var _option = option || {};
        return res.status(200).render(path,_option);
    }

    res.renderCountDown = function(msg,seconds,redirectUrl){
        var params = {};
        params.msg = msg ? msg : "操作有误，正在等候跳转";
        params.seconds = seconds ? seconds : 5;
        params.url = redirectUrl ? redirectUrl : "/";
        return res.status(404).render("unusual/countDown",params);
    }

    res.renderDelete = function(msg){
        var params = msg ? {msg:msg} : {msg:"资源已被删除，请浏览其他资源"};
        return res.status(404).render("unusual/deleted",params);
    }

    res.renderInvalid = function(msg){
        var params = msg ? {msg:msg} : {msg:"资源不合法，请浏览其他资源"};
        return res.status(404).render("unusual/invalid",params);
    }

    res.charset = "utf-8";

    next();
};

function merge(obj, defaults) {
    obj = obj || {};
    for (var key in defaults) {
        if (typeof obj[key] === 'undefined') {
            obj[key] = defaults[key];
        }
    }
    return obj;
}
