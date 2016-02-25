var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var baseSchemaMethod = require('./baseSchemaMethod');

var AlbumSchema = new Schema({
    author:{type:Schema.Types.ObjectId, ref:'User'},
    albumname:{type:String,default:'默认相册',trim:''},
    encrypt:{
        question:{type:String,default:'',trim:''},
        anwser:{type:String,default:'',trim:''},
    },
    describe:{type:String,default:'',trim:''},
    photos:[{type:Schema.Types.ObjectId, ref:'Photo'}],
    is_delete:{type:Boolean,default:false}, //是否已被删除
    is_valid:{type:Boolean,default:true},   //是否合理
    create_at:{type:Date,default:Date.now},
    update_at:{type:Date,default:Date.now},
},{collection:'albums'});

AlbumSchema.virtual('queStr')
    .get(function(){
        if(this.encrypt.question.lastIndexOf('?') != (this.encrypt.question.length - 1)){
            return this.encrypt.question + "?";
        }
    });

AlbumSchema.methods = {};
AlbumSchema.statics = {};

baseSchemaMethod.regMyfind(AlbumSchema,'Album','author photos');


module.exports = mongoose.model('Album',AlbumSchema);