var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var siteType = require('../const/siteType');

/**
 * 地区集合
 */
var SiteSchema = new Schema({
    name:{type:String,default:'',trim:true},    //地区名称
    level:{type:Number,default:0},  //级别：星球、洲、国家、城市
    isCenter:{type:Boolean,default:false},  //是否是首都或者省份或者自治区
    isAutonomy:{type:Boolean,default:false},  //是否是自治区
    refCountry:{type:Schema.Types.ObjectId,ref:'Site',default:null},    //所属国家
    refProvince:{type:Schema.Types.ObjectId,ref:'Site',default:null},    //所属省份
    refCity:{type:Schema.Types.ObjectId,ref:'Site',default:null},    //所属城市
    refCounty:{type:Schema.Types.ObjectId,ref:'Site',default:null},    //所属区县
    order:{type:Number,default:0},  //排序

    create_at:{type:Date,default:Date.now},
    update_at:{type:Date,default:Date.now},
},{collection:'sites'});

SiteSchema.pre('save',function(next){
    next("客官不可以");
});

SiteSchema.methods = {
    loadProvince:function(callback){    //加载国家下的所有省份和自治区
        var query = {level:siteType.PROVINCE,refCountry:this._id};
        this.model('Site').siteFind(query,function(sites){
            return callback(sites);
        });
    },
    loadCity:function(callback){    //加载省份下面的所有城市
        var query = {level:siteType.CITY,refProvince:this._id};
        this.model('Site').siteFind(query,function(sites){
            return callback(sites);
        });
    },
    loadCounty:function(callback){  //加载城市下的所有区县
        var query = {level:siteType.COUNTY,refCity:this._id};
        this.model('Site').siteFind(query,function(sites){
            return callback(sites);
        });
    },
    loadTown:function(callback){    //加载区县下的所有村落
        var query = {level:siteType.TOWN,refProvince:this._id};
        this.model('Site').siteFind(query,function(sites){
            return callback(sites);
        });
    }
};

SiteSchema.statics = {
    siteFind:function(query,callback){
        this.model('Site').find(query,function(err,sites){
            if(err || !sites || sites.length <= 0){
                return callback(null);
            }

            return callback(sites);
        });
    }
};

module.exports = mongoose.model('Site',SiteSchema);