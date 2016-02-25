var ccap = require('ccap');

var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function randomChar(){
    return chars[Math.floor(Math.random()*chars.length)];
}

module.exports = function(){
    var captcha = ccap({
        width:190,
        height:50,
        offset:30,
        quality:100,
        fontsize:40,
        generate:function(){
            var str = "";
            for(var i=0;i<4;i++){
                str+=randomChar();
            }
            return str;
        },
    });
    return captcha.get();
};