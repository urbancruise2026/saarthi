import { socket } from "./index";

export const listenLeadCreated = (callback: any) => {
  socket.on("leadCreated", callback);
};

export const listenLeadAssigned = (callback: any) => {
  socket.on("leadAssigned", callback);
};

export const listenLeadUpdated = (callback: any) => {
  socket.on("leadUpdated", callback);
};

export const removeLeadListeners = () => {
  socket.off("leadCreated");
  socket.off("leadAssigned");
  socket.off("leadUpdated");
};