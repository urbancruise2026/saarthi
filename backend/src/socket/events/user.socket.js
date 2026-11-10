const userSocket = (socket, io) => {
  socket.on("employee:create", (data) => {
    console.log("Employee Created", data);

    io.emit("employeeCreated", data);
  });
};

export default userSocket;
