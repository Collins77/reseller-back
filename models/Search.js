const mongoose = require('mongoose');

// Create a Mongoose schema for search queries
const searchQuerySchema = new mongoose.Schema({
  query: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Create a Mongoose model for search queries
const SearchQuery = mongoose.model('SearchQuery', searchQuerySchema);

module.exports = SearchQuery;