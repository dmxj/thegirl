var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');

/**
 * 求购集合
 */
var AskBuySchema = new Schema({
    author:{type:Schema.Types.ObjectId,ref:'User'}, //作者
    title:{type:String,trim:true,default:''},
    describe:{type:String,trim:true,default:''},
    pictures:[{type:String,trim:true,default:''}],  //图片集
    willPay:{
        price:{
            minPrice:{type:Number,default:0},  //理想最低价格
            maxPrice:{type:Number,default:0},  //理想最高价格
        },
        condition:{type:String,trim:true,default:''},   //条件
    },  //愿意出价

    mayScope:{type:Schema.Types.ObjectId,ref:'SellScope',default:null},  //理想销售范围[本校，本区，本市，本省，不限]
    fans:[{type:Schema.Types.ObjectId,ref:'User'}],     //收藏的用户们
    result:{
        is_find:{type:Boolean,default:false}, //是否已经完成,求购结束
        endsay:{type:String,default:'',trim:true},  //完成后说的话
    },
    is_delete:{type:Boolean,default:false}, //是否被作者删除
    is_valid:{type:Boolean,default:true},  //合法的店铺，不违反规定
    visitCount:{type:Number,default:0,max:100}, //被查看次数
    create_at:{type:Date,default:Date.now},
    update_at:{type:Date,default:Date.now}
},{collection:'askbuys'});

var NotNullRule = [
    {col:'author',msg:'求购的作者不能为空'},
    {col:'title',msg:'求购的标题不能为空'},
    {col:'describe',msg:'求购的描述不能为空'},
];

var AskBuyRule = {
    title:{
        min:1,
        max:20,
        ruleType:ruleType.STRLEN,
        msg:"求购的标题长度在1~20个字符之间"
    },
    describe:{
        min:10,
        max:400,
        ruleType:ruleType.STRLEN,
        msg:"求购的内容长度在10~400个字符之间"
    },

};

AskBuySchema.virtual('status')
    .get(function(){
        return result.is_find ? "求购成功！" : "求购进行中";
    });

AskBuySchema.virtual('collectionCount')
    .get(function(){
        return this.fans.length;
    });

AskBuySchema.virtual('hotlevel')
    .get(function(){
        return this.visitCount + this.collectionCount * 6;
    });

AskBuySchema.methods = {};
AskBuySchema.statics = {};

baseSchemaMethod.regBeforeSave(AskBuySchema,NotNullRule,AskBuyRule);
baseSchemaMethod.regMyfind(AskBuySchema,'AskBuy',"author mayScope followers");
baseSchemaMethod.regSearchResultShow(AskBuySchema,["title","describe"]);
baseSchemaMethod.regViewCountAdd(AskBuySchema,'visitCount');

module.exports = mongoose.model('AskBuy',AskBuySchema);