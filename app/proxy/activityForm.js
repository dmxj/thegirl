var ActivityModel = require('../models/activity');
var ActivityFormModel = require('../models/activityForm');
var ArrayHelper = require('../helper/myArray');
var ObjectHelper = require('../helper/myObject');
var StrHelper = require('../helper/myStrHelper');
var FormType = require('../const/formType');
var validator = require('validator');
var util = require('util');

var formTypeArray = [];
for(var item in FormType){
    formTypeArray.push(FormType[item]);
}

//创建活动报名表
exports.createSignForm = function(formCreateData,callback)
{
   if(ObjectHelper.checkObjArrayHasNull(formCreateData)){
       return callback("参数类型有误，创建活动报名表失败！",null);
   }
   if(formCreateData.length > 20){
       return callback("最多可以创建20个表单项，请重新创建！",null);
   }

   var activityForm = new ActivityFormModel();
   var formObj = {};
   for(var i in formCreateData){
       var item = formCreateData[i];
       var itemType = parseInt(item.t,10);
       if(formTypeArray.indexOf(itemType) < 0){  //check type
          return callback("报名表的表单项类型不合法，请重新创建！",null);
       }
       if(!item.n){    //check name
           return callback("报名表的表单项名称不能为空，请重新创建！",null);
       }

       if(item.t == FormType.INPUT || item.t == FormType.TEXTAREA){
           if(item.min){
               formObj.minLength = item.min;
           }
           if(item.max){
               formObj.maxLength = item.max;
           }
       }else if(item.t == FormType.RADIO || item.t == FormType.CHECKBOX){
            if(!item.option || !util.isArray(item.option) || item.option.length <= 0){
                return callback(item.n + "的选项不能为空",null);
            }
       }

        formObj.key = StrHelper.uuid(6);
        formObj.name = item.n.toString().trim();
        formObj.type = itemType;
        formObj.tip = item.msg ? item.msg : "";
        formObj.options = item.option && item.option.length > 0 ? item.option : [];
        formObj.required = item.require === true ? true : false;

       activityForm.items.push(formObj);
   }
   activityForm.save(function(err){
       var errMsg = err ? (err.name == "RuleError" ? err.message : "发生错误，创建活动报名表失败！") : null;
       return callback(errMsg,activityForm);
   });
};


//检验用户提交报名表的表单的正误
exports.checkFormSubmit = function(formId,activityId,postData,callback)
{
    ActivityFormModel.findOne({_id:formId,activityId:activityId},function(err,activityForm){
        if(err || !activityForm){
            return callback("出现错误，未查找到活动报名表信息");
        }

        for(var key in postData){
            var item = ArrayHelper.findObjByKey(activityForm.items,"key",key);
            if(!item){
                return callback("发生错误，报名失败");
            }

            var postVal = postData[key];
            var itemName = item.name;
            if(item.required && !postVal){
                return callback(itemName + "不能为空，请检查重填！");
            }
            if(item.type == FormType.DATE && !validator.isDate(postVal)){
                return callback(itemName + "不是正确的日期格式，请检查重填！");
            }
            if(item.type == FormType.EMAIL && !validator.isEmail(postVal)){
                return callback(itemName + "不是正确的邮箱格式，请检查重填！");
            }
            if(item.type == FormType.NUMBER && !validator.isNumeric(postVal)){
                return callback(itemName + "不是正确的数字格式，请检查重填！");
            }
            if(item.type == FormType.PHONE && !validator.isMobilePhone(postVal)){
                return callback(itemName + "不是正确的手机号格式，请检查重填！");
            }
            if(item.type == FormType.INPUT || item.type == FormType.TEXTAREA){
                if(postVal.length < item.minLength || postVal.length > item.maxLength){
                    return callback(itemName + "必须在" + item.minLength + "~" + item.maxLength + "个字符之间，请检查重填！");
                }
            }
            if(item.type == FormType.RADIO || item.options.indexOf(postVal) < 0){
                return callback(itemName + "的选择不在选项范围内，请重新选择");
            }
        }

        return callback(null);

    });
};