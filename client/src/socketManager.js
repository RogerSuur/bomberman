export default class SocketManager {
    constructor(socket, multiplayer) {
        this.socket = socket;
        this.multiplayer = multiplayer;

        this.registerEventHandlers();
    }

    registerEventHandlers() {
        this.socket.on("broadcastMovement", (data) =>
            this.handlePlayerMoved(data)
        );
    }

    handlePlayerMoved(data) {
        this.multiplayer.updatePlayerPosition(data.playerId, data.direction);
    }

    // TODO: different socket events
    // player lost life
    // bomb planted etc
}
