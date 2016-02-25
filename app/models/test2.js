var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Test2Schema = new Schema({
    testid:{type:Schema.Types.ObjectId,ref:'Test'},
    today:{type:Date,default:Date.now()},
    title:{type:String,default:'i miss zhangmenglei',trim:true},
});


module.exports = mongoose.model('Test2',Test2Schema);