import { templateMap } from "./game/tilemap.js";
import { populateMapWithWallsAndPowerUps } from "./game/init.js";
import websocket from "./backend/websocket/websocket.js";

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const port = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, "client")));

app.get("/", (_, res) => {
    res.sendFile(path.join(__dirname, "client", "index.html"));
});

io.on("connection", (socket) => {
    console.log("A user connected");
    startGame(socket);

    socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
    });

    socket.on("stateUpdate", () => {
        console.log("stateUpdate");
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

httpServer.listen(port);

console.debug(`Server listening on http://localhost:${port}/`);

//creates tilemap with randomized elements and player characters
function startGame(socket) {
    //TODO: wants number of players
    const playerCount = 4;
    const randomizedMap = populateMapWithWallsAndPowerUps(
        templateMap,
        playerCount
    );
    socket.emit("startGame", randomizedMap);
}
