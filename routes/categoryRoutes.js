const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.route('/')
    .get(categoryController.getAllCategories)
    .post(categoryController.createNewCategory)
router.put('/update-category/:id', categoryController.updateCategory)
router.get('/get-category/:id', categoryController.getCategory)
router.delete('/delete-category/:id', categoryController.deleteCategory)

module.exports = router;