// const express from "express");
// const path from "path");

// const app = express();
// const port = process.env.PORT || 3000;

// // Serve static files from the 'public' directory
// // app.use(express.static(path.join(__dirname, "public")));

// app.listen(port, () => {
//   console.log(`Server listening on http://localhost:${port}/`);
// });

// const http from "http");
// const port = 8000;
// const express from "express");

// const path from "path");
// const app = express();
// app.use("/", express.static(path.join(__dirname, "public")));

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "index.html"));
// });

// const server = http.createServer(app);
// server.listen(port);
// console.debug(`Server listening on http://localhost:${port}/`);

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

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

Websocket(io);

httpServer.listen(port);

console.debug(`Server listening on http://localhost:${port}/`);
