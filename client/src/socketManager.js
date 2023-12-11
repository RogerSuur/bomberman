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

        this.socket.on("broadcastBomb", (data) => this.handlePlacedBomb(data));

        this.socket.on("broadcastPowerUp", (data) =>
            this.handlePlayerPowerUp(data)
        );
    }

    handlePlayerMoved(data) {
        this.multiplayer.updatePlayerPosition(data.playerId, data.direction);
    }

    handlePlacedBomb(data) {
        this.multiplayer.updatePlacedBomb(data.playerId, data.position);
    }

    handlePlayerPowerUp(data) {
        this.multiplayer.updatePlayerPowerUp(data.playerId, data.powerUp);
    }

    // TODO: different socket events
    // player lost life
    // bomb planted etc
}
