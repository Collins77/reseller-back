const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const multer = require('multer');

router.route('/get-products').get(productController.getAllProducts)
router.route('/get-product/:id').get(productController.getProductById)
router.route('/get-products-supplier/:supplierId').get(productController.getProductsBySupplier)
router.route('/create-product').post(productController.createNewProduct)
router.route('/admin-create-product').post(productController.adminCreateProduct)
router.route('/delete-product/:id').delete(productController.deleteSupplierProduct)
router.route('/update-product/:id').put(productController.updateProduct)
router.get('/download-template', productController.downloadTemplate);
router.post('/upload-bulk', productController.uploadBulkProducts);

module.exports = router;