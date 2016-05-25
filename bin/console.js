var mongoose = require('mongoose');

var consoleSchema = {
  name: { type: String, required: true },
  constructor: { type: String, required: true}
};

module.exports = new mongoose.Schema(consoleSchema);
module.exports.consoleSchema = consoleSchema;
