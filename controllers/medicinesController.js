const Medicines = require("../models/medicinesModel");
const factory = require("./handlerFactory");

exports.setIDs = (req, res, next) => {
  req.body.doctor = req.user.id;
  next();
};

exports.addMedicine = factory.createOne(Medicines);

exports.deleteMedicines = factory.deleteOne(Medicines);

exports.updateMedicine = factory.updateOne(Medicines);

exports.getAllMedicines = factory.getAll(Medicines);

exports.getMedicines = factory.getOne(Medicines);
