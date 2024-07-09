const { v4: uuidv4 } = require("uuid");
const Meetings = require("../models/meetingsModel");
const factory = require("./handlerFactory");

exports.setLink = (req, res, next) => {
  const meetingId = uuidv4();
  const meetingUrl = `https://meet.jit.si/${meetingId}`;
  req.body.meetingLink = meetingUrl;
  req.body.createdBy = req.user.id;
  next();
};

exports.addMeeting = factory.createOne(Meetings);

exports.deleteMeetings = factory.deleteOne(Meetings);

exports.updateMeeting = factory.updateOne(Meetings);

exports.getAllMeetings = factory.getAll(Meetings);

exports.getMeetings = factory.getOne(Meetings);
