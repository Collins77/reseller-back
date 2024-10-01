const Brand = require('../models/Brand')
const asyncHandler = require('express-async-handler');

const createNewBrand = asyncHandler(async (req, res) => {
    const { name, status } = req.body;

    // Confirming data
    if(!name) {
        return res.status(400).json({message: 'All fields are required!'})
    }

    // Check for duplicates
    const duplicate = await Brand.findOne({ name }).lean().exec()
    if(duplicate) {
        return res.status(409).json({ message: 'A brand with this name already exists!' })
    }

    const brandObject = { name, status }

    // Create and store new user
    const brand = await Brand.create(brandObject)

    if(brand) {
        res.status(201).json({ message: `New brand created` })
    } else {
        res.status(400).json({ message: 'Invalid brand data received' })
    }
});

const getAllBrands = asyncHandler(async (req, res) => {
    const brands = await Brand.find().lean()
    if(!brands?.length) {
        return res.status(400).json({message: 'No Brands found'})
    }
    res.json(brands)
})

const updateBrand = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { name, status } = req.body;

    try {
      const brand = await Brand.findById(id);

      if (!brand) {
        return next(new ErrorHandler('Brand not found', 404));
      }

      const duplicate = await Brand.findOne({ name }).lean().exec()

        // Allow updates to the original user
        if(duplicate && duplicate?._id.toString() !== id) {
            return res.status(409).json({ message: 'Duplicate brand name' })
        }

      brand.name = name || brand.name;
      brand.status = status || brand.status;

      await brand.save();

      res.status(200).json({
        success: true,
        message: 'Brand updated successfully!',
        brand,
      });
    } catch (error) {
      return res.status(400).json(error.message);
    }
})

const getBrand = asyncHandler(async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if(!brand) {
            return res.status(404).json({ message: 'Brand not found!' });
        }
      res.status(201).json({
        success: true,
        brand,
      });
      } catch (error) {
        return res.status(500).json(error.message);
      }
})

const deleteBrand = asyncHandler(async (req, res) => {
    const brand = await Brand.findById(req.params.id);

    if(!brand) {
        return res.status(400).json({ message: 'Brand not found' })
    }

    const result = await brand.deleteOne()

    const reply = `Brand ${brand.name} with ID ${brand._id} deleted.`

    res.json(reply)
    
})

module.exports = {
    getAllBrands, 
    createNewBrand, 
    updateBrand,
    deleteBrand,
    getBrand
}