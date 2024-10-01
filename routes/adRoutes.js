const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const multer = require('multer');

router.route('/get-ads').get(adController.getAllAds)
router.route('/get-ads-supplier/:supplierId').get(adController.getAdsBySupplier)
router.route('/get-ad/:id').get(adController.getAdById)
router.route('/create-ad').post(adController.createNewAd)
router.route('/update-ad/:id').patch(adController.updateAd)
router.route('/delete-ad/:id').delete(adController.deleteAd)
router.route('/admin-create-ad').post(adController.adminCreateAd)

module.exports = router;