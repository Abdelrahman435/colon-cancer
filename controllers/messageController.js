const Message = require("../models/Message");
const factory = require("./handlerFactory");

exports.sendMessage = async (req, res) => {
  try {
    const newMessage = await factory.createOne(Message)(req, res);

    // Emit the new message to both sender and receiver
    req.io.emit("newMessage", {
      sender: newMessage.sender,
      receiver: newMessage.receiver,
      content: newMessage.content,
      timestamp: newMessage.timestamp,
    });

    res.status(201).json({
      status: "success",
      data: {
        message: newMessage,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

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
