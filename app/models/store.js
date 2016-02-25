var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');

/**
 * 店铺集合
 */
var StoreSchema = new Schema({
    boss:{type:Schema.Types.ObjectId,ref:'User'},
    storename:{type:String,trim:true,default:''},   //店铺名
    describe:{type:String,trim:true,default:''},    //描述
    avatar:{type:String,trim:true,default:''},
    goods:[{type:Schema.Types.ObjectId,ref:'Good'}],    //所有的商品

    coupons:[{type:Schema.Types.ObjectId,ref:'Coupon'}], //优惠券

    fans:[{type:Schema.Types.ObjectId,ref:'User'}], //收藏者
    comments:[{type:Schema.Types.ObjectId,ref:'Comment'}],
    credit:[{type:Schema.Types.ObjectId,ref:'Credit'}],  //积分
    score:{type:Number,default:0,max:100},  //评分
    visitCount:{type:Number,default:0,max:100}, //被查看次数
    inuse:{type:Boolean,default:true},  //是否在用
    is_valid:{type:Boolean,default:true},  //合法的店铺，不违反规定
    create_at:{type:Date,default:Date.now},
    update_at:{type:Date,default:Date.now}
},{collection:'stores'});

var NotNullRule = [
    {col:'boss',msg:'保存店铺出错，无法获取店铺卖家信息！'},
    {col:'storename',msg:'店铺名不能为空'},
    {col:'describe',msg:'店铺的描述不能为空'},
];

var StoreRule = {
    storename:{
        min:1,
        max:20,
        ruleType:ruleType.STRLEN,
        msg:"店铺名长度在1~20个字符之间"
    },
    describe:{
        min:10,
        ruleType:ruleType.STRLEN,
        msg:"店铺描述必须大于10个字符"
    },
    score:{
        min:0,
        max:100,
        ruleType:ruleType.NUMVAL,
        msg:"店铺的评分必须大于等于0分，小于等于100分"
    },
};

StoreSchema.virtual('collectionCount')
    .get(function(){
        return this.followers.length;
    });

StoreSchema.virtual('goodCount')
    .get(function(){
        return this.goods.length;
    });

StoreSchema.virtual('school')
    .get(function(){
        return this.boss.school;
    });

StoreSchema.virtual('uservalid')
    .get(function(){
       return this.boss.confirm;
    });

StoreSchema.virtual('hotlevel')
    .get(function(){
        return this.visitCount + this.collectionCount * 6;
    });

StoreSchema.methods = {

};
StoreSchema.statics = {

};

baseSchemaMethod.regBeforeSave(StoreSchema,NotNullRule,StoreRule);
baseSchemaMethod.regMyfind(StoreSchema,'Store','boss goods fans comments credit');
baseSchemaMethod.regSearchResultShow(StoreSchema,["storename","describe"]);

module.exports = mongoose.model('Store',StoreSchema);