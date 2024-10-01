const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');

router.route('/')
    .get(brandController.getAllBrands)
    .post(brandController.createNewBrand)
    // .patch(brandController.updateBrand)
    .delete(brandController.deleteBrand)
router.put('/update-brand/:id', brandController.updateBrand)
router.get('/get-brand/:id', brandController.getBrand)
router.delete('/delete-brand/:id', brandController.deleteBrand)

module.exports = router;