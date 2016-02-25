var moment = require('moment');
var validator = require('validator');

moment.locale('zh-cn'); // 使用中文

// 格式化时间
exports.formatDate = function (date, friendly) {
  date = moment(date);

  if (friendly) {
    return date.fromNow();
  } else {
    return date.format('YYYY-MM-DD HH:mm');
  }
};

//是否过了昨天此时
exports.isPassedYesterday = function(date){
  return moment().isAfter(moment(date),'day');
};

//计算星座
exports.getStar = function(month,day)
{
  var starStr = "摩羯水瓶双鱼白羊金牛双子巨蟹狮子处女天秤天蝎射手摩羯";
  var starDay = [20,19,21,21,21,22,23,23,23,23,22,22];
  return starStr.substr(month*2-(day<starDay[month-1]?2:0),2);
};

//计算年龄
exports.getAge = function(birthday)
{
   if(!validator.isDate(birthday)){
     return 0;
   }
   return Math.max(new Date().getFullYear() - birthday.getFullYear(),0);
};