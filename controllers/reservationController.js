const Reservations= require("../models/reservationModel");
const factory = require("./handlerFactory");
const { v4: uuidv4 } = require("uuid");

exports.setLink = (req, res, next) => {
  const meetingId = uuidv4();
  const meetingUrl = `https://meet.jit.si/${meetingId}`;
  req.body.meetingLink = meetingUrl;
  req.body.patient = req.user.id;

  try {
    // Get the current date
    const today = new Date();
    // Parse the provided time
    const [time, period] = req.body.startedAt.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let hour = hours;

    // Convert to 24-hour format
    if (period.toLowerCase() === "pm" && hour !== 12) {
      hour += 12;
    } else if (period.toLowerCase() === "am" && hour === 12) {
      hour = 0;
    }

    // Set startedAt date and time
    const startedAt = new Date(today.setHours(hour, minutes || 0, 0, 0));

    // Check if startedAt is a valid date
    if (isNaN(startedAt.getTime())) {
      return res.status(400).json({ message: "Invalid startedAt date format" });
    }

    req.body.startedAt = startedAt.toISOString(); // Save as ISO string

    // Calculate expiredAt (1 hour after startedAt)
    const expiredAt = new Date(startedAt.getTime() + 60 * 60 * 1000); // 1 hour in milliseconds
    req.body.expiredAt = expiredAt.toISOString(); // Save as ISO string

    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid startedAt date format" });
  }
};



exports.addReservation = factory.createOne(Reservations);

exports.deleteReservations = factory.deleteOne(Reservations);

exports.updateReservation = factory.updateOne(Reservations);

exports.getAllReservations = factory.getAll(Reservations);

exports.getReservations = factory.getOne(Reservations);
