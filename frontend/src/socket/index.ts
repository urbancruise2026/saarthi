import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  (import.meta.env.VITE_SOCKET_URL as string | undefined) ||
  (typeof window !== "undefined" ? window.location.origin : "");

// ✅ Singleton - ek hi instance
let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: false, // ✅ manually connect karenge
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.on("connect", () => console.log("Socket connected:", s.id));
    s.on("disconnect", () => console.log("Socket disconnected"));
  }
};

export const disconnectSocket = () => {
  getSocket().disconnect();
};
