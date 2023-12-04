import { templateMap } from "../game/tilemap.js";
import { populateMapWithWallsAndPowerUps } from "../game/init.js";
import Player from "../game/player.js";


const GetUserlist = (sockets) => {
  let userlist = [];
  for (const socket of sockets) {
    if (socket.data != undefined)
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

const connectionsCount = (io, conns) =>
  conns === 4 ? gameCountdown(io) : conns === 2 && menuCountdown(io);

const Websocket = (io) => {
  io.on("connection", async (socket) => {
    const connections = await io.fetchSockets();

    if (connections.length <= MAX_CONNECTIONS) {
      socket.data.id = socket.id;
      connectionsCount(io, connections.length);

        // Listen for chat messages
        socket.on("chatMessage", (message) => {
            // Broadcast the message to all connected users
            io.emit("chatMessage", message);
        });

      socket.on("username", async (username) => {
        socket.join(socket.id);
        var conList = await io.fetchSockets();

        var userList = GetUserlist(conList);

        if (userList.includes(username)) {
          io.to(socket.id).emit("username taken");
        } else {
          socket.join("lobby");

          socket.data.username = username;
          userList.push(username);

          io.to("lobby").emit("userlist", userList);
        }


      });

      socket.on("stateUpdate", () => {
        console.log("stateUpdate");
      });

      socket.on("disconnecting", () => {
        console.log(`A user ${socket.data.username} disconnected`);
        // socket.emit("user left", socket.data.username);
      });

      socket.on("disconnect", async () => {
        connections.length < 3 && timeoutId && socket.emit("countdown stopped") && clearTimeout(timeoutId);
        // console.log(socket.data);
        console.log("A user disconnected");
        var conList = await io.fetchSockets();
        var userList = GetUserlist(conList);
        io.to("lobby").emit("userlist", userList);
      });
    } else {
      console.log("Connection denied: Maximum clients reached");
      io.emit("game full");
      socket.disconnect(true);
    }
  });
};

//creates tilemap with randomized elements and player characters
const GameStart = async (io) => {
  //TODO: wants number of players
  const connections = await io.fetchSockets();
  const players = [];
  const positions = [
    { x: 72, y: 36 },
    { x: 504, y: 396 },
    { x: 504, y: 36 },
    { x: 72, y: 396 },
  ];

  connections.forEach((conn, index) => {
    // console.log("PLAYER:", conn.data);
    const player = new Player(
      conn.data.id,
      conn.data.username,
      positions[index]
    );
    players.push(player);
  });
  const randomizedMap = populateMapWithWallsAndPowerUps(
    templateMap,
    players.length
  );
  io.emit("startGame", randomizedMap, players);
};

export default Websocket;