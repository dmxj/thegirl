var validator      = require('validator');

exports.isPhone = function(str){
    var pattern = /^((13\d|14[57]|15[^4,\D]|17[678]|18\d)\d{8}|170[059]\d{7})$/;
    return pattern.test(str);
}