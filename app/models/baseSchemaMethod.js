var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var ArrayHelper = require('../helper/myArray');
var ruleType = require('../const/ruleType');
var moment = require('moment');
var validator      = require('validator');
var util = require('util');
var async = require('async');

moment.locale('zh-cn'); // 使用中文

//判断变量是属性，而且属性的长度不为0
function goodObj(obj){
    if(typeof obj === "object" && Object.getOwnPropertyNames(obj).length > 0){
        return true;
    }
    return false;
}

//空值检验
function checkIsNull(schema,notnull){
    var error = new Error('something wrong when you do some save');
    error.name = "RuleError";
    if(notnull && notnull.length > 0){
        for(var i=0;i<notnull.length;i++){
            if(notnull[i].hasOwnProperty('col')) {
                var item = notnull[i];
                var destCol = schema[item['col']];
                var errorMsg = item.msg ? item.msg : item['col'] + "不能为空";
                if(util.isArray(destCol) && destCol.length <= 0){
                    error.message = errorMsg;
                    return error;
                }
                if(!destCol || !destCol.toString().trim()){
                    error.message = errorMsg;
                    return error;
                }
            }
        }
    }
    return null;
}

//字符串长度检验
function checkStrLength(itemCol,destCol,colName){
    var error = new Error('something wrong when you do some save');
    error.name = "RuleError";
    var errorMsg = itemCol.msg ? itemCol.msg : colName + "的长度不符合规定";
    if (itemCol.hasOwnProperty('min') && destCol.length < itemCol.min) {
        error.message = errorMsg;
        return error;
    }
    if (itemCol.hasOwnProperty('max') && destCol.length > itemCol.max) {
        error.message = errorMsg;
        return error;
    }

    return null;
}

//数值大小校验
function checkNumberVal(itemCol,destCol,colName){
    var error = new Error('something wrong when you do some save');
    error.name = "RuleError";
    var errorMsg = itemCol.msg ? itemCol.msg : colName + "的大小不符合规定";
    if (itemCol.hasOwnProperty('min') && destCol < itemCol.min) {
        error.message = errorMsg;
        return error;
    }
    if (itemCol.hasOwnProperty('max') && destCol > itemCol.max) {
        error.message = errorMsg;
        return error;
    }

    return null;
}

//网址校验
function checkWebsite(itemCol,destCol,colName){
    var error = new Error('something wrong when you do some save');
    error.name = "RuleError";
    var errorMsg = itemCol.msg ? itemCol.msg : colName + "不是合法的网址";
    if(!validator.isURL(destCol)){
        error.message = errorMsg;
        return error;
    }
    return null;
}

//邮箱校验
function checkEmail(itemCol,destCol,colName){
    var error = new Error('something wrong when you do some save');
    error.name = "RuleError";
    var errorMsg = itemCol.msg ? itemCol.msg : colName + "不是合法的邮箱";
    if(!validator.isEmail(destCol)){
        error.message = errorMsg;
        return error;
    }
    return null;
}

//数组长度校验
function checkArrayLen(itemCol,destCol,colName){
    var error = new Error('something wrong when you do some save');
    error.name = "RuleError";
    var errorMsg = itemCol.msg ? itemCol.msg : colName + "的数量不符合规定";
    if(itemCol.hasOwnProperty('lengthMin') && !util.isArray(destCol) || destCol.length < itemCol.lengthMin){
        error.message = errorMsg;
        return error;
    }

    if(itemCol.hasOwnProperty('lengthMax') && !util.isArray(destCol) || destCol.length > itemCol.lengthMax){
        error.message = errorMsg;
        return error;
    }
    return null;
}

//数组包含校验
function checkArrayIn(itemCol,destCol,colName){
    var error = new Error('something wrong when you do some save');
    error.name = "RuleError";
    var errorMsg = itemCol.msg ? itemCol.msg : colName + "的数量不符合规定";
    if(itemCol.hasOwnProperty('array') && itemCol.array.indexOf(destCol) < 0){
        error.message = errorMsg;
        return error;
    }
    return null;
}

//数组重复性校验
function checkArrayUnique(itemCol,destCol,colName)
{
    var error = new Error('something wrong when you do some save');
    error.name = "RuleError";

    var errorMsg = itemCol.msg ? itemCol.msg : colName + "不能存在重复的内容";
    if(ArrayHelper.isRepeatInArray(destCol)){
        error.message = errorMsg;
        return error;
    }
    return null;
}

//日期之前校验
function checkBeforeNow(itemCol,destCol,colName){
    var error = new Error('something wrong when you do some save');
    error.name = "RuleError";
    var errorMsg = itemCol.msg ? itemCol.msg : colName + "必须在此刻之前";
    var destDate = null;

    if(!validator.isDate(destCol)){
        error.message = "不是正确的日期格式";
        return error;
    }

    if(itemCol.hasOwnProperty("day")){
        destDate = moment().add(itemCol.day,"d");  //itemCol.day天之前
    }
    if(itemCol.hasOwnProperty("hour")){
        destDate = moment().add(itemCol.hour,"h");  //itemCol.hour小时之前
    }
    if(itemCol.hasOwnProperty("minute")){
        destDate = moment().add(itemCol.minute,"m");  //itemCol.minute分钟之前
    }
    if(!destDate){
        destDate = moment();
    }

    console.log("moment(destCol):"+moment(destCol));
    console.log("destDate:"+destDate);

    if(moment(destCol).diff(destDate,"second",true) > 2){ //如果时间超过了预定的最晚时间,2秒容忍度
        error.message = errorMsg;
        return error;
    }
    return null;
}

//日期之后校验
function checkAfterNow(itemCol,destCol,colName){
    var error = new Error('something wrong when you do some save');
    error.name = "RuleError";
    var errorMsg = itemCol.msg ? itemCol.msg : colName + "必须在此刻之后";
    var destDate = null;

    if(!validator.isDate(destCol)){
        error.message = "不是正确的日期格式";
        return error;
    }

    if(itemCol.hasOwnProperty("day")){
        destDate = moment().add(itemCol.day,"d");  //itemCol.day天之后
    }
    if(itemCol.hasOwnProperty("hour")){
        destDate = moment().add(itemCol.hour,"h");  //itemCol.hour小时之后
    }
    if(itemCol.hasOwnProperty("minute")){
        destDate = moment().add(itemCol.minute,"m");  //itemCol.minute分钟之后
    }
    if(!destDate){
        destDate = moment();
    }

    if(destDate.diff(moment(destCol),"second",true) > 2){ //如果时间超过了预定的最晚时间,2秒容忍度
        error.message = errorMsg;
        return error;
    }
    return null;
}


/**
 * 为模型制作保存前操作
 * 比如：限定字符串长度，限定数字大小，
 * notnull保存不能为空的字段的集合
 * notnull:[
 *    {col:"title",msg:"求购标题不能为空"},
 *    {col:"describe",msg:"求购内容不能为空"}
 * ],
 * rule规定限定规则，如：
 * {
 *      colname:{
 *              msg:'密码长度必须在6~20个字符之间',
 *              ruleType:ruleType.STRLEN,
 *              min:6,
 *              max:20,
 *      },
 *      colname2:{
 *              ruleType:ruleType.NUMVAL,
 *              min:1,
 *              max:100,
 *              msg:'打分数值必须大于1小于100',
*       },
 * }
 * @param schema
 * @param notnull  不能为空的字段集合
 * @param rule  规定一些字段的保存规则
 * @param create_at  创建时的时期
 * @param update_at  更新时的时期
 */
exports.regBeforeSave = function(schema,notnull,rule,create_at,update_at){
    schema.pre('save',function(next){
        if(this.isNew && create_at){    //创建
            this[create_at] = Date.now();
        }
        if(!this.isNew && update_at){  //更新
            if(update_at.col && update_at.col.length > 0){  //指定这些字段之一更新时才更改update_at字段
                for(var i = 0 ; i < update_at.col.length;i++){
                    if(this.modify(update_at.col[i])){
                        this[update_at] = Date.now();
                    }
                }
            }else{
                this[update_at] = Date.now();
            }
        }

        if((!notnull || notnull.length <= 0) && !goodObj(rule)){
            return next();
        }

        var error = new Error('something wrong when you do some save');
        error.name = "RuleError";

        //if(notnull && notnull.length > 0){
        //    for(var i=0;i<notnull.length;i++){
        //        if(notnull[i].hasOwnProperty('col')) {
        //            var errorMsg = notnull[i].msg ? notnull[i].msg : notnull[i]['col'] + "不能为空";
        //            if(!this[notnull[i]['col']] || !this[notnull[i]['col']].toString().trim()){
        //                error.message = errorMsg;
        //                return next(error);
        //            }
        //        }
        //    }
        //}
        checkIsNull(this,notnull);

        if(goodObj(rule)) {
            for (var col in rule) {
                //var emptyArr = util.isArray(this[col]) && this[col].length <= 0;
                if (goodObj(rule[col]) && rule[col].hasOwnProperty('ruleType')) {

                    if(rule[col].hasOwnProperty('isNew') && rule[col].isNew === true && !this.isNew){
                        continue;
                    }

                    var destCol = this[col];
                    if(!util.isArray(this[col]) || rule[col].ruleType == ruleType.ARRAYlEN || rule[col].ruleType == ruleType.ARRAYIN || rule[col].ruleType == ruleType.ARRAYUNIQUE){   //集合列项不是数组
                        destCol = this[col];
                    }else if(util.isArray(this[col]) && this[col].length > 0){ //集合列项是数组且长度大于0
                        destCol = this[col][this[col].length - 1];
                    }

                    if(!destCol){
                        continue;
                    }

                    switch(rule[col].ruleType){
                        case ruleType.STRLEN:
                            var result = checkStrLength(rule[col],destCol,col);
                            if(result) return next(result);
                            break;
                        case ruleType.NUMVAL:
                            var result = checkNumberVal(rule[col],destCol,col);
                            if(result) return next(result);
                            break;
                        case ruleType.WEBSITE:
                            var result = checkWebsite(rule[col],destCol,col);
                            if(result) return next(result);
                            break;
                        case ruleType.EMAIL:
                            var result = checkEmail(rule[col],destCol,col);
                            if(result) return next(result);
                            break;
                        case ruleType.ARRAYLEN:
                            var result = checkArrayLen(rule[col],destCol,col);
                            if(result) return next(result);
                            break;
                        case ruleType.ARRAYIN:
                            var result = checkArrayIn(rule[col],destCol,col);
                            if(result) return next(result);
                            break;
                        case ruleType.ARRAYUNIQUE:
                            var result = checkArrayUnique(rule[col],destCol,col);
                            if(result) return next(result);
                            break;
                        case ruleType.DATEBEFORE:
                            var result = checkBeforeNow(rule[col],destCol,col);
                            if(result) return next(result);
                            break;
                        case ruleType.DATEAFTER:
                            var result = checkAfterNow(rule[col],destCol,col);
                            if(result) return next(result);
                            break;
                    }

                    //if (rule[col].ruleType == ruleType.STRLEN) {  //如果是字符长度限制
                    //    var errorMsg = rule[col].msg ? rule[col].msg : col + "的长度不符合规定";
                    //    if (rule[col].hasOwnProperty('min') && destCol.length < rule[col].min) {
                    //        error.message = errorMsg;
                    //        return next(error);
                    //    }
                    //    if (rule[col].hasOwnProperty('max') && destCol.length > rule[col].max) {
                    //        error.message = errorMsg;
                    //        return next(error);
                    //    }
                    //} else if (rule[col].ruleType == ruleType.NUMVAL) {    //如果是数值限制
                    //    var errorMsg = rule[col].msg ? rule[col].msg : col + "的大小不符合规定";
                    //    if (rule[col].hasOwnProperty('min') && destCol < rule[col].min) {
                    //        error.message = errorMsg;
                    //        return next(error);
                    //    }
                    //    if (rule[col].hasOwnProperty('max') && destCol > rule[col].max) {
                    //        error.message = errorMsg;
                    //        return next(error);
                    //    }
                    //} else if (rule[col].ruleType == ruleType.WEBSITE) {
                    //    var errorMsg = rule[col].msg ? rule[col].msg : col + "不是合法的网址";
                    //    if(!validator.isURL(destCol)){
                    //        error.message = errorMsg;
                    //        return next(error);
                    //    }
                    //} else if (rule[col].ruleType == ruleType.ARRAYlEN) {
                    //    var errorMsg = rule[col].msg ? rule[col].msg : col + "的数量不符合规定";
                    //    if(rule[col].hasOwnProperty('lengthMin') && !util.isArray(destCol) || destCole.length < rule[col].lengthMin){
                    //        error.message = errorMsg;
                    //        return next(error);
                    //    }
                    //
                    //    if(rule[col].hasOwnProperty('lengthMax') && !util.isArray(destCol) || destCole.length > rule[col].lengthMax){
                    //        error.message = errorMsg;
                    //        return next(error);
                    //    }
                    //}
                }
            }
        }

        next();
    });
};

exports.regMyfind = function(schema,model,cols){
    schema.statics.myFindOne = function(query,opt,callback){
        var _query = query || {};
        var _opt = opt || {};
        this.model(model).findOne(_query,'',_opt).populate(cols).exec(callback);
    };
    schema.statics.myFind = function(query,opt,callback){
        var _query = query || {};
        var _opt = opt || {};
        this.model(model).find(_query,'',_opt).populate(cols).exec(callback);
    };
};

exports.regSearchResultShow = function(schema,cols)
{
    schema.methods.showSearchThe = function(col,key){   //显示搜索后的内容
        if(!this[col]) return "";
        if(key == null || typeof key == 'undefined') return this[col];
        if(!cols || cols.indexOf(col) >= 0){
            return this[col].replace(key,"<strong class='red'>"+key+"</strong>");
        }

        return this[col];
    };
};

exports.regViewCountAdd = function(schema,colname)
{
    schema.methods.incrViewCount = function(callback){
        if(this[colname] < 99999999){    //如果小于1亿
            this[colname] = this[colname] + 1;
            this.save(callback);
        }
    }
};

exports.regPageQuery = function(schema,ModelName)
{
    //var Model = mongoose.model(ModelName,schema);
    schema.plugin(deepPopulate,{});
    schema.statics.pageQuery = function(page, pageSize,populate, queryParams, sortParams, callback){
        var Model = this.model(ModelName);
        var $page = {
            pageNumber: page
        };

        if(page < 1 || pageSize < 1){
            return callback('page or pageSize cannot less than 1',null);
        }
        var start = (page - 1) * pageSize;

        async.parallel({
            count: function (done) {  // 查询数量
                Model.count(queryParams).exec(function (err, count) {
                    done(err, count);
                });
            },
            records: function (done) {   // 查询一页的记录
                Model.find(queryParams).skip(start).limit(pageSize).deepPopulate(populate).sort(sortParams).exec(function (err, doc) {
                    done(err, doc);
                });
            }
        }, function (err, results) {
            var count = results.count;
            if(count<1){
                return callback(err, null);
            }
            $page.pageCount = count % pageSize == 0 ? count / pageSize : Math.floor(count / pageSize) + 1;
            $page.results = results.records;
            return callback(err, $page);
        });
    }
};