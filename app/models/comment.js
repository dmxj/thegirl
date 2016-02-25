var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');
var TimeHelper = require('../helper/myTime');
var validator      = require('validator');

/**
 * 评论集合
 */
var CommentSchema = new Schema({
    author:{type:Schema.Types.ObjectId,ref:'User'}, // 发布者
    content:{type:String,default:'',trim:true}, // 评论内容
    publish_time:{type:Date,default:Date.now},  //评论时间
    pictures:[{type:String,default:'',trim:true}],  //附带的图片
    replyTo:{type:Schema.Types.ObjectId,ref:'Comment',default:null}, // 回复的哪一条评论

    good:{type:Schema.Types.ObjectId,ref:'Good',default:null},  //给商品的评论
    store:{type:Schema.Types.ObjectId,ref:'Store',default:null},  //给店铺的评论
    askbuy:{type:Schema.Types.ObjectId,ref:'Askbuy',default:null},  //给求购的评论

    likeUser:[{type:Schema.Types.ObjectId,ref:'User'}], //点赞者列表

    //该评论的回复列表，按照顺序，后一个是回复前一个，只有replyTo为空的回复才有此项
    replyList:[{type:Schema.Types.ObjectId,ref:'Comment',default:null}],
    //该评论回复的顶部列表，按照顺序，后一个是回复前一个，但是replyTo为空的此项为空数组，和replyList相对应
    //replyTo不为空的均有此项
    underList:[{type:Schema.Types.ObjectId,ref:'Comment',default:null}],

    is_deleted:{type:Boolean,default:false},    //是否已被删除
},{collection:'comments'});

var NotNullRule = [
    {col:'author',msg:'发表评论失败，无法获取店铺卖家信息！'},
    {col:'content',msg:'评论内容不能为空'},
];

var CommentRule = {
    content:{
        min:1,
        max:400,
        ruleType:ruleType.STRLEN,
        msg:"评论内容在0~400个字符之间"
    },
};

//是否是直接评论，即直接评论商品或文章
CommentSchema.virtual('isTop')
    .get(function(){
        return this.replyTo == null;
    });

//是否有图
CommentSchema.virtual('withImg')
    .get(function(){
        return this.pictures.length > 0;
    });


CommentSchema.virtual('create_at')
    .get(function(){
       return TimeHelper.formatDate(this.publish_time,false);
    });

CommentSchema.methods = {
    change:function(masterId){
        var obj = new Object();
        obj.id = this._id;
        obj.uid = this.author._id;
        obj.uname = this.author.username;

        if(masterId && validator.equals(masterId,this.author._id)){
            obj.m = true;
        }else{
            obj.m = false;
        }

        obj.w = this.content;

        if(masterId && this.likeUser.indexOf(masterId) >= 0){
            obj.l = true;
        }else{
            obj.l = false;
        }

        obj.lq = this.likeUser.length;
        obj.t = this.create_at;
        obj.p = this.pictures;
        //obj.r = this.replyList.map(function(reply){
        //    return reply.change(masterId);
        //});
        obj.u = this.underList.map(function(reply){
            var underObj = reply.change(masterId);
            delete underObj.u;
            return underObj;
        });
        return obj;
    },
};
CommentSchema.statics = {};

baseSchemaMethod.regBeforeSave(CommentSchema,NotNullRule,CommentRule);

module.exports = mongoose.model('Comment',CommentSchema);