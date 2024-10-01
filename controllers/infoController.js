const Info = require('../models/Info')
const asyncHandler = require('express-async-handler');

const createNewInfo = asyncHandler(async (req, res) => {
    const { country, city, address, phone, email } = req.body;

    // Confirming data
    if(!country || !city || !address || !phone || !email) {
        return res.status(400).json({message: 'All fields are required!'})
    }

    // const infoObject = { country, city, address, phone, email }
    let companyInfo = await Info.findOne();

      // If no document exists, create a new one
      if (!companyInfo) {
        companyInfo = new General({ country, city, address, phone, email });
      } else {
        // Update existing document with new values
        companyInfo.country= country;
        companyInfo.city= city;
        companyInfo.address= address;
        companyInfo.phone= phone;
        companyInfo.email= email;
        
      }

      
      await companyInfo.save();

    if(companyInfo) {
        res.status(201).json({ message: `Information registered successfully` })
    } else {
        res.status(400).json({ message: 'Invalid information data received' })
    }
});

const getInfo = asyncHandler(async (req, res) => {
    const info = await Info.find().lean()
    if(!info?.length) {
        return res.status(400).json({message: 'No Information found'})
    }
    res.json(info)
})

const updateInfo = asyncHandler(async (req, res) => {
    const { id, country, city, address, phone, email} = req.body;

    // confirm data
    if(!id || !country || !city || !address || !phone || !email) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const info = await Info.findById(id).exec()

    if(!info) {
        return res.status(400).json({ message: 'Data not found' })
    }

    // check for duplicate
    // const duplicate = await Category.findOne({ name }).lean().exec()

    // // Allow updates to the original user
    // if(duplicate && duplicate?._id.toString() !== id) {
    //     return res.status(409).json({ message: 'Duplicate category name' })
    // }

    info.country = country
    info.city = city
    info.address = address
    info.phone = phone
    info.email = email

    const updatedInfo = await info.save();

    res.json({ message: `Company information updated` })
})



module.exports = {
    getInfo, 
    createNewInfo, 
    updateInfo
}