const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controllers');


router.post('/airtable', webhookController.handleAirtableWebhook);

module.exports = router;