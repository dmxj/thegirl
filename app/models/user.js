var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var util = require('util');
var hash = require('../helper/myHash');
var baseSchemaMethod = require('./baseSchemaMethod');
var TimeHelper = require('../helper/myTime');

var EmotionStateType = require('../const/emotionStateType');
var emotionStateCollections = EmotionStateType.collection();

/**
 * 必需项：username、email或telphone、gender、school
 */
var UserSchema = new Schema({
    username: { type: String, default: '' ,trim:true},
    email: { type: String, default: '' ,trim:true},
    telphone:{type:String,default:'',trim:true},
    confirm:{type:Boolean,default:false},  //验证成功:如果邮箱注册，需要邮箱点击链接认证；如果手机号验证则直接置true
    birthday:{type:Date,default:null},  //生日
    gender:{type:Boolean,default:true}, //性别，true:男 false:女
    avator:{type:String,default:'default.png',trim:true},
    emotion_state:{type:Number,enum:emotionStateCollections,default:0},  //情感状态：保密、单身、暧昧、热恋、已婚、未知
    school: { type: Schema.Types.ObjectId, ref:'School' },
    education:{type:Schema.Types.ObjectId, ref:'Education'},   //教育经历
    albums:[{type:Schema.Types.ObjectId, ref:'Album'}],     //相册们
    hashed_password: { type: String, default: '',trim:true },
    salt: { type: String, default: '',trim:true },  //加密盐值
    randomKey:{type:Number,default:Math.round(Math.random()*100)},  //随机值

    follow:{
        users:[{type:Schema.Types.ObjectId, ref:'User'}],   //用户关注的人
        goods:[{type:Schema.Types.ObjectId, ref:'Good'}],   //用户收藏的商品
        stores:[{type:Schema.Types.ObjectId, ref:'Store'}],  //用户收藏的店铺
        topics:[{type:Schema.Types.ObjectId, ref:'Topic'}],  //用户关注的话题
    },
    fans:[{type:Schema.Types.ObjectId, ref:'User'}],    //我的粉丝们

    stores:[{type:Schema.Types.ObjectId, ref:'Store'}], //创建的店铺
    goods:[{type:Schema.Types.ObjectId, ref:'Good'}],   //发表过的商品
    topics:[{type:Schema.Types.ObjectId, ref:'Topic'}], //发表过的话题

    accessToken:{type:String,trim:true,default:''},
    visitCount:{type:Number,default:0}, //被访问的次数
    create_at:{type:Date,default:Date.now},
    last_login_time:{type:Date,default:Date.now}
},{collection:'accounts'});

UserSchema.virtual('password')
    .set(function (password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
        this.accessToken = "this is a token";
    })
    .get(function () {
        return this._password;
    });

//性别
UserSchema.virtual('sex')
    .get(function(){
        return this.gender ? "男" : "女";
    });

//人称代词
UserSchema.virtual('pronoun')
    .get(function(){
        return this.gender ? "他" : "她";
    });

//年龄
UserSchema.virtual('age')
    .get(function(){
       return this.birthday ? TimeHelper.getAge(this.birthday) : "未知";
    });

//星座
UserSchema.virtual('star')
    .get(function(){
        return this.birthday ? TimeHelper.getStar(this.birthday.getMonth() + 1,this.birthday.getDate()) : "未知";
    });

//情感状态
UserSchema.virtual('emotionState')
    .get(function(){
       return this.emotion_state && emotionStateCollections.indexOf(this.emotion_state) >= 0 ? EmotionStateType.statesChinese[this.emotion_state] : "未知";
    });

//粉丝数
UserSchema.virtual('fansCount')
    .get(function(){
        return this.fans ? this.fans.length : 0;
    });

//关注的用户数
UserSchema.virtual('followUserCount')
    .get(function(){
        return this.follow && this.follow.users ? this.follow.users.length : 0;
    });

//收藏的商品数
UserSchema.virtual('followGoodCount')
    .get(function(){
        return this.follow && this.follow.goods ? this.follow.goods.length : 0;
    });

//收藏的店铺数
UserSchema.virtual('followStoreCount')
    .get(function(){
        return this.follow && this.follow.stores ? this.follow.stores.length : 0;
    });

//关注的话题数
UserSchema.virtual('followTopicCount')
    .get(function(){
        return this.follow && this.follow.topics ? this.follow.topics.length : 0;
    });


UserSchema.methods = {
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    makeSalt: function () {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    makeRandom:function(){
        return Math.round(Math.random()*10000);
    },

    encryptPassword: function (password) {
        if (!password) return '';
        try {
            return hash.saltSha1(this.salt,password);
        } catch (err) {
            return '';
        }
    },

    filterUser:function(filterColumns){
        if(!filterColumns || !util.isArray(filterColumns) || filterColumns.length <= 0){
            filterColumns = ['confirm','albums','hashed_password','salt','follow','fans','stores','goods','topics','accessToken'];
        }

        filterColumns.forEach(function(column){
            if(this.hasOwnProperty(column))
                delete this[column];
        })

        return this;
    },

    isFollowedBy:function(masterUid){
        if(!masterUid){
            return false;
        }

        return this.fans.indexOf(masterUid) >= 0 ? true : false;
    },
};

UserSchema.statics = {};

baseSchemaMethod.regMyfind(UserSchema,'User','emotion_state school education albums follow.users follow.goods follow.stores follow.topics fans stores goods topics');

module.exports = mongoose.model('User',UserSchema);


