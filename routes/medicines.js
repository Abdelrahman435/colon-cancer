var express = require("express");
var router = express.Router();
const authController = require("../controllers/authController");
const medicinesController = require("../controllers/medicinesController");

router.use(authController.protect);

router
  .route("/:id")
  .get(medicinesController.getMedicines)
  .delete(medicinesController.deleteMedicines)
  .patch(medicinesController.updateMedicine);

router
  .route("/")
  .post(medicinesController.setIDs, medicinesController.addMedicine)
  .get(medicinesController.getAllMedicines);

module.exports = router;
