var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schoolType = require('../const/schoolType');

var SchoolSchema = new Schema({
    schoolname:{type:String,default:'中国某学校',trim:true},
    type:{type:Number,default:schoolType.UNIVERSITY.code},    //学校类型:小学、初中、高中、大学(4)

    describe:{type:String,default:'',trim:true},    //学校描述
    location:{type:String,default:'',trim:true},    //学校地址
    site:{type:Schema.Types.ObjectId,ref:'Site'},

    create_at:{type:Date,default:Date.now},
    update_at:{type:Date,default:Date.now},
},{collection:'schools'});

SchoolSchema.methods = {};
SchoolSchema.statics = {};

module.exports = mongoose.model('School',SchoolSchema);