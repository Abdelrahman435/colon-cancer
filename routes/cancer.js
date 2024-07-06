const multer = require("multer");
var express = require("express");
var router = express.Router();
const authController = require("../controllers/authController");
const cancerController = require("../controllers/cancerController");

router.use(authController.protect);

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), cancerController.checkCancer);

module.exports = router;
