const Reservations = require("../models/reservationModel");
const factory = require("./handlerFactory");
const { v4: uuidv4 } = require("uuid");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const cron = require("cron");

exports.setLink = (req, res, next) => {
  const meetingId = uuidv4();
  const meetingUrl = `https://meet.jit.si/${meetingId}`;
  req.body.meetingLink = meetingUrl;
  req.body.patient = req.user.id;
  next();
};

exports.setExpireDate = catchAsync(async (req, res, next) => {
  // Parse the provided startedAt date
  const startedAt = new Date(req.body.startedAt);

  // Check if startedAt is a valid date
  if (isNaN(startedAt.getTime())) {
    return res.status(400).json({ message: "Invalid startedAt date format" });
  }

  req.body.startedAt = startedAt.toISOString(); // Save as ISO string

  // Calculate expiredAt (1 hour after startedAt)
  const expiredAt = new Date(startedAt.getTime() + 60 * 60 * 1000); // 1 hour in milliseconds
  req.body.expiredAt = expiredAt.toISOString(); // Save as ISO string

  next();
});

exports.pushreservation = catchAsync(async (req, res, next) => {
  const doctor = req.body.doctor;
  await User.findByIdAndUpdate(doctor, {
    $push: { appointmentsBooked: req.body.startedAt },
  });
  next();
});

exports.addReservation = factory.createOne(Reservations);

exports.deleteReservations = factory.deleteOne(Reservations);

exports.updateReservation = factory.updateOne(Reservations);

exports.getAllReservations = factory.getAll(Reservations);

exports.getReservations = factory.getOne(Reservations);

const deleteReservations = async () => {
  try {
    const appoinmentsEnded = await Reservations.find({ status: "ended" });

    for (let i = 0; i < appoinmentsEnded.length; i++) {
      const doctorId = appoinmentsEnded[i].doctor;
      const startedAt = appoinmentsEnded[i].startedAt.toISOString(); // Convert to ISO string

      const result = await User.findByIdAndUpdate(
        doctorId,
        { $pull: { appointmentsBooked: startedAt } }
      );
    }

    await Reservations.deleteMany({ status: "ended" });

    console.log("All ended appointments have been updated and deleted");
  } catch (err) {
    console.error("Error resetting tables or deleting bookings:", err);
  }
};


const job = new cron.CronJob(
  "0 0 * * *",
  deleteReservations,
  null, // No completion callback
  true, // Start the job right now
  "Africa/Cairo"
);

exports.startCronJob = () => {
  job.start();
};

