export default class Multiplayer {
    constructor(socket, stateManager) {
        this.socket = socket;
        this.state = stateManager;
        this.players = {};
    }

    addPlayer(player) {
        console.log(player);
        this.players[player.playerId] = player;
    }

    updatePlayerPosition(playerId, direction) {
        console.log("PLayer" + playerId + "moves for players" + this.players);
        this.players[playerId].move(direction);
    }
}
