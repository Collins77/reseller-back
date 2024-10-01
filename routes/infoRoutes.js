const express = require('express');
const router = express.Router();
const infoController = require('../controllers/infoController');

router.route('/')
    .get(infoController.getInfo)
    .post(infoController.createNewInfo)
    .patch(infoController.updateInfo)

module.exports = router;