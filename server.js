#!/usr/bin/env node

/**
 * Module dependencies.
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");
const User = require("./models/userModel");
const Message = require("../models/Message");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

var app = require("./app");
var debug = require("debug")("server:server");

/**
 * Get port from environment and store in Express.
 */
dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {})
  .then(() => console.log("DB Connected"))
  .catch((error) => {
    console.error("Error connecting to the database:", error.message);
  });

var port = normalizePort(process.env.PORT || "4000");
app.set("port", port);

// Import the cron job function
const startCronJob = require("./controllers/reservationController");
const { log } = require("debug/src/node");

// Start the cron job
startCronJob.startCronJob();

/**
 * Create HTTP server.
 */
var server = http.createServer(app);

// Integrate Socket.io
const io = socketIo(server, {
  cors: {
    origin: "*", // Adjust this to limit access to your Flutter app only
    methods: ["GET", "POST"],
  },
});

const usp = io.of("/user-namespace");

usp.on("connection", async function (socket) {
  console.log("User Connected");

  var userId = socket.handshake.auth.token;

  try {
    await User.findByIdAndUpdate(
      { _id: userId },
      { $set: { status: "online" } }
    );
    socket.broadcast.emit("getOnlineUser", { userId: userId });
  } catch (error) {
    console.error("Error updating user status to online:", error);
    socket.disconnect(); // Optionally disconnect if something goes wrong
  }

  socket.on("disconnect", async function () {
    console.log("User Disconnected");

    try {
      await User.findByIdAndUpdate(
        { _id: userId },
        { $set: { status: "offline" } }
      );
      socket.broadcast.emit("getOfflineUser", { userId: userId });
    } catch (error) {
      console.error("Error updating user status to offline:", error);
    }
  });

  socket.on("newChat", function (data) {
    socket.broadcast.emit("loadNewChat", data);
  });

  socket.on("existsChat", async function (data) {
    var chats = await Message.find({
      $or: [
        { sender: data.sender_id, receiver: data.receiver_id },
        { sender: data.receiver_id, receiver: data.sender_id },
      ],
    });
    socket.emit("loadChats", { chats: data });
  });
});

// io.on("connection", (socket) => {
//   console.log("a user connected:", socket.id);

//   // Handle receiving a message
//   socket.on("sendMessage", (message) => {
//     console.log("Message received: ", message);
//     // Broadcast the message to all connected clients
//     socket.broadcast.emit("receiveMessage", message);
//   });

//   socket.on("disconnect", () => {
//     console.log("user disconnected:", socket.id);
//   });
// });

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
