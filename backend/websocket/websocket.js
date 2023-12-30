import { templateMap } from "../game/tilemap.js";
import { populateMapWithWallsAndPowerUps } from "../game/init.js";
import Player from "../game/player.js";

const LOBBY_COUNTDOWN_SECONDS = 20;
const PRE_GAME_WAITING_SECONDS = 10;

const GameStages = {
  WAITING_FOR_PLAYERS: "waitingForPlayers",
  MENU_COUNTDOWN: "menuCountdown",
  GAME_COUNTDOWN: "gameCountdown",
  GAME_ONGOING: "gameOngoing",
  GAME_FINISHED: "gameFinished",
};

let currentGameStage = GameStages.WAITING_FOR_PLAYERS;

const GetUserlist = (sockets) => {
  let userlist = [];
  for (const socket of sockets) {
    if (socket.data.username != undefined) userlist.push(socket.data.username);
  }
  return userlist;
};
const GetUsers = (sockets) => {
  let users = [];
  for (const socket of sockets) {
    if (socket.data != undefined) users.push(socket.data);
  }
  return users;
};

const TickMenuCountDown = (io, data) => {
  io.to("lobby").emit("tickMenu", data);
};

const TickGameCountDown = (io, data) => {
  io.to("lobby").emit("tickGame", data);
};

const MAX_CONNECTIONS = 4;

let timeoutId;

const menuCountdown = async (io) => {
  currentGameStage = GameStages.MENU_COUNTDOWN;
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
      console.log(`Waiting new players for ${secondsLeft} seconds`);
      if (userNameList.length === 4) {
        clearInterval(menuCountdownTimer);
        gameCountdown(io);
      }
      TickMenuCountDown(io, data);
      secondsLeft--;
    }
  }, 1000);
  timeoutId = menuCountdownTimer;
};

const gameCountdown = (io) => {
  currentGameStage = GameStages.GAME_COUNTDOWN;
  let secondsLeft = PRE_GAME_WAITING_SECONDS;
  const gameStartTimer = setInterval(() => {
    if (secondsLeft <= 0) {
      clearInterval(gameStartTimer);
      GameStart(io);
    } else {
      console.log(`Game starts in ${secondsLeft} seconds`);
      TickGameCountDown(io, secondsLeft);
      secondsLeft--;
    }
  }, 1000);

  clearTimeout(timeoutId);
  timeoutId = gameStartTimer;
};

const connectionsCount = async (io, conns) => {
  console.log("conns", conns);
  if (conns === 2) {
    await menuCountdown(io);
  }
};

const Websocket = (io) => {
  io.on("connection", async (socket) => {
    if (
      currentGameStage === GameStages.GAME_ONGOING ||
      currentGameStage === GameStages.GAME_COUNTDOWN
    ) {
      console.log("Connection denied: Game is already in progress");
      io.to(socket.id).emit("prelobby error", {
        error: "Game is already in progress",
      });
      return;
    }
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
          io.to(socket.id).emit("prelobby error", {
            error: "Username already taken",
          });
        } else {
          socket.join("lobby");

          socket.data.username = username;
          userList.push(username);

          //count lobby connections and start countdown
          const roomUsers = await io.in("lobby").allSockets();
          await connectionsCount(io, roomUsers.size);

          let data = {
            users: GetUsers(conList),
            userNameList: userList,
          };

          io.to("lobby").emit("userlist", data);
        }
      });

      //TODO: handle game reset
      socket.on("gameReset", async () => {
        console.log("Resetting game in backend");
        currentGameStage = GameStages.WAITING_FOR_PLAYERS;
        // socket.broadcast.emit("gameReset", data);
        socket.join("lobby");

        const roomUsers = await io.in("lobby").allSockets();
        await connectionsCount(io, roomUsers.size);

        var conList = await io.fetchSockets();
        var userList = GetUserlist(conList);
        let data = {
          users: GetUsers(conList),
          userNameList: userList,
        };

        io.to("lobby").emit("userlist", data);
      });

      socket.on("move", (data) => {
        socket.broadcast.emit("broadcastMovement", data);
      });

      socket.on("placeBomb", (data) => {
        socket.broadcast.emit("broadcastBomb", data);
      });

      socket.on("powerUp", (data) => {
        socket.broadcast.emit("broadcastPowerUp", data);
      });

      socket.on("playerHit", (data) => {
        socket.broadcast.emit("broadcastPlayerHit", data);
      });

      socket.on("disconnect", async () => {
        var conList = await io.fetchSockets();
        var userList = GetUserlist(conList);
        let data = {
          users: GetUsers(conList),
          userNameList: userList,
        };
        if (currentGameStage === GameStages.GAME_ONGOING) {
          console.log("user disconnected while game ongoing", socket.data.id);
          //check if there are users left to keep playing
          if (data.userNameList.length < 2) {
            currentGameStage = GameStages.WAITING_FOR_PLAYERS;
          }
          socket.broadcast.emit("userDisconnected", socket.data.id);
        } else if (
          currentGameStage === GameStages.MENU_COUNTDOWN ||
          currentGameStage === GameStages.GAME_COUNTDOWN
        ) {
          console.log(
            `A user with ID ${socket.data.id} disconnected on countdown`
          );

          if (data.userNameList.length < 2) {
            //io.to("lobby").emit("resetCountDown", 0);
            clearTimeout(timeoutId);
            currentGameStage = GameStages.WAITING_FOR_PLAYERS;
          }
          io.to("lobby").emit("userlist", data);
        } else {
          console.log("user disconnected while gamestage", currentGameStage);
          // socket.broadcast.emit("userDisconnected", socket.data.id);
        }
      });
    } else {
      console.log("else");
      // console.log("Connection denied: Maximum clients reached");
      // io.emit("game full");
      // socket.disconnect(true);
    }
  });
};

//creates tilemap with randomized elements and player characters
const GameStart = async (io) => {
  currentGameStage = GameStages.GAME_ONGOING;
  const connections = await io.fetchSockets();
  const players = [];
  const positions = [
    { x: 72, y: 24 },
    { x: 504, y: 384 },
    { x: 504, y: 24 },
    { x: 72, y: 384 },
  ];

  connections.forEach((conn, index) => {
    if (conn.data.username) {
      console.log("PLAYER:", conn.data);
      const player = new Player(
        conn.data.id,
        conn.data.username,
        positions[index]
      );
      players.push(player);
    }
  });

  const randomizedMap = populateMapWithWallsAndPowerUps(
    templateMap,
    players.length
  );
  console.log("Start game with", players.length, "players.");
  console.log(randomizedMap);
  io.emit("startGame", randomizedMap, players);
};

export default Websocket;
