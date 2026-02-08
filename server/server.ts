import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Cat } from "../shared/types";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // adjust for production
  },
});

// Store all connected cats
const cats: Record<string, Cat> = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Create a new cat for this user
  cats[socket.id] = {
    id: socket.id,
    x: 100 + Math.random() * 500,
    y: 100 + Math.random() * 300,
    anim: "idle",
    message: "",
  };

  // Send initial cat data to the new user
  socket.emit("init", Object.values(cats));

  // Broadcast new user to all other clients
  socket.broadcast.emit("catJoined", cats[socket.id]);

  // Receive movement from client
  socket.on("move", (data: { x: number; y: number; anim: 'idle' | 'walk' | 'jump' }) => {
    if (!cats[socket.id]) return;
    cats[socket.id].x = data.x;
    cats[socket.id].y = data.y;
    cats[socket.id].anim = data.anim;

    // Broadcast to others
    socket.broadcast.emit("catMoved", cats[socket.id]);
  });

  // Receive message from client
  socket.on("message", (msg: string) => {
    if (!cats[socket.id]) return;
    cats[socket.id].message = msg;

    // Broadcast message
    io.emit("catMessage", { id: socket.id, message: msg });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete cats[socket.id];
    io.emit("catLeft", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
