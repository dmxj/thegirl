var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');
var timeHelper = require('../helper/myTime');
var validator = require('validator');

var TopicCommentSchema = new Schema({
    topic:{type: Schema.Types.ObjectId, ref:'Topic'},   //对应的话题
    author:{type: Schema.Types.ObjectId, ref:'User'},   //回复者
    content:{type:String,trim:true,default:''}, //内容，富文本

    replyTo:{type:Schema.Types.ObjectId,ref:'TopicComment',default:null}, // 回复的哪一条评论
    //该评论的回复列表，按照顺序，后一个是回复前一个，只有replyTo为空的回复才有此项
    replyList:[{type:Schema.Types.ObjectId,ref:'TopicComment',default:null}],
    //该评论回复的顶部列表，按照顺序，后一个是回复前一个，但是replyTo为空的此项为空数组，和replyList相对应
    //replyTo不为空的均有此项
    underList:[{type:Schema.Types.ObjectId,ref:'TopicComment',default:null}],

    likeUser:[{type:Schema.Types.ObjectId,ref:'User'}], //点赞者列表
    is_deleted:{type:Boolean,default:false},    //是否已被删除

    create_at:{type:Date,default:Date.now()},
},{collection:'topiccomments'});

var NotNullRule = [
    {col:'author',msg:'发表评论失败，无法获取您的账号信息！'},
    {col:'content',msg:'评论内容不能为空'},
];

var TopicCommentRule = {
    content:{
        min:1,
        max:400,
        ruleType:ruleType.STRLEN,
        msg:"评论内容在0~400个字符之间"
    },
};

TopicCommentSchema.virtual('postDate')
    .get(function(){
        return timeHelper.formatDate(this.create_at,false);
    });

TopicCommentSchema.methods = {
    change:function(masterId){
        var obj = new Object();
        obj.id = this._id;
        obj.uid = this.author._id;
        obj.uname = this.author.username;
        obj.usex = this.author.sex;
        obj.uschool = this.author.school.schoolname;

        obj.to = this.replyTo ? this.replyTo.author : "" ;

        if(masterId && validator.equals(masterId,this.author._id)){
            obj.m = true;
        }else{
            obj.m = false;
        }

        obj.w = this.content;

        obj.lq = this.likeUser.length;

        if(masterId && this.likeUser.indexOf(masterId) >= 0){
            obj.l = true;
        }else{
            obj.l = false;
        }

        obj.t = this.postDate;
        obj.r = this.replyList.map(function(reply){
            return reply.change(masterId);
        });
        //obj.u = this.underList.map(function(reply){
        //    var underObj = reply.change(masterId);
        //    delete underObj.u;
        //    return underObj;
        //});
        return obj;
    },
};

TopicCommentSchema.statics = {

};


TopicCommentSchema.plugin(deepPopulate,{})
baseSchemaMethod.regBeforeSave(TopicCommentSchema,NotNullRule,TopicCommentRule);

baseSchemaMethod.regPageQuery(TopicCommentSchema,'TopicComment');

module.exports = mongoose.model('TopicComment',TopicCommentSchema);