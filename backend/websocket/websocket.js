import { templateMap } from "../game/tilemap.js";
import { populateMapWithWallsAndPowerUps } from "../game/init.js";

const GetUserlist = (sockets) => {
    let userlist = [];
    for (const socket of sockets) {
        userlist.push(socket.data.username);
    }
    return userlist;
};

const MAX_CONNECTIONS = 4;

let timeoutId;

const menuCountdown = (io) => {
  io.emit("menu countdown");
  const menuCountdownTimer = setTimeout(() => {
    gameCountdown(io);
  }, 20000);
  timeoutId = menuCountdownTimer;
};

const gameCountdown = (io) => {
  io.emit("game countdown");
  const gameStartTimer = setTimeout(() => {
    GameStart(io);
  }, 10000);
  clearTimeout(timeoutId);
  timeoutId = gameStartTimer;
};

const GameStart = (io) => {
  io.emit("start");
};

const connectionsCount = (io, conns) =>
  conns === 4 ? gameCountdown(io) : conns === 2 && menuCountdown(io);

const Websocket = (io) => {
  io.on("connection", async (socket) => {
    const connections = await io.fetchSockets();

    if (connections.length <= MAX_CONNECTIONS) {
      connectionsCount(io, connections.length);

        // Listen for chat messages
        socket.on("chatMessage", (message) => {
            // Broadcast the message to all connected users
            io.emit("chatMessage", message);
        });

      socket.on("username", async (username) => {
        socket.data.username = username;
        socket.broadcast.emit("user joined", socket.data.username);
      });

      socket.on("stateUpdate", () => {
        console.log("stateUpdate");
      });

      socket.on("disconnecting", () => {
        console.log(`A user ${socket.data.username} disconnected`);
        socket.broadcast.emit("user left", socket.data.username);
      });

      socket.on("disconnect", () => {
        connections.length < 3 &&
          timeoutId &&
          socket.emit("countdown stopped") &&
          clearTimeout(timeoutId);
        console.log("A user disconnected");
      });
    } else {
      console.log("Connection denied: Maximum clients reached");
      io.emit("game full");
      socket.disconnect(true);
    }
  });
};

//creates tilemap with randomized elements and player characters
function startGame(io) {
    //TODO: wants number of players
    const playerCount = 4;
    const randomizedMap = populateMapWithWallsAndPowerUps(
        templateMap,
        playerCount
    );
    io.emit("startGame", randomizedMap, playerCount);
}

export default Websocket;
