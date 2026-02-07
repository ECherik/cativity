import { Server } from "socket.io";
import { CatState } from "../shared/types";

const io = new Server(3000, {
  cors: { origin: "*" } // allow all clients for testing
});

console.log("Socket.IO server running on port 3000");

const players: Record<string, CatState> = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Initialize cat
  players[socket.id] = { id: socket.id, x: 100, y: 400, anim: "idle" };

  // Broadcast current state
  io.emit("state", Object.values(players));

  // Handle updates
  socket.on("update", (data: Partial<CatState>) => {
    players[socket.id] = { ...players[socket.id], ...data };
    io.emit("state", Object.values(players));
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete players[socket.id];
    io.emit("state", Object.values(players));
  });
});
