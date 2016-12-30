var mongoose = require('mongoose');

var recentSearchModel = mongoose.model('Image-Search', new mongoose.Schema({
  term: {
    type: String,
    required: true,
    trim: true
  },
  when: {
    type: String,
    required: true
  }
}));

module.exports = {
  recentSearchModel
};
