import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { registerSignaling } from "./socket/signaling.js";

dotenv.config();
connectDB();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://10.97.145.176:5173/",
    process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  ],
  credentials: true,
};

// Apply CORS globally
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// ICE config endpoint (frontend calls this) - Add explicit CORS
app.options("/api/ice", cors(corsOptions)); // Handle preflight requests
app.get("/api/ice", cors(corsOptions), (req, res) => {
  console.log('ICE endpoint called');
  
  // STUN only for now (good for demo). Add TURN later for reliability.
  res.json({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:global.stun.twilio.com:3478" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ],
  });
});

app.get("/", (_req, res) => {
  res.send("API is running...");
});

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);

import { Server } from "socket.io";
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_ORIGIN || "http://localhost:5173", // Changed from "*" to match your origin
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Register signaling namespace/handlers
registerSignaling(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));