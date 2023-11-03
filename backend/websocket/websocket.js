const GetUserlist = (sockets) => {
  let userlist = [];
  for (const socket of sockets) {
    userlist.push(socket.data.username);
  }
  return userlist;
};

const MAX_CONNECTIONS = 4;

const Websocket = (io) => {
  io.on("connection", async (socket) => {
    const connections = await io.fetchSockets();

    if (connections.length <= MAX_CONNECTIONS) {
      console.log("A user connected here");

      socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
      });

      socket.on("username", async (username) => {
        socket.data.username = username;
        console.log(socket.data.username);
        io.emit("user joined", socket.data.username);
      });

      socket.on("stateUpdate", () => {
        console.log("stateUpdate");
      });

      socket.on("disconnecting", () => {
        console.log(`A user ${socket.data.username} disconnected`);
        io.emit("user left", socket.data.username);
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected");
      });
    } else {
      console.log("Connection denied: Maximum clients reached");
      socket.emit("game full");
      socket.disconnect(true);
    }
  });
};

export default Websocket;
