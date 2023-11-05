import { templateMap } from "../game/tilemap.js";
import { populateMapWithWallsAndPowerUps } from "../game/init.js";

const GetUserlist = (sockets) => {
    let userlist = [];
    for (const socket of sockets) {
        userlist.push(socket.data.username);
    }
    return userlist;
};

const Websocket = (io) => {
    io.on("connection", (socket) => {
        console.log("A user connected here");

        socket.on("chat message", (msg) => {
            io.emit("chat message", msg);
        });

        socket.on("username", async (username) => {
            socket.data.username = username;
            console.log(socket.data.username);

            const sockets = await io.fetchSockets();
            console.log(GetUserlist(sockets));
            io.emit("userlist", GetUserlist(sockets));
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
    const playerCount = 2;
    const randomizedMap = populateMapWithWallsAndPowerUps(
        templateMap,
        playerCount
    );
    socket.emit("startGame", randomizedMap, playerCount);
}

export default Websocket;
