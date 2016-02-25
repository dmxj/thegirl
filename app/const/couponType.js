//评价回复的类型
module.exports = {
    const:{
        FULLCUT:1,  //满减
        CHEAPER:2,  //优惠金额
        DISCOUNT:3, //打折
        GIVESCOPE:4,    //送积分
        LOTTERY:5   //抽奖
    },
    collection:function(){
        var arr = [];
        for(var i in this.const){
            arr.push(this.const[i]);
        }
        return arr;
    }
};

