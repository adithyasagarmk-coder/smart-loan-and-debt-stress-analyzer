const express = require('express');
const router = express.Router();
const { handleIntent } = require('../controllers/voiceController');

// POST /api/voice/intent
router.post('/intent', handleIntent);

module.exports = router;
