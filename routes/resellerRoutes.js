const express = require('express');
const router = express.Router();
const resellersController = require('../controllers/resellersController');
const { requireSignIn, verifyToken } = require('../middleware/authMiddleware');
// const auth = require('../middleware/authMiddleware');

router.get('/get-resellers', resellersController.getAllResellers);
router.get('/get-reseller/:id',  resellersController.getResellerById);
// router.get('/get-reseller', requireSignIn, resellersController.getResellerByToken);
router.get("/reseller-info", verifyToken, resellersController.getResellerInfo);

// router.get('/logged-in', resellersController.loggedIn);
router.get("/user-auth", requireSignIn, (req, res) => {
    res.status(200).send({ ok: true });
  });
router.post('/signup', resellersController.createNewReseller);
router.post('/admin-create-reseller', resellersController.adminCreateReseller);
router.post('/login', resellersController.loginReseller);
router.post('/logout', resellersController.logOutReseller);
router.patch('/edit-account', resellersController.updateReseller);
router.delete('/delete-reseller/:id', resellersController.deleteReseller);
router.get('/unapproved-resellers', resellersController.getNotApprovedResellers);
router.patch('/approve-reseller/:id', resellersController.approveReseller);
router.patch('/hold-reseller/:id', resellersController.holdReseller);
router.patch('/reject-reseller/:id', resellersController.rejectReseller);
router.put('/update-reseller', verifyToken, resellersController.updateReseller);
router.delete('/delete-reseller/:id', resellersController.deleteReseller);
router.post('/forgot-password', resellersController.forgotPassword);
router.get('/reset-password/:id/:token', resellersController.resetPassword);
router.post('/reset-password/:id/:token', resellersController.resetPasswordComplete);
router.put('/change-password/:id', resellersController.changePassword);

module.exports = router;