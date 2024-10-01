const Ad = require('../models/Ads')
const Supplier = require('../models/Supplier')
const asyncHandler = require('express-async-handler');

const createNewAd = asyncHandler(async (req, res) => {
    try {
        const supplierId = req.body.supplierId; // Assuming the supplier ID is provided in the request body
        const supplier = await Supplier.findById(supplierId);
        
        if (!supplier) {
          return res.status(400).json({ message: 'Supplier ID is invalid!' });
        } else {
          const {title,description,productName, initialPrice, newPrice, startDate,endDate, status, isActive} = req.body

          if(!title || !description || !startDate || !endDate || !description) {
            return res.status(400).json({message: 'All fields are required!'})
            }

          const ad = await Ad.create({
            supplier: supplierId,
            title,
            description,
            productName,
            initialPrice,
            newPrice,
            startDate,
            endDate,
            status,
            isActive: true
          });
  
          res.status(201).json({
            success: true,
            ad,
          });
        }
      } catch (error) {
        return res.status(400).json(error.message);
      }
});

const adminCreateAd = asyncHandler(async (req, res) => {
  try {
        const {title,description,productName, initialPrice, newPrice, startDate,endDate, status, supplier} = req.body

        if(!title || !description || !productName || !initialPrice || !newPrice || !startDate || !endDate || !supplier) {
          return res.status(400).json({message: 'All fields are required!'})
          }

        const supplierInfo = await Supplier.findById(supplier);
        if (!supplierInfo) {
          return res.status(400).json({ message: 'Supplier ID is invalid!' });
        }

        const ad = await Ad.create({
            supplier,
            title,
            description,
            productName,
            initialPrice,
            newPrice,
            startDate,
            endDate,
            status,
            isActive: true
        });

        res.status(201).json({
          success: true,
          ad,
        });
    } catch (error) {
      return res.status(400).json(error.message);
    }
  
})

const getAllAds = asyncHandler(async (req, res) => {
    const ads = await Ad.find().lean()
    if(!ads?.length) {
        return res.status(400).json({message: 'No Ads found'})
    }
    res.json(ads)
})

const updateAd = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { title,description,productName, initialPrice, newPrice,startDate,endDate, status, isActive } = req.body;

    try {
      const ad = await Ad.findById(id);

      if (!ad) {
        return next(new ErrorHandler('Ad not found', 404));
      }

      ad.title = title || ad.title;
      ad.description = description || ad.description;
      ad.productName = productName || ad.productName;
      ad.initialPrice= initialPrice || ad.initialPrice;
      ad.newPrice = newPrice || ad.newPrice;
      ad.startDate = startDate || ad.startDate;
      ad.endDate = endDate|| ad.endDate;
      ad.status = status || ad.status;
      ad.isActive = isActive !== undefined ? isActive : ad.isActive;

      await ad.save();

      res.status(200).json({
        success: true,
        message: 'Ad updated successfully!',
        ad,
      });
    } catch (error) {
      return res.status(400).json(error.message);
    }
})

const getAdsBySupplier = asyncHandler(async (req, res) => {
    try {
        const supplierId = req.params.supplierId;
        const ads = await Ad.find({ supplier: supplierId });
        res.status(200).json({ success: true, ads });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch ads' });
    }
})

const getAdById = asyncHandler(async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id);
        if(!ad) {
            return res.status(404).json({ message: 'Ad not found!' });
        }
      res.status(201).json({
        success: true,
        ad,
      });
      } catch (error) {
        return res.status(500).json(error.message);
      }
})

const deleteAd = asyncHandler(async (req, res) => {
    const ad = await Ad.findById(req.params.id);
  
        if (!ad) {
          return res.status(404).json({message: 'Ad is not found'});
        }
      
        await ad.deleteOne()
  
        res.status(201).json({
          success: true,
          message: "Ad Deleted successfully!",
        });
})

module.exports = {
    getAllAds, 
    createNewAd, 
    updateAd,
    getAdById,
    getAdsBySupplier,
    deleteAd,
    adminCreateAd
}