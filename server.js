import Websocket from "./backend/websocket/websocket.js";

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

try {
    

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

try {
    Websocket(io);
} catch (err) {
    console.error("WebSocket initialization error:", err);
}

httpServer.listen(port);

httpServer.listen(port, "0.0.0.0", () => {
    console.debug(`Server listening on port ${port}`);
  });

} catch (error) {
    console.error("An error occurred while starting the server:", error);
    process.exit(1); // Exit gracefully with error code
}

process.on('SIGTERM', () => {
    console.info("SIGTERM signal received. Shutting down gracefully...");
    httpServer.close(() => {
        console.log("Closed out remaining connections.");
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.info("SIGINT signal received. Shutting down gracefully...");
    httpServer.close(() => {
        console.log("Closed out remaining connections.");
        process.exit(0);
    });
});