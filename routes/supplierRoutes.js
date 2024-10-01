const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { requiresSupplierSignIn, verifySupplierToken } = require('../middleware/authMiddleware');

// router.route('/get-suppliers').get(supplierController.getAllSuppliers)
router.get("/get-suppliers", supplierController.getAllSuppliers);
router.route('/get-supplier/:id').get(supplierController.getSupplierById)
router.route('/register-supplier').post(supplierController.registerNewSupplier)
router.route('/admin-create-supplier').post(supplierController.adminCreateSupplier)
router.route('/login').post(supplierController.loginSupplier)
router.post('/logout', supplierController.logOutSupplier);
router.get("/supplier-info", verifySupplierToken, supplierController.getSupplierInfo);

// router.route('/delete-supplier/:id').delete(supplierController.deleteSupplier)
router.delete('/delete-supplier/:id', supplierController.deleteSupplier);
router.get('/unapproved-suppliers', supplierController.getNotApprovedSuppliers);
router.get('/approved-suppliers', supplierController.getApprovedSuppliers);
router.patch('/approve-supplier/:id', supplierController.approveSupplier);
router.patch('/hold-supplier/:id', supplierController.holdSupplier);
router.patch('/update-exchange/:id', supplierController.updateExchangeRate);
// router.put('/update-supplier/:id', supplierController.updateSupplier);
router.put('/update-supplier', verifySupplierToken, supplierController.updateSupplier);
router.patch('/reject-supplier/:id', supplierController.rejectSupplier);
router.get("/supplier-auth", requiresSupplierSignIn, (req, res) => {
    res.status(200).send({ ok: true });
  });
router.post('/forgot-password', supplierController.forgotPassword);
router.put('/change-password/:id', supplierController.changePassword);
router.get('/reset-password/:id/:token', supplierController.resetPassword);
router.post('/reset-password/:id/:token', supplierController.resetPasswordComplete);
// router.get("/test", isSupplier, supplierController.testController);
// router.route('/edit-account').patch(resellersController.updateReseller)
// router.route('/delete-reseller').delete(resellersController.deleteReseller)
    // .patch(resellersController.updateReseller)
    // .delete(resellersController.deleteReseller)

module.exports = router;