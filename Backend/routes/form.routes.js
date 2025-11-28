const express = require('express');
const router = express.Router();
const formController = require('../controllers/form.controllers');
const verifyToken = require('../middleware/auth.middleware');
const submissionController = require('../controllers/submission.controllers');

router.get('/airtable-fields', verifyToken, formController.getAirtableFields);
router.post('/', verifyToken, formController.createForm);
router.get('/:id', formController.getFormById);
router.get('/', verifyToken, formController.getMyForms);
router.post('/:formId/submit', submissionController.submitResponse);
router.get('/:formId/responses', verifyToken, submissionController.getFormResponses);

module.exports = router;