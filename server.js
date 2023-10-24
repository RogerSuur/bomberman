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

import websocket from "./backend/websocket/websocket.js";

import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
const port = 8000;
const app = express();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "client")));

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

const srvr = http.createServer(app);
const server = srvr.listen(port);
websocket(server);
console.debug(`Server listening on http://localhost:${port}/`);
