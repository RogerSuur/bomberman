import { templateMap } from "../game/tilemap.js";
import { randomizer } from "../game/init.js";

const GetUserlist = (sockets) => {
  let userlist = [];
  for (const socket of sockets) {
    userlist.push(socket.data.username);
  }
  return userlist;
};

const Websocket = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected');
  
    // Listen for chat messages
    socket.on('chatMessage', (message) => {
      // Broadcast the message to all connected users
      io.emit('chatMessage', message);
    });

    socket.on("stateUpdate", () => {
      console.log("stateUpdate");
    });

    socket.on("launch", () => {
      console.log("launching game");
      startGame(socket);
    });

    socket.on("disconnect", async () => {
      console.log("A user disconnected");
      const sockets = await io.fetchSockets();
      io.emit("userlist", GetUserlist(sockets));
    });
  });
};

//creates tilemap with randomized elements and player characters
function startGame(socket) {
  //TODO: wants number of players
  const playerCount = 4;
  const randomizedMap = randomizer(templateMap, playerCount);
  socket.emit("startGame", randomizedMap);
}


export default Websocket;
