import { Server } from "socket.io";
import registerSocketEvents from "./events/index.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 User Connected:", socket.id);

    registerSocketEvents(socket, io);

    socket.on("disconnect", () => {
      console.log("🔴 User Disconnected:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
