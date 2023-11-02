import { WebSocketServer } from "ws";

export default async (expressServer) => {
    const websocketServer = new WebSocketServer({
        noServer: true,
        path: "/websocket",
    });

    expressServer.on("upgrade", (request, socket, head) => {
        websocketServer.handleUpgrade(request, socket, head, (websocket) => {
            websocketServer.emit("connection", websocket, request);
        });
    });

    websocketServer.on(
        "connection",
        function connection(websocketConnection, connectionRequest) {
            websocketConnection.on("message", (message) => {
                const parsedMessage = JSON.parse(message);
                console.log(parsedMessage);

                websocketConnection.send(
                    JSON.stringify({
                        message: "There be gold in them thar hills.",
                    })
                );
            });
        }
    );

    return websocketServer;
};
