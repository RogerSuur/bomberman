import { templateMap } from "../game/tilemap.js";
import { populateMapWithWallsAndPowerUps } from "../game/init.js";
import Player from "../game/player.js";

const LOBBY_COUNTDOWN_SECONDS = 5;
const PRE_GAME_WAITING_MILLISECONDS = 1500;

const GetUserlist = (sockets) => {
  let userlist = [];
  for (const socket of sockets) {
    if (socket.data.username != undefined) userlist.push(socket.data.username);
  }
  console.log("userlist updated", userlist)
  return userlist;
};
const GetUsers = (sockets) => {
  let users = [];
  for (const socket of sockets) {
    if (socket.data != undefined)
      users.push(socket.data);
  }
  return users;
};


const Tick = (io, data) => {
  io.to("lobby").emit("tick", data);
};

const MAX_CONNECTIONS = 4;

let timeoutId;

const menuCountdown = async (io) => {
  io.emit("menu countdown");
  let secondsLeft = LOBBY_COUNTDOWN_SECONDS;

  const menuCountdownTimer = setInterval(async () => {
    if (secondsLeft <= 0) {
      clearInterval(menuCountdownTimer);
      gameCountdown(io);
    } else {
      var conList = await io.fetchSockets();
      var userNameList = GetUserlist(conList);
      var users = GetUsers(conList);

      var data = {
        userNameList: userNameList,
        users: users,
        seconds: secondsLeft,
      };
       Tick(io, data);
      secondsLeft--;
    }
  }, 1000);
  timeoutId = menuCountdownTimer;
};

const gameCountdown = (io) => {
  io.emit("game countdown");
  const gameStartTimer = setTimeout(() => {
    GameStart(io);
  }, PRE_GAME_WAITING_MILLISECONDS);
  clearTimeout(timeoutId);
  timeoutId = gameStartTimer;
};

const connectionsCount = async (io, conns) =>
  conns === 4 ? gameCountdown(io) : conns === 2 && (await menuCountdown(io));

const Websocket = (io) => {
  io.on("connection", async (socket) => {
    const connections = await io.fetchSockets();
    const roomUsers = await io.in("lobby").allSockets();

    if (roomUsers.size <= MAX_CONNECTIONS) {
      socket.data.id = socket.id;

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

          //count lobby connections and start countdown
          const roomUsers = await io.in("lobby").allSockets();
          await connectionsCount(io, roomUsers.size);

          let data = {
            users: GetUsers(conList),
            userNameList: userList
          }


          io.to("lobby").emit("userlist", data);
        }

      });

      /* socket.on("stateUpdate", () => {
        console.log("stateUpdate");
      }); */

      socket.on("move", (data) => {
        socket.broadcast.emit("broadcastMovement", data);
      });

      socket.on("placeBomb", (data) => {
        socket.broadcast.emit("broadcastBomb", data);
      });

      socket.on("powerUp", (data) => {
        socket.broadcast.emit("broadcastPowerUp", data);
      });
      
      socket.on("disconnect", async () => {
        connections.length < 3 &&
          timeoutId &&
          socket.emit("countdown stopped") &&
          clearTimeout(timeoutId);
        // console.log(socket.data);
        console.log(`A user with ID ${socket.data.id} disconnected`);
        socket.broadcast.emit("user left", socket.data.id);
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
    { x: 72, y: 24 },
    { x: 504, y: 384 },
    { x: 504, y: 24 },
    { x: 72, y: 384 },
  ];

  connections.forEach((conn, index) => {
    console.log("PLAYER:", conn.data);
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
  console.log(randomizedMap);
  io.emit("startGame", randomizedMap, players);
};

export default Websocket;
