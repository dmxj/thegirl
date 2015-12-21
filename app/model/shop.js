var db = require('../db');

function Shop(){
	return '这个是Shop模型生成的数据';
}

Shop.prototype.myshop = function() {
	return '大风起兮云飞扬，虞兮虞兮奈若何！时不利兮骓不逝';
};

module.exports = Shop;