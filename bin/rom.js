var Console = require('./console');
var mongoose = require('mongoose');

module.exports = function(db) {
  var schema;
  var romSchema;

  romSchema = {
    "path": {"type": "String", "required": true},
    "name": {"type": "String", "required": true},
    "desc": {"type": "String", "required": true},
    "image": {"type": "String"},
    "releasedate": {"type": "String"},
    "developper": {"type": "String"},
    "publisher": {"type": "String"},
    "genre": {"type": "String"},
    "rating": { "type": "String" },
    "player": { "type": "String" },
    "console": {"type": mongoose.Schema.ObjectId, ref: 'Console'}
  };


  schema = new mongoose.Schema(romSchema);
  schema.index({ name: 'text' });

  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });
  schema.methods.speak = function () {
    var greeting = this.name
        ? "Meow name is " + this.name
        : "I don't have a name";
    console.log(greeting);
  }

  return db.model('Rom', schema, 'roms');
};
