// publisher.js
import { io } from "socket.io-client";

const socket = io("ws://localhost:5000");

socket.on("connect", () => {
  console.log("✅ Publisher connected:", socket.id);

  // Join a room as publisher
  socket.emit("join-room", { roomId: "demo", role: "publisher" });
});

socket.on("room-joined", (data) => {
  console.log("📦 Joined room:", data);
});

// A viewer joined
socket.on("viewer-joined", ({ viewerId }) => {
  console.log("👀 Viewer joined:", viewerId);

  // In real WebRTC we would send an offer here
  // For test, just simulate sending a fake offer
  socket.emit("webrtc-offer", { targetId: viewerId, sdp: "fake-offer-sdp" });
});

// Handle viewer answer
socket.on("webrtc-answer", ({ fromId, sdp }) => {
  console.log("📨 Got answer from viewer:", fromId, "SDP:", sdp);
});

// Handle ICE candidate
socket.on("webrtc-ice-candidate", ({ fromId, candidate }) => {
  console.log("📨 Got ICE candidate from:", fromId, "Candidate:", candidate);
});

socket.on("disconnect", () => {
  console.log("❌ Publisher disconnected");
});
