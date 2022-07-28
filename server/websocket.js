const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const router = require("./router");

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(router);

io.on("connection", (socket) => {
  socket.once("join", (username) => {

    io.emit("joinUser", {
      username,
      id: Date.now(),
      event: "connection",
      message: "",
    });
  });

  socket.on("sendMessage", (messageData) => {
    io.emit("message", {
      ...messageData,
    });
  });
});

server.listen(PORT, () => console.log(`Server started on ${PORT} port`));