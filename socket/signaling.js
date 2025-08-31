// backend/socket/signaling.js
const rooms = new Map(); 
// Map<roomId, { publisherId: string|null, viewers: Set<string> }>

export function registerSignaling(io) {
  io.on("connection", (socket) => {
    let joinedRoom = null;
    let role = null;

    // Client joins a room with a chosen role
    socket.on("join-room", ({ roomId, role: clientRole }) => {
      if (!roomId || !clientRole) return;
      joinedRoom = roomId;
      role = clientRole;

      if (!rooms.has(roomId)) {
        rooms.set(roomId, { publisherId: null, viewers: new Set() });
      }

      const room = rooms.get(roomId);

      if (role === "publisher") {
        // Enforce one publisher per room
        if (room.publisherId && room.publisherId !== socket.id) {
          socket.emit("room-error", { message: "Publisher already exists in this room" });
          return;
        }
        room.publisherId = socket.id;
      } else {
        room.viewers.add(socket.id);
      }

      socket.join(roomId);
      socket.emit("room-joined", { roomId, role });

      // Let publisher know a viewer joined so they can start a peer connection for that viewer
      if (role === "viewer" && room.publisherId) {
        io.to(room.publisherId).emit("viewer-joined", { viewerId: socket.id });
      }
    });

    // Relay WebRTC signals to a specific target socket (offer/answer/candidate)
    socket.on("webrtc-offer", ({ targetId, sdp }) => {
      if (!targetId || !sdp) return;
      io.to(targetId).emit("webrtc-offer", { fromId: socket.id, sdp });
    });

    socket.on("webrtc-answer", ({ targetId, sdp }) => {
      if (!targetId || !sdp) return;
      io.to(targetId).emit("webrtc-answer", { fromId: socket.id, sdp });
    });

    socket.on("webrtc-ice-candidate", ({ targetId, candidate }) => {
      if (!targetId || !candidate) return;
      io.to(targetId).emit("webrtc-ice-candidate", { fromId: socket.id, candidate });
    });

    socket.on("disconnect", () => {
      if (!joinedRoom) return;
      const room = rooms.get(joinedRoom);
      if (!room) return;

      if (role === "publisher" && room.publisherId === socket.id) {
        // Tear down: tell viewers publisher left
        io.to(joinedRoom).emit("publisher-left");
        room.publisherId = null;
      } else if (role === "viewer") {
        room.viewers.delete(socket.id);
        // Inform publisher that viewer left (optional)
        if (room.publisherId) {
          io.to(room.publisherId).emit("viewer-left", { viewerId: socket.id });
        }
      }

      // Cleanup empty room
      if (!room.publisherId && room.viewers.size === 0) {
        rooms.delete(joinedRoom);
      }
    });
  });
}
