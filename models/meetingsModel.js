const mongoose = require("mongoose");

const meetingsSchema = new mongoose.Schema(
  {
    meetingLink: {
      type: String,
    },
    patient: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Meeting must belong to a patient"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    startedAt: {
      type: String, // Changed type to String
      required: true,
      trim: true,
    },
    expiredAt: {
      type: String, // Changed type to String
      required: true,
      trim: true,
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

// Modified updateStatus method to save the updated status
meetingsSchema.methods.updateStatus = async function () {
  const now = new Date();

  const startedAtDate = new Date(this.startedAt);
  const expiredAtDate = new Date(this.expiredAt);

  if (isNaN(startedAtDate.getTime()) || isNaN(expiredAtDate.getTime())) {
    throw new Error("Invalid date format for startedAt or expiredAt");
  }

  if (now >= startedAtDate && now < expiredAtDate) {
    this.status = "open";
  } else if (now >= expiredAtDate) {
    this.status = "ended";
  } else {
    this.status = "coming-soon";
  }

  await this.save();
};

// Static method to update the status of a document
meetingsSchema.statics.updateMeetingStatus = async function (meetingId) {
  const meeting = await this.findById(meetingId);
  if (meeting) {
    await meeting.updateStatus();
  }
};

meetingsSchema.pre(/^find/, function (next) {
  this.populate({
    path: "patient",
    select: "firstName lastName email _id file",
  });
  next();
});

const Meetings = mongoose.model("Meetings", meetingsSchema);

module.exports = Meetings;
