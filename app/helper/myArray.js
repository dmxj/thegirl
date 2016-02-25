var util = require('util');
var validator = require('validator');

//数组删除元素
exports.removeElement = function(array,item)
{
    if(!array) return [];
    if(!util.isArray(array)) return [];
    if(!item || array.indexOf(item) < 0) return array;
    array.splice(array.indexOf(item),1);
    return array;
};

//数组删除元素及其后所有元素，返回删除掉的元素数组
exports.removeElementAndAfter = function(array,item)
{
    if(!array) return [];
    if(!util.isArray(array)) return [];
    if(!item || array.indexOf(item) < 0) return [];
    return array.splice(array.indexOf(item),array.length - array.indexOf(item));
};

//对于对象数组，根据对象中某一个属性，查找到该对象
exports.findObjByKey = function(array,attr,key)
{
    if(!array || util.isArray(array)) return null;
    for(var i=0;i<array.length;i++){
        if(array[i][attr] == key){
            return array[i];
        }
    }

    return null;
}


//对于对象数组，抽取出某一属性的值作为新数组并返回
exports.getAttrArray = function(array,attr)
{
    if(!array || util.isArray(array)) return null;
    var newArr = [];
    for(var i in array){
        var val = array[i][attr];
        if(val && typeof val != "undefined"){
            newArr.push(val);
        }
    }
    return newArr;
};

//对于对象数组，抽取出某一属性的值作为新数组并返回,值的类型必须是MongodbId
exports.getAttrArrayMongoId = function(array,attr)
{
    if(!array || util.isArray(array)) return null;
    var newArr = [];
    for(var i in array){
        var val = array[i][attr];
        if(val && typeof val != "undefined" && validator.isMongoId(val.toString())){
            newArr.push(val);
        }
    }
    return newArr;
};

//对于对象数组，抽取出某一属性的值作为新数组并返回,值的类型必须是数字
exports.getAttrArrayNumber = function(array,attr)
{
    if(!array || util.isArray(array)) return null;
    var newArr = [];
    for(var i in array){
        var val = array[i][attr];
        if(val && typeof val != "undefined" && validator.isNumeric(val)){
            newArr.push(val);
        }
    }
    return newArr;
};


//计算数组中所有数字之和
exports.getSumOfArray = function(array)
{
    var sum = 0;
    for(var num in array)
    {
        if(!validator.isNumeric(num)){
            return 0;
        }
        sum += num;
    }
    return sum;
};