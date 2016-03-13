var validator = require('validator');

exports.isZhengshu = function(number)
{
    if(validator.isNumeric(number) && parseInt(number) === number){
        return true;
    }
    return false;
}
