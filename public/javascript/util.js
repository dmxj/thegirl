function goto(obj){
    if(obj.length > 0)
        $('html,body').animate({scrollTop:obj.offsetTop - 20},800);
}
