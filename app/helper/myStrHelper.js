var uid = require('uid-safe').sync;

exports.isNull = function(str){
    return !str || str.trim() == "";
};

exports.trimLeft = function(str,find){
    if(!str)
        return "";

    if(!find)
        return str.trimLeft();

    var s = str;
    while(str.indexOf(find) == 0){
        s = str.substr(find.length);
    }
    return s;
};

exports.trimRight = function(str,find){
    if(!str)
        return "";

    if(!find)
        return str.trimRight();

    return str.substr(0,str.indexOf(find));
};

exports.trim = function(str,find){
    return exports.trimRight(exports.trimLeft(str,find),find);
}

/**
 * 使用replaceStr替换sourceStr中的findStr
 * @param sourceStr
 * @param findStr
 * @param replaceStr
 */
exports.replace = function(sourceStr,findStr,replaceStr){
    var str =sourceStr;
    while(sourceStr.indexOf(findStr) >= 0){
        str = sourceStr.replace(findStr,replaceStr);
    }
    return str;
}

//生成uuid
exports.uuid = function(len){
    var num = len || 6;
    //return uid(num);

    var all = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var result = "";
    for(var i=0;i<num;i++){
        var randomChar = all[Math.min(Math.floor(Math.random() * all.length),all.length - 1)];
        result += randomChar;
    }

    return result;
}

