var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = function(wagner) {
  //mongoose.connect('mongodb://localhost/projetAnne');

  wagner.factory('db', function() {
    return mongoose;
  });

  var Console =
    mongoose.model('Console', require('./console'), 'consoles');
  var roro = require("./rom");
  var Rom = new roro(mongoose);
  /*var Rom =
    mongoose.model('Rom', require("./rom"), 'roms');*/

  var models = {
    Console: Console,
    Rom: Rom
  };

  // To ensure DRY-ness, register factories in a loop
  _.each(models, function(value, key) {
    wagner.factory(key, function() {
      return value;
    });
  });
/*
  wagner.factory('Rom', require('./rom'));
*/
  return models;
};
