var express = require('express');
var Flickr = require('flickrapi');
var mongoose = require('mongoose');
var validator = require('validator');
var {recentSearchModel} = require('./dbmodels/recent-searches');

const PORT = process.env.PORT || 3000;

const COLLECTION = 'ImageSearch';
const FLICKR_KEY = '7bfc6f055819645897b0cb441eec6b9f';
const FLICKR_SEC = '618b8335da530396';
var flickrOptions = {
  api_key: FLICKR_KEY,
  secret: FLICKR_SEC
};

const DB = process.env.MONGODB_URI || `mongodb://localhost:27017/${COLLECTION}`;
mongoose.Promise = global.Promise;
mongoose.connect(DB);

var app = express()

app.get('/api/imagesearch/:query', (req, res) => {
  var {query} = req.params;
  Flickr.tokenOnly(flickrOptions, (err, flickr) => {
    if (err)
      console.log(err);
    var thisSearch = new recentSearchModel({
      term: query,
      when: new Date().toDateString()
    });
    thisSearch.save();
    console.log('Starting Search');
    flickr
      .photos
      .search({
        text: query,
        page: req.query.offset,
        per_page: 10
      }, (err, result) => {
        if (err)
          console.log(err);
        var {photo} = result.photos;
        var data = photo.map((pic) => {
          return {url: `https://farm${pic.farm}.staticflickr.com/${pic.server}/${pic.id}_${pic.secret}.jpg`, title: pic.title}
        });
        res.send(JSON.stringify(data));
      });
  });
});

app.get('/api/latest/imagesearch', (req, res) => {
  recentSearchModel
    .find({})
    .then((searches) => {
      var searchList = searches.map((search) => {
        var {term, when} = search;
        return {term, when}
      });
      res.send(JSON.stringify(searchList));
    })
    .catch((e) => {});
});

app.listen(PORT, function() {
  console.log('Server is listening on port 3000!')
});
