export default class Multiplayer {
    constructor(socket, stateManager) {
        this.socket = socket;
        this.state = stateManager;
        this.players = {};
    }

    addPlayer(player) {
        this.players[player.playerId] = player;
    }

    updatePlayerPosition(playerId, direction) {
        this.players[playerId].move(direction);
    }

    updatePlacedBomb(playerId, position) {
        this.players[playerId].placeBomb(position);
    }

    applyPowerUp(playerId, powerUp) {
        this.players[playerId].powerUp += 1;
    }
}
