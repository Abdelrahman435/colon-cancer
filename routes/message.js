const express = require("express");
const messageController = require("../controllers/messageController");

const router = express.Router();

router.use(authController.protect);

// Route to send a message
router.post("/send", messageController.setId, messageController.saveMessage);

// Route to get messages between two users
router.get("/get", messageController.getMessages);

module.exports = router;
