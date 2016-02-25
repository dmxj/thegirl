var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 教育集合,一条记录对应一个用户
 * 幼儿园、小学、初中、高中、大学、研究生、博士
 */
var EducationSchema = new Schema({
    kinder:[{type: Schema.Types.ObjectId, ref:'EducationItem'}],    //幼儿园，不超过3条
    primary:[{type: Schema.Types.ObjectId, ref:'EducationItem'}],   //小学，不超过3条
    middle:[{type: Schema.Types.ObjectId, ref:'EducationItem'}],    //初中，不超过3条
    high:[{type: Schema.Types.ObjectId, ref:'EducationItem'}],  //高中，不超过3条
    university:[{type: Schema.Types.ObjectId, ref:'EducationItem'}],    //大学，不超过3条
    graduate:[{type: Schema.Types.ObjectId, ref:'EducationItem'}],  //研究生，不超过3条
    phd:[{type: Schema.Types.ObjectId, ref:'EducationItem'}],   //博士，不超过3条
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now }
},{collection:'educations'});

EducationSchema.methods = {};
EducationSchema.statics = {};

module.exports = mongoose.model('Education',EducationSchema);