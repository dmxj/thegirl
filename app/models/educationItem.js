var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 教育经历单项，一个用户对应多个单项
 * 考虑到转学、交换，一个阶段对应多个单项，比如幼儿园：可以有多个幼儿园经历，但不超过3个
 * 幼儿园、小学、初中、高中、大学、研究生、博士
 */
var EducationItemSchema = new Schema({
    start_time: { type: Date, default: Date.now },  //入学时间
    finish_time: { type: Date, default: Date.now }, //毕业时间，不得超过现在
    type:{ type: Number, default: 5 },  //从幼儿园到博士：1-7，默认为本科生
    grade:{ type: String, default: '' },   //年级
    describe:{type: String, default: ''},   //描述
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now }
},{collection:'educationitems'});

EducationItemSchema.methods = {};
EducationItemSchema.statics = {};

module.exports = mongoose.model('EducationItem',EducationItemSchema);