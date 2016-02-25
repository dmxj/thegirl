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
