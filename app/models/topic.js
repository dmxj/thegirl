var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var baseSchemaMethod = require('./baseSchemaMethod');
var timeHelper = require('../helper/myTime');

//话题集合
var TopicSchema = new Schema({
    author:{type: Schema.Types.ObjectId, ref:'User'},   //创建者
    title:{type:String,trim:true,default:''},   //标题
    content:{type:String,trim:true,default:''}, //内容
    comments:[{type: Schema.Types.ObjectId, ref:'TopicComment'}],   //话题的回复
    fans:[{type:Schema.Types.ObjectId,ref:'User'}], //收藏者
    view_count:{type:Number,default:0}, //浏览量
    post_time:{type:Date,default:Date.now()},
    is_delete:{type:Boolean,default:false},
    is_valid:{type:Boolean,default:true},  //合法的话题，不违反规定
},{collection:'topics'});

TopicSchema.virtual('hotlevel')
    .get(function(){
        return this.visitCount + this.followers.length * 6;
    });

TopicSchema.virtual('postDate')
    .get(function(){
        return timeHelper.formatDate(this.post_time,false);
    });

TopicSchema.methods = {};
TopicSchema.statics = {};

baseSchemaMethod.regMyfind(TopicSchema,'Topic','author comments');
baseSchemaMethod.regSearchResultShow(TopicSchema,["title","content"]);

module.exports = mongoose.model('Topic',TopicSchema);