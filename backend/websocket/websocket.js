import { templateMap } from "../game/tilemap.js";
import { populateMapWithWallsAndPowerUps } from "../game/init.js";
import Player from "../game/player.js";

const GetUserlist = (sockets) => {
    let userlist = [];
    for (const socket of sockets) {
        if (socket.data != undefined) userlist.push(socket.data.username);
    }
    return userlist;
};

const Tick = (io, secondsLeft) => {
    io.to("lobby").emit("tick", secondsLeft);
};

const MAX_CONNECTIONS = 4;

let timeoutId;

const menuCountdown = async (io) => {
    io.emit("menu countdown");
    let secondsLeft = 3; // 20 seconds for menu countdown

    const menuCountdownTimer = setInterval(async () => {
        if (secondsLeft <= 0) {
            clearInterval(menuCountdownTimer);
            gameCountdown(io);
        } else {
            var conList = await io.fetchSockets();
            var users = GetUserlist(conList);

            var data = {
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
    }, 1000);
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
                    console.log("connections", roomUsers);
                    await connectionsCount(io, roomUsers.size);

                    io.to("lobby").emit("userlist", userList);
                }
            });

            socket.on("stateUpdate", () => {
                console.log("stateUpdate");
            });

            socket.on("move", (data) => {
                socket.broadcast.emit("broadcastMovement", data);
            });

            socket.on("move", (data) => {
                socket.broadcast.emit("broadcastMovement", data);
            });

            socket.on("disconnecting", () => {
                console.log(`A user ${socket.data.username} disconnected`);
                socket.broadcast.emit("user left", socket.data.username);
            });

            socket.on("disconnect", async () => {
                connections.length < 3 &&
                    timeoutId &&
                    socket.emit("countdown stopped") &&
                    clearTimeout(timeoutId);
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
    io.emit("startGame", randomizedMap, players);
};

export default Websocket;
