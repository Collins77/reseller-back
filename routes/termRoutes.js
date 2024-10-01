const express = require('express');
const router = express.Router();
const termController = require('../controllers/termController');

router.route('/')
    .get(termController.getAllTerms)
    .post(termController.createNewTerm)
router.route('/get-term/:id').get(termController.getTermById)
router.route('/update-term/:id').patch(termController.updateTerm)
router.route('/delete-term/:id').delete(termController.deleteTerm)

module.exports = router;