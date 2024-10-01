const Category = require('../models/Category')
const asyncHandler = require('express-async-handler');
const Product = require('../models/Reseller')

const createNewCategory = asyncHandler(async (req, res) => {
    const { name, status } = req.body;

    // Confirming data
    if(!name) {
        return res.status(400).json({message: 'All fields are required!'})
    }

    // Check for duplicates
    const duplicate = await Category.findOne({ name }).lean().exec()
    if(duplicate) {
        return res.status(409).json({ message: 'A Category with this name already exists!' })
    }

    const categoryObject = { name, status }

    // Create and store new user
    const category = await Category.create(categoryObject)

    if(category) {
        res.status(201).json({ message: `New category ${name} created` })
    } else {
        res.status(400).json({ message: 'Invalid category data received' })
    }
});

const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().lean()
    if(!categories?.length) {
        return res.status(400).json({message: 'No categories found'})
    }
    res.json(categories)
})

const getCategory = asyncHandler(async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if(!category) {
            return res.status(404).json({ message: 'Category not found!' });
        }
      res.status(201).json({
        success: true,
        category,
      });
      } catch (error) {
        return res.status(500).json(error.message);
      }
})

const updateCategory = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { name, status } = req.body;

    try {
      const category = await Category.findById(id);

      if (!category) {
        return next(new ErrorHandler('Category not found', 404));
      }

      const duplicate = await Category.findOne({ name }).lean().exec()

        // Allow updates to the original user
        if(duplicate && duplicate?._id.toString() !== id) {
            return res.status(409).json({ message: 'Duplicate category name' })
        }

      category.name = name || category.name;
      category.status = status || category.status;

      await category.save();

      res.status(200).json({
        success: true,
        message: 'Category updated successfully!',
        category,
      });
    } catch (error) {
      return res.status(400).json(error.message);
    }
})

const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if(!category) {
        return res.status(400).json({ message: 'Category not found' })
    }

    const result = await category.deleteOne()

    const reply = `Category ${category.name} with ID ${category._id} deleted.`

    res.json(reply)

})

module.exports = {
    getAllCategories, 
    createNewCategory, 
    updateCategory,
    deleteCategory,
    getCategory
}