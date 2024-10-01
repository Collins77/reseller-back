const Maintenance = require('../models/Maintenance');
const asyncHandler = require('express-async-handler');


const createMaintenanceSettings = asyncHandler(async (req, res) => {
      try {
          const { isActive, title, description } = req.body;
    
          // Check if there's an existing general settings document
          let maintenanceSettings = await Maintenance.findOne();
    
          // If no document exists, create a new one
          if (!maintenanceSettings) {
            maintenanceSettings = new Maintenance({ isActive, title, description });
          } else {
            // Update existing document with new values
            maintenanceSettings.isActive = isActive;
            maintenanceSettings.title = title;
            maintenanceSettings.description = description;  
          }
          // Save general settings to the database
          await maintenanceSettings.save();
    
          res.status(201).json({ message: 'Maintenance settings created/updated successfully', data: maintenanceSettings });
      } catch (error) {
        res.status(500).json({ message: 'Error creating/updating maintenance settings', error: error.message });
      }
});

  

const updateMaintenanceSettings = asyncHandler(async (req, res) => {    
    try {
        const { id, isActive, title, description } = req.body;
        // const coverImage = req.file.path; // Assuming Multer has added the file path to req.file

        if(!id || !title || !description) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const maintenance = await Maintenance.findById(id).exec()

        if(!maintenance) {
            return res.status(400).json({ message: 'Maintenance settings not found' })
        }
    
        // Update existing document with new values
        maintenance.title = title;
        maintenance.description = description;
        maintenance.isActive = isActive;

        // Save maintenance settings to the database
        await maintenance.save();

        res.status(200).json({ message: 'Maintenance settings updated successfully', data: maintenance });
    } catch (error) {
        res.status(500).json({ message: 'Error updating maintenance settings', error: error.message });
    }
});

const getMaintenanceSettings = asyncHandler(async (req, res) => {
    const maintenance = await Maintenance.find().lean()
    if(!maintenance?.length) {
        return res.status(400).json({message: 'No maintenance settings found'})
    }
    res.json(maintenance)
})

module.exports = { 
    createMaintenanceSettings, 
    getMaintenanceSettings, 
    updateMaintenanceSettings,
    // deleteFAQ
}