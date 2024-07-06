const mongoose = require("mongoose");

const medicinesSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.ObjectId,
      ref: "User", // Should match the model name exactly
      required: true,
    },
    patient: {
      type: mongoose.Schema.ObjectId,
      ref: "User", // Should match the model name exactly
      required: true,
    },
    nameOfMedicine: {
      type: String,
      required: true,
    },
    quantityBerDay: {
      type: String,
      required: true,
    },
    timings: [
      {
        time: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

medicinesSchema.virtual("doctorId", {
  ref: "User",
  foreignField: "doctor",
  localField: "_id",
});

medicinesSchema.virtual("patientId", {
  ref: "User",
  foreignField: "patient",
  localField: "_id",
});

const Medicines = mongoose.model("Medicines", medicinesSchema);

module.exports = Medicines;
