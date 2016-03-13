var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');

/**
 * 商品集合
 */
var GoodSchema = new Schema({
    boss:{type:Schema.Types.ObjectId,ref:'User'},   //发布者
    store:{type:Schema.Types.ObjectId,ref:'Store'}, //店铺
    goodname:{type:String,default:'',trim:true},    //商品名
    cover:{type:String,default:'',trim:true},   //商品封面
    album:[{type:String,default:'',trim:true}],    //商品图册
    detail:{type:String,default:'',trim:true},    //商品详情
    price:{type:Number,default:null},  //商品价钱,0为免费
    unit:{type:String,default:'个',trim:true},    //商品出售单位
    condition:{type:String,default:'',trim:true},   //或者等价条件
    alias:[{type:String,default:'',trim:true}], //商品标签
    quantity:{type:Number,default:1},   //库存,小于0则为无限多

    type:{type:Schema.Types.ObjectId,ref:'GoodType',default:null},   //商品类型
    scope:{type:Schema.Types.ObjectId,ref:'SellScope',default:null}, //销售范围
    tradeWay:{type:Number,default:3},    //交易方式，1：线上，2：线下联系，3：快递
    tradePosition:{type:String,default:'',trim:true},    //交易地点，只有交易方式为线下联系才需要填写
    onlyToGirl:{type:Boolean,default:false},    //只卖女生
    onlyToBoy:{type:Boolean,default:false},     //只卖男生

    fans:[{type:Schema.Types.ObjectId,ref:'User'}],  //收藏者
    //comments:[{type:Schema.Types.ObjectId,ref:'Comment'}],  //评价
    score:{type:Number,default:0},  //评分
    view_count:{type:Number,default:0}, //浏览次数

    activity:{type:Schema.Types.ObjectId,ref:'Activity',default:null},   //如果为空，则不是活动
    auction:{type:Schema.Types.ObjectId,ref:'Auction',default:null},   //如果为空，则不是拍卖
    secondHand:{type:Schema.Types.ObjectId,ref:'SecondHand',default:null},   //如果为空，则不是二手
    task:{type:Schema.Types.ObjectId,ref:'Task',default:null},   //如果为空，则不是任务

    //只有有用店铺才可以进行下架管理
    inSell:{type:Boolean,default:true}, //商品在售，如果下架，则不再售
    inUse:{type:Boolean,default:true},  //是否有用，被删除则无用
    is_valid:{type:Boolean,default:true},   //是否合法

    create_at:{type:Date,default:Date.now},
    update_at:{type:Date,default:Date.now},
});

var NotNullRule = [
    {col:'boss',msg:'保存商品出错，无法获取商品卖家信息！'},
    {col:'goodname',msg:'商品名不能为空'},
    {col:'detail',msg:'商品的详情不能为空'},
];

var GoodRule = {
    goodname:{
        min:1,
        max:20,
        ruleType:ruleType.STRLEN,
        msg:"商品名长度在1~20个字符之间"
    },
    detail:{
        min:10,
        ruleType:ruleType.STRLEN,
        msg:"商品详情描述必须大于10个字符"
    },
    price:{
        min:0,
        max:100000000,
        ruleType:ruleType.NUMVAL,
        msg:"商品的价格必须为正值，而且小于1个亿"
    },
    condition:{
        max:100,
        ruleType:ruleType.STRLEN,
        msg:"商品的获取条件必须小于100个字符"
    },
    unit:{
        min:1,
        max:5,
        ruleType:ruleType.STRLEN,
        msg:"商品的出售单位必须在1~6个字符之间"
    },
    alias:{
        min:1,
        max:5,
        ruleType:ruleType.STRLEN,
        msg:"商品的标签必须在1~5个字符之间"
    },
    tradeWay:{
        array:[1,2,3],
        ruleType:ruleType.ARRAYIN,
        msg:"交易方式必须只能是线上、线下联系或是快递",
    },
    tradePosition:{
        min:1,
        max:30,
        ruleType:ruleType.STRLEN,
        msg:"商品的交易地点必须在1~30个字符之间"
    },
    score:{
        min:0,
        max:100,
        ruleType:ruleType.NUMVAL,
        msg:"商品的评分必须大于等于0分，小于等于100分"
    },
};

GoodSchema.virtual("aliasStr")
    .get(function(){
        if(!this.alias || this.alias.length <= 0){
            return "";
        }

        var str = "";
        for(var i=0;i<this.alias.length;i++){
            str+="#"+this.alias[i]+" ";
        }
        return str;
    });


GoodSchema.virtual("coverImg")
    .get(function(){
        if(!this.cover && this.album.length > 0){
            return this.album[0];
        }else if(!this.cover){
            return "defaultCoverImage.png";
        }
        return this.cover;
    });

GoodSchema.virtual('tradeBy')
        .get(function(){
            if(this.tradeWay == 1){
                return "线上";
            }else if(this.tradeWay == 2){
                return "线下联系";
            }
            return "快递";
        });

GoodSchema.methods = {
    isFollowedBy:function(masterUid){
       if(!masterUid){
           return false;
       }

       return this.fans.indexOf(masterUid) >= 0?true:false;
    },
};
GoodSchema.statics = {};

baseSchemaMethod.regBeforeSave(GoodSchema,NotNullRule,GoodRule);
baseSchemaMethod.regMyfind(GoodSchema,"Good","boss store type scope fans comments activity auction secondHand task");
baseSchemaMethod.regSearchResultShow(GoodSchema,["goodname"]);
baseSchemaMethod.regViewCountAdd(GoodSchema,'view_count');

module.exports = mongoose.model("Good",GoodSchema);