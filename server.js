import Websocket from "./backend/websocket/websocket.js";

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

try {
    

    console.info("Starting the server setup...");
const port = process.env.PORT || 3000;
const app = express();
console.info("Express app created on port:", port);
const httpServer = createServer(app);
const io = new Server(httpServer);


console.info("HTTP and WebSocket servers created...");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, "client")));
console.info("Static files middleware added...");

app.use('/css', express.static(path.join(__dirname + '/node_modules/bootstrap/dist/css')));
console.info("Bootstrap CSS middleware added...");

app.get('/health', (_, res) => {
    console.info('Health check endpoint hit');
    res.status(200).send('OK');
});

app.get("/", (_, res) => {
    console.info("Received request to /, serving index.html");
    res.sendFile(path.join(__dirname, "client", "index.html"));
});

try {
    console.info("Initializing WebSocket...");
    Websocket(io);
    console.info("WebSocket initialized successfully.");
} catch (err) {
    console.error("WebSocket initialization error:", err);
}


httpServer.listen(port, "0.0.0.0", () => {
    console.debug(`Server listening on port ${port}`);
  });

} catch (error) {
    console.error("An error occurred while starting the server:", error);
    process.exit(1); // Exit gracefully with error code
}
