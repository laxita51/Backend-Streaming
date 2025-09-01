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

const getAllowedOrigins = () => {
  const origins = [
    "http://localhost:5173",
    "http://10.97.145.176:5173",
    process.env.FRONTEND_ORIGIN
  ].filter(Boolean); 
  
  return [...new Set(origins)];
};

const allowedOrigins = getAllowedOrigins();
console.log('🔄 Allowed CORS origins:', allowedOrigins);

const corsConfig = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(cors(corsConfig));
app.use(express.json());

app.use("/api/auth", authRoutes);

// ICE config endpoint
app.get("/api/ice", (req, res) => {
  console.log('ICE endpoint called');
  
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
  res.json({ 
    message: "API is running...",
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server
const server = http.createServer(app);

// Socket.IO configuration
import { Server } from "socket.io";
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Register signaling
registerSignaling(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});