var myTime = require('../helper/myTime');

module.exports = function (schema) {
  schema.methods.create_at_ago = function () {
    return myTime.formatDate(this.create_at, true);
  };

  schema.methods.update_at_ago = function () {
    return myTime.formatDate(this.update_at, true);
  };
};