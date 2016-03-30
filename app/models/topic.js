var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var baseSchemaMethod = require('./baseSchemaMethod');
var ruleType = require('../const/ruleType');
var timeHelper = require('../helper/myTime');

//话题集合
var TopicSchema = new Schema({
    author:{type: Schema.Types.ObjectId, ref:'User'},   //创建者
    title:{type:String,trim:true,default:''},   //标题
    content:{type:String,trim:true,default:''}, //内容，富文本，可包含图片
    //comments:[{type: Schema.Types.ObjectId, ref:'TopicComment'}],   //话题的回复

    just_myschool:{type:Boolean,default:false}, //是不是只在发布者的学校范围内

    fans:[{type:Schema.Types.ObjectId,ref:'User'}], //收藏者
    likeUser:[{type:Schema.Types.ObjectId,ref:'User'}], //点赞者列表

    view_count:{type:Number,default:0}, //浏览量
    post_time:{type:Date,default:Date.now()},
    is_delete:{type:Boolean,default:false},
    is_valid:{type:Boolean,default:true},  //合法的话题，不违反规定
},{collection:'topics'});

var NotNullRule = [
    {col:'author',msg:'无法获取您的用户信息，请重新登录后重试'},
    {col:'title',msg:'话题标题不能为空'},
    {col:'content',msg:'话题内容不能为空'},
];

var TopicRule = {
    title:{
        min:3,
        max:30,
        ruleType:ruleType.STRLEN,
        msg:"标题长度必须在3~30个字符之间"
    },
    content:{
        min:7,
        max:600,
        ruleType:ruleType.STRLEN,
        msg:"内容长度必须在7~600个字符之间"
    },
};

TopicSchema.virtual('hotlevel')
    .get(function(){
        return this.visitCount + this.fans.length * 6;
    });

TopicSchema.virtual('postDate')
    .get(function(){
        return timeHelper.formatDate(this.post_time,false);
    });

TopicSchema.methods = {};
TopicSchema.statics = {};

TopicSchema.plugin(deepPopulate,{});

baseSchemaMethod.regBeforeSave(TopicSchema,NotNullRule,TopicRule);
baseSchemaMethod.regMyfind(TopicSchema,'Topic','author');
baseSchemaMethod.regSearchResultShow(TopicSchema,["title","content"]);
baseSchemaMethod.regPageQuery(TopicSchema,'Topic');

module.exports = mongoose.model('Topic',TopicSchema);