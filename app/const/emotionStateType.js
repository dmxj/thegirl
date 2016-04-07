//用户情感状态
module.exports = {
    states:{
        UNKNOWN:0,  //未知
        SECRET:1,   //保密
        SINGLE:2,   //单身
        AMBIGUOUS:3,//暧昧
        LOVING:4,   //热恋
        MARRIED:5,   //已婚
        DIVORCE:6,   //离异
    },
    statesChinese:["未知","保密","单身","暧昧","热恋","已婚","离异"],
    collection:function(){
        var arr = [];
        for(var i in this.states){
            arr.push(this.states[i]);
        }
        return arr;
    }
};