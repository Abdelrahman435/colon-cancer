// routes/messageRoutes.js

const express = require('express');
const messageController = require('../controllers/messageController');

const router = express.Router();

// Route to send a message
router.post('/send', messageController.sendMessage);

// Route to get messages between two users
router.get('/get', messageController.getMessages);

module.exports = router;
