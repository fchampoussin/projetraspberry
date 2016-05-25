var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');
var _ = require('underscore');

module.exports = function(wagner) {
  var api = express.Router();

  api.use(bodyparser.json());

  /* Console API */
  api.get('/console/id/:id', wagner.invoke(function(Console) {
    return function(req, res) {
      Console.findOne({ name: req.params.name }, function(error, console) {
        if (error) {
          return res.
          status(status.INTERNAL_SERVER_ERROR).
          json({ error: error.toString() });
        }
        if (!console) {
          return res.
          status(status.NOT_FOUND).
          json({ error: 'Not found' });
        }
        res.json({ console: console });
      });
    };
  }));
  /* ROM API */
  api.get('/rom/', wagner.invoke(function(Rom) {
    return function(req, res) {
      var arrayName = [];
      var arrayId = [];
      var resFin = res;
      Rom.find({}, function(err, res)
      {

        for (index = 0; index < res.length; ++index) {
          arrayName.push(res[index].name);
          arrayId.push(res[index]._id);
        }

        resFin.render('listePugGame', { name: arrayName, id: arrayId});
      });
    };
  }));

  /* ROM API */
  api.get('/rom/id/:id', wagner.invoke(function(Rom) {
    return function(req, res) {
      var foncRetu = res;
      Rom.findOne({ _id: req.params.id },function(err, res)
      {

        var name = res.name;
        var path = res.path;
        var desc = res.desc;
        var image = res.image;
        var releasedate = res.releasedate;
        var developer = res.developer;
        var publisher = res.publisher;
        var genre = res.genre;

        foncRetu.render('romStyle', { name: name, path : path, desc:desc,
          image:image,releasedate:releasedate,developer:developer,publisher:publisher,genre:genre});
      });
    };
  }));

  api.get('/rom/console/:id', wagner.invoke(function(Rom) {
    return function(req, res) {
      var sort = { name: 1 };

      Rom.
      find({ 'console.ancestors': req.params.id }).
      sort(sort).
      exec(handleMany.bind(null, 'roms', res));
    };
  }));

  /* text search API */
  api.get('/rom/text/:query', wagner.invoke(function(Rom) {
    return function(req, res) {
      Rom.
      find(
          { $text : { $search : req.params.query } },
          { score : { $meta: 'textScore' } }).
      sort({ score: { $meta : 'textScore' } }).
      limit(10).
      exec(handleMany.bind(null, 'roms', res));
    };
  }));

  return api;
};

function handleOne(property, res, error, result) {
  if (error) {
    return res.
    status(status.INTERNAL_SERVER_ERROR).
    json({ error: error.toString() });
  }
  if (!result) {
    return res.
    status(status.NOT_FOUND).
    json({ error: 'Not found' });
  }

  var json = {};
  json[property] = result;
  res.json(json);
}

function handleMany(property, res, error, result) {
  if (error) {
    return res.
    status(status.INTERNAL_SERVER_ERROR).
    json({ error: error.toString() });
  }

  var json = {};
  json[property] = result;
  res.json(json);
}
