var util = require('util');
function merge(obj, defaults) {
    obj = obj || {};
    for (var key in defaults) {
        if (typeof obj[key] === 'undefined') {
            obj[key] = defaults[key];
        }
    }
    return obj;
}

function checkIsNull(obj){
    return obj == null || typeof obj !== "object" || Object.keys(obj) == false;
}

function checkObjArrayHasNull(objArr){
    if(!objArr || !util.isArray(objArr) || objArr.length <= 0)
        return true;

    var hasNull = false;
    objArr.forEach(function(item){
        if(checkIsNull(item)) {
            hasNull = true;
            return true;
        }
    });
    return hasNull;
}

exports.merge = merge;
exports.checkIsNull = checkIsNull;
exports.checkObjArrayHasNull = checkObjArrayHasNull;