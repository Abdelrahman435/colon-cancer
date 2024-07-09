var express = require("express");
var router = express.Router();
const authController = require("../controllers/authController");
const meetingsController = require("../controllers/meetingsController");

router.use(authController.protect);

router
  .route("/:id")
  .get(meetingsController.getMeetings)
  .delete(meetingsController.deleteMeetings)
  .patch(meetingsController.updateMeeting);

router
  .route("/")
  .post(meetingsController.setLink, meetingsController.addMeeting)
  .get(meetingsController.getAllMeetings);

module.exports = router;
