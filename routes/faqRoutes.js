const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

router.route('/')
    .get(faqController.getAllFAQs)
    .post(faqController.createNewFAQ)
router.route('/get-faq/:id').get(faqController.getFAQById)
router.route('/update-faq/:id').patch(faqController.updateFAQ)
router.route('/delete-faq/:id').delete(faqController.deleteFAQ)

module.exports = router;