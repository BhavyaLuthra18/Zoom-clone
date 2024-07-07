import express from "express";
import http from "http";
import { v4 as uuidv4 } from "uuid";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

//PORT
const PORT = 3030;

//Peer Server
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  const roomId = uuidv4();
  // will automatically generate a uid for you and will redirect you to it
  res.redirect(`/${roomId}`);
});

// redirect took it to here then render room id with this
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

// on connect and user has to join a room
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    // joined the room with specific roomId
    socket.join(roomId);
    // tell the socket that our socket connected
    // its like broadcast that user
    socket.broadcast.to(roomId).emit("user-connected", userId);
    // if user is connected and listen for message , and receive message
    socket.on("message", (message) => {
      // after message received sent it to that roomId
      io.to(roomId).emit("createMessage", message);
    });
  });
});

server.listen(PORT);
