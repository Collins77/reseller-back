const FAQ = require('../models/FAQ')
const asyncHandler = require('express-async-handler');

const createNewFAQ = asyncHandler(async (req, res) => {
    const { title, description, status } = req.body;

    // Confirming data
    if(!title || !description) {
        return res.status(400).json({message: 'All fields are required!'})
    }

    // Check for duplicates
    const duplicate = await FAQ.findOne({ title }).lean().exec()
    if(duplicate) {
        return res.status(409).json({ message: 'A FAQ with this title already exists!' })
    }

    const faqObject = { title, description, status }

    // Create and store new user
    const faq = await FAQ.create(faqObject)

    if(faq) {
        res.status(201).json({ message: `New faq created` })
    } else {
        res.status(400).json({ message: 'Invalid faq data received' })
    }
});

const getAllFAQs = asyncHandler(async (req, res) => {
    const faqs = await FAQ.find().lean()
    if(!faqs?.length) {
        return res.status(400).json({message: 'No FAQs found'})
    }
    res.json(faqs)
})

const updateFAQ = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const {  title, description, status } = req.body;

    try {
      const faq = await FAQ.findById(id);

      if (!faq) {
        return next(new ErrorHandler('FAQ not found', 404));
      }

      faq.title = title || faq.title;
      faq.description = description || faq.description;
      faq.status = status || faq.productName;

      await faq.save();

      res.status(200).json({
        success: true,
        message: 'FAQ updated successfully!',
        faq,
      });
    } catch (error) {
      return res.status(400).json(error.message);
    }
})

const deleteFAQ = asyncHandler(async (req, res) => {
    const faq = await FAQ.findById(req.params.id);
  
        if (!faq) {
          return res.status(404).json({message: 'FAQ is not found'});
        }
      
        await faq.deleteOne()
  
        res.status(201).json({
          success: true,
          message: "FAQ Deleted successfully!",
        });
})

const getFAQById = asyncHandler(async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if(!faq) {
            return res.status(404).json({ message: 'FAQ not found!' });
        }
      res.status(201).json({
        success: true,
        faq,
      });
      } catch (error) {
        return res.status(500).json(error.message);
      }
})

module.exports = {
    getAllFAQs, 
    createNewFAQ, 
    updateFAQ,
    deleteFAQ,
    getFAQById
}