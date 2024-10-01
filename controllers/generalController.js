const General = require('../models/General');
const multer = require('multer');
const asyncHandler = require('express-async-handler');
const path = require('path');

// const imageStorage = multer.diskStorage({
//     // Destination to store image     
//     destination: 'images', 
//       filename: (req, file, cb) => {
//           cb(null, file.fieldname + '_' + Date.now() 
//              + path.extname(file.originalname))
//             // file.fieldname is name of the field (image)
//             // path.extname get the uploaded file extension
//     }
// });

// const imageUpload = multer({
//     storage: imageStorage,
//     limits: {
//       fileSize: 10000000 // 1000000 Bytes = 1 MB
//     },
//     fileFilter(req, file, cb) {
//       if (!file.originalname.match(/\.(png|jpg)$/)) { 
//          // upload only png and jpg format
//          return cb(new Error('Please upload a Image'))
//        }
//      cb(undefined, true)
//   }
// })
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });


// Create or update general settings with images
// const createNewGeneralSettings = asyncHandler(async (req, res) => {
//   try {
//     // Upload logo and icon images
//     upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'icon', maxCount: 1 }, { name: 'backgroundImage', maxCount: 1 }])(req, res, async function(err) {
//       if (err) {
//         return res.status(400).json({ message: 'Error uploading images', error: err.message });
//       }
      
//       const { siteTitle, heroTitle, heroSubTitle } = req.body;

//       // Check if there's an existing general settings document
//       let generalSettings = await General.findOne();

//       // If no document exists, create a new one
//       if (!generalSettings) {
//         generalSettings = new General({ siteTitle, heroTitle, heroSubTitle });
//       } else {
//         // Update existing document with new values
//         generalSettings.siteTitle = siteTitle;
//         generalSettings.heroTitle = heroTitle;
//         generalSettings.heroSubTitle = heroSubTitle;
//       }

//       // Check if logo image is uploaded
//       if (req.files && req.files['logo']) {
//         generalSettings.logo = req.files['logo'][0];
//       }

//       // Check if icon image is uploaded
//       if (req.files && req.files['icon']) {
//         generalSettings.icon = req.files['icon'][0];
//       }

//       if (req.files && req.files['backgroundImage']) {
//         generalSettings.backgroundImage = req.files['backgroundImage'][0];
//       }

//       // Save general settings to the database
//       await generalSettings.save();

//       res.status(201).json({ message: 'General settings created/updated successfully', data: generalSettings });
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating/updating general settings', error: error.message });
//   }
// });

const createNewGeneralSettings = asyncHandler(async (req, res) => {
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'icon', maxCount: 1 }, { name: 'backgroundImage', maxCount: 1 }])(req, res, async function(err) {
    if (err) {
      return res.status(400).json({ message: 'Error uploading images', error: err.message });
    }
    const { siteTitle, heroTitle, heroSubTitle } = req.body;
    const logo = req.files['logo'][0].filename;
    const icon = req.files['icon'][0].filename;
    const backgroundImage = req.files['backgroundImage'][0].filename;
  try {
    // Upload logo and icon images
      // const { siteTitle, heroTitle, heroSubTitle } = req.body;

      // Check if there's an existing general settings document
      let generalSettings = await General.findOne();

      // If no document exists, create a new one
      if (!generalSettings) {
        generalSettings = new General({ siteTitle, heroTitle, heroSubTitle, logo, icon, backgroundImage });
      } else {
        // Update existing document with new values
        generalSettings.siteTitle = siteTitle;
        generalSettings.heroTitle = heroTitle;
        generalSettings.heroSubTitle = heroSubTitle;
        generalSettings.logo = logo;
        generalSettings.icon = icon;
        generalSettings.backgroundImage = backgroundImage;
      }


      // Save general settings to the database
      await generalSettings.save();

      res.status(201).json({ message: 'General settings created/updated successfully', data: generalSettings });
  } catch (error) {
    res.status(500).json({ message: 'Error creating/updating general settings', error: error.message });
  }
})
});

const updateGeneralSettings = asyncHandler(async (req, res) => {
    try {
      // Upload logo and icon images using Multer
      imageUpload.fields([{ name: 'logo', maxCount: 1 }, { name: 'icon', maxCount: 1 }, { name: 'backgroundImage', maxCount: 1 }])(req, res, async function(err) {
        if (err) {
          return res.status(400).json({ message: 'Error uploading images', error: err.message });
        }
        
        const { id, siteTitle, heroTitle, heroSubTitle,} = req.body;

    // confirm data
        if(!id || !siteTitle || !heroTitle || !heroSubTitle) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const general = await General.findById(id).exec()

        if(!general) {
            return res.status(400).json({ message: 'General settings not found' })
        }
  
        // Update existing document with new values
        general.siteTitle = siteTitle;
        general.heroTitle = heroTitle;
        general.heroSubTitle = heroSubTitle;
  
        // Check if logo image is uploaded
        if (req.files && req.files['logo']) {
          general.logo = req.files['logo'][0].path;
        }
  
        // Check if icon image is uploaded
        if (req.files && req.files['icon']) {
          general.icon = req.files['icon'][0].path;
        }

        if (req.files && req.files['backgroundImage']) {
          general.backgroundImage = req.files['backgroundImage'][0].path;
        }
  
        // Save updated general settings to the database
        await general.save();
  
        res.status(200).json({ message: 'General settings updated successfully', data: general });
      });
    } catch (error) {
      res.status(500).json({ message: 'Error updating general settings', error: error.message });
    }
});

const getGeneralSettings = asyncHandler(async (req, res) => {
    const general = await General.find().lean()
    if(!general?.length) {
        return res.status(400).json({message: 'No general settings found'})
    }
    res.json(general)
})
  

module.exports = {
    getGeneralSettings, 
    createNewGeneralSettings, 
    updateGeneralSettings,
    // deleteFAQ
}
