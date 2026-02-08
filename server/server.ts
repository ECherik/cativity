import express from "express";
import http from "http";
import {Server} from "socket.io";
import {Cat} from "../shared/types";
import {connectDB} from "./db";
import {User} from "./models/user";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // adjust for production
  },
});
connectDB();
// Store all connected cats
const cats: Record<string, Cat> = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Receive movement from client
  socket.on(
    "move",
    (data: {x: number; y: number; anim: "idle" | "walk" | "jump"}) => {
      if (!cats[socket.id]) return;
      cats[socket.id].x = data.x;
      cats[socket.id].y = data.y;
      cats[socket.id].anim = data.anim;

      // Broadcast to others
      socket.broadcast.emit("catMoved", cats[socket.id]);
    },
  );
  socket.on("signIn", async (userData) => {
    const {username, password} = userData;

    const user = await User.findOne({username});

    if (!user) {
      socket.emit("authError", "User not found");
      return;
    }

    if (user.password !== password) {
      socket.emit("authError", "Incorrect password");
      return;
    }

    // Create cat instance
    cats[socket.id] = {
      id: socket.id,
      x: 100 + Math.random() * 500,
      y: 100 + Math.random() * 300,
      anim: "idle",
      message: "",
      username: user.username,
      color: user.color,
    };

    socket.emit("init", Object.values(cats));
    socket.broadcast.emit("catJoined", cats[socket.id]);
  });

  socket.on("signUp", async (userData) => {
    const {username, password, color} = userData;

    console.log("🔔 [SIGN UP] Request received:", userData);

    try {
      // Check if username already exists
      const existing = await User.findOne({username});
      console.log("🔍 [SIGN UP] Existing user lookup:", existing);

      if (existing) {
        console.log("⛔ [SIGN UP] Username already taken:", username);
        socket.emit("authError", "Username already taken");
        return;
      }

      // Create user in DB
      const newUser = await User.create({
        username,
        password,
        color,
      });

      console.log("✅ [SIGN UP] New user created in DB:", newUser);

      // Create cat instance for this user
      cats[socket.id] = {
        id: socket.id,
        x: 100 + Math.random() * 500,
        y: 100 + Math.random() * 300,
        anim: "idle",
        message: "",
        username,
        color,
      };

      console.log("🐱 [CAT CREATED] Cat added to memory:", cats[socket.id]);

      // Send initial cat data to the new user
      socket.emit("init", Object.values(cats));

      // Broadcast new user to all other clients
      socket.broadcast.emit("catJoined", cats[socket.id]);
    } catch (err) {
      console.error("🔥 [SIGN UP ERROR]", err);
      socket.emit("authError", "Server error during sign up");
    }
  });

  // Receive message from client
  socket.on("message", (msg: string) => {
    if (!cats[socket.id]) return;
    cats[socket.id].message = msg;

    // Broadcast message
    io.emit("catMessage", {id: socket.id, message: msg});
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
