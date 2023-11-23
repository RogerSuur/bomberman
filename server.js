import Websocket from "./backend/websocket/websocket.js";

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
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.get("/", (_, res) => {
    res.sendFile(path.join(__dirname, "client", "index.html"));
});

Websocket(io);

httpServer.listen(port);

console.debug(`Server listening on http://localhost:${port}/`);
