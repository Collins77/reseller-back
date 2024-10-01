const express = require('express');
const router = express.Router();
const generalController = require('../controllers/generalController');

router.route('/')
    .get(generalController.getGeneralSettings)
    .post(generalController.createNewGeneralSettings)
    .patch(generalController.updateGeneralSettings)

module.exports = router;