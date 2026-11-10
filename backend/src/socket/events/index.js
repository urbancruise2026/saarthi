import userSocket from "./user.socket.js";

const registerSocketEvents = (socket, io) => {
  userSocket(socket, io);
  //   leadSocket(socket, io);
};

export default registerSocketEvents;
