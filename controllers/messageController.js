const Message = require("../models/Message");
const factory = require("./handlerFactory");

exports.setId = (req, res, next) => {
  req.body.sender = req.user.id;
  next();
};

exports.saveMessage = factory(Message);

exports.getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.query;

    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json({
      status: "success",
      data: {
        messages,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
