const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    meetingLink: {
      type: String,
    },
    patient: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Meeting must belong to a patient"],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    startedAt: {
      type: Date, // Use Date type
      required: true,
    },
    expiredAt: {
      type: Date, // Use Date type
      required: true,
    },
    status: {
      type: String,
      enum: ["coming-soon", "open", "ended"],
      default: "coming-soon",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

reservationSchema.index({ doctor: 1, startedAt: 1 }, { unique: true });

reservationSchema.methods.updateStatus = async function () {
  const now = new Date(); // Current UTC time

  if (now >= new Date(this.startedAt) && now < new Date(this.expiredAt)) {
    this.status = "open";
  } else if (now >= new Date(this.expiredAt)) {
    this.status = "ended";
  } else {
    this.status = "coming-soon";
  }
};

reservationSchema.statics.updateMeetingStatus = async function (meetingId) {
  const meeting = await this.findById(meetingId);
  if (meeting) {
    await meeting.updateStatus();
  }
};

reservationSchema.pre("save", async function (next) {
  await this.updateStatus();
  next();
});

reservationSchema.pre(/^find/, async function (next) {
  this.populate({
    path: "patient",
    select: "firstName lastName email _id file",
  });

  next();
});
// After finding the documents, update their statuses
reservationSchema.post(/^find/, async function (docs, next) {
  if (docs.length > 0) {
    for (let doc of docs) {
      await doc.updateStatus();
    }
  }
  next();
})

const Reservations = mongoose.model("Reservations", reservationSchema);

module.exports = Reservations;
