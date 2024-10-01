const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');

router.route('/')
    .get(maintenanceController.getMaintenanceSettings)
    .post(maintenanceController.createMaintenanceSettings)
    .patch(maintenanceController.updateMaintenanceSettings)
    // .delete(faqController.deleteFAQ)

module.exports = router;