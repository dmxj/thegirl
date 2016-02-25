var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var baseSchemaMethod = require('./baseSchemaMethod');

var PhotoSchema = new Schema({
    album:{type:Schema.Types.ObjectId, ref:'Album'},
    title:{type:String,default:'',trim:''},
    thumb:{type:String,default:'',trim:''},
    origin:{type:String,default:'',trim:''},
    comments:{type:Schema.Types.ObjectId, ref:'Comment'},
    follower:[{type:Schema.Types.ObjectId, ref:'User'}],
    is_valid:{type:Boolean,default:true},
    create_at:{type:Date,default:Date.now},
    update_at:{type:Date,default:Date.now},
},{collection:'photos'});

PhotoSchema.methods = {};
PhotoSchema.statics = {};

baseSchemaMethod.regMyfind(PhotoSchema,'Photo','album comments follower');


module.exports = mongoose.model('Photo',PhotoSchema);