const Term = require('../models/Term')
const asyncHandler = require('express-async-handler');

const createNewTerm = asyncHandler(async (req, res) => {
    const { name, description, status } = req.body;

    // Confirming data
    if(!name || !description) {
        return res.status(400).json({message: 'All fields are required!'})
    }

    // Check for duplicates
    const duplicate = await Term.findOne({ name }).lean().exec()
    if(duplicate) {
        return res.status(409).json({ message: 'A T & C with this title already exists!' })
    }

    const termObject = { name, description, status }

    // Create and store new user
    const term = await Term.create(termObject)

    if(term) {
        res.status(201).json({ message: `New T&C created` })
    } else {
        res.status(400).json({ message: 'Invalid T&C data received' })
    }
});

const getAllTerms = asyncHandler(async (req, res) => {
    const terms = await Term.find().lean()
    if(!terms?.length) {
        return res.status(400).json({message: 'No T&Cs found'})
    }
    res.json(terms)
})

const updateTerm = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const {  name, description, status } = req.body;

    try {
      const term = await Term.findById(id);

      if (!term) {
        return next(new ErrorHandler('Term not found', 404));
      }

        term.name = title
        term.description = description
        term.status = status

      await term.save();

      res.status(200).json({
        success: true,
        message: 'Term updated successfully!',
        term,
      });
    } catch (error) {
      return res.status(400).json(error.message);
    }

})

const deleteTerm = asyncHandler(async (req, res) => {
    const term = await Term.findById(req.params.id);
  
        if (!term) {
          return res.status(404).json({message: 'Term is not found'});
        }
      
        await term.deleteOne()
  
        res.status(201).json({
          success: true,
          message: "Term Deleted successfully!",
        });
})

const getTermById = asyncHandler(async (req, res) => {
    try {
        const term = await Term.findById(req.params.id);
        if(!term) {
            return res.status(404).json({ message: 'Term not found!' });
        }
      res.status(201).json({
        success: true,
        term,
      });
      } catch (error) {
        return res.status(500).json(error.message);
      }
})

module.exports = {
    getAllTerms, 
    createNewTerm, 
    updateTerm,
    deleteTerm,
    getTermById
}