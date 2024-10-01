const SearchQuery = require('../models/Search');

// Controller function to handle saving search queries
const saveSearchQuery = async (req, res) => {
  try {
    // Extract the search query from the request body
    const { query } = req.body;

    // Create a new SearchQuery document and save it to the database
    const newSearchQuery = new SearchQuery({ query });
    await newSearchQuery.save();

    // Send a success response
    res.status(201).json({ success: true, message: 'Search query saved successfully' });
  } catch (error) {
    // Send an error response if something goes wrong
    console.error('Error saving search query:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getSearchQueries = async (req, res) => {
    try {
        // Fetch all search queries from the database
        const searchQueries = await SearchQuery.find();
    
        // Send the search queries as a response
        res.status(200).json({ success: true, searchQueries });
      } catch (error) {
        // Send an error response if something goes wrong
        console.error('Error fetching search queries:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
};

module.exports = { 
    saveSearchQuery,
    getSearchQueries
};
