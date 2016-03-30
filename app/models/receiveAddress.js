var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');
var TimeHelper = require('../helper/myTime');
var moment = require('moment');
moment.locale('zh-cn'); // 使用中文

/**
 * 收货地址，一个人最多可以创建20个
 */
var ReceiveAddressSchema = new Schema({
    author:{type:Schema.Types.ObjectId,ref:'User'},   //用户

    receiverName:{type:String,default:'',trim:true},    //收货人
    site:{type:Schema.Types.ObjectId,ref:'Site',default:null},    //地址
    detailAddress:{type:String,default:'',trim:true},    //详细地址
    telphoneNumber:{type:String,default:'',trim:true},    //手机号码

    email:{type:String,default:null,trim:true},    //邮箱
    addressAlias:{type:String,default:null,trim:true},    //地址别名

    create_at:{type:Date,default:Date.now},
    update_at:{type:Date,default:Date.now}
},{collection:'receiveaddress'});

var NotNullRule = [
    {col:'author',msg:'无法获取您的用户信息，请重新登录后重试'},
    {col:'receiverName',msg:'收货人姓名不能为空'},
    {col:'detailAddress',msg:'详细地址不能为空'},
    {col:'telphoneNumber',msg:'手机号码不能为空'},
];

var ReceiveAddressRule = {
    receiverName:{
        min:2,
        max:15,
        ruleType:ruleType.STRLEN,
        msg:"收货人姓名在2-15个字符之间"
    },
    detailAddress:{
        min:6,
        max:22,
        ruleType:ruleType.STRLEN,
        msg:"收货详细地址在6-22个字符之间"
    },
    telphoneNumber:{
        ruleType:ruleType.PHONE,
        msg:"手机号码格式不正确"
    },
    email:{
        ruleType:ruleType.EMAIL,
        msg:"邮箱格式不正确"
    },
    addressAlias:{
        min:2,
        max:8,
        ruleType:ruleType.STRLEN,
        msg:"地址别名在2-8个字符之间"
    },
};

ReceiveAddressSchema.methods = {

};

ReceiveAddressSchema.statics = {

};

ReceiveAddressSchema.plugin(deepPopulate,{});

baseSchemaMethod.regBeforeSave(ReceiveAddressSchema,NotNullRule,ReceiveAddressRule);
baseSchemaMethod.regPageQuery(ReceiveAddressSchema,'ReceiveAddress');

module.exports = mongoose.model('ReceiveAddress',TaskSchema);