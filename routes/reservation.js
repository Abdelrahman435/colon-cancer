var express = require("express");
var router = express.Router();
const authController = require("../controllers/authController");
const reservationController = require("../controllers/reservationController");

router.use(authController.protect);

router
  .route("/:id")
  .get(reservationController.getReservations)
  .delete(reservationController.deleteReservations)
  .patch(reservationController.updateReservation);

router
  .route("/")
  .post(
    authController.restrictTo("user"),
    reservationController.setLink,
    reservationController.setExpireDate,
    reservationController.pushreservation,
    reservationController.addReservation
  )
  .get(reservationController.getAllReservations);

module.exports = router;
