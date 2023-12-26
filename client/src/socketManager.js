export default class SocketManager {
  constructor(socket, multiplayer) {
    this.socket = socket;
    this.multiplayer = multiplayer;

    this.registerEventHandlers();
  }

  registerEventHandlers() {
    this.socket.on("broadcastMovement", (data) => this.multiplayer.updatePlayerPosition(
      data.playerId,
      data.position,
    ));

    this.socket.on("broadcastBomb", (data) => this.multiplayer.updatePlacedBomb(
      data.playerId, 
      data.position,
    ));

    this.socket.on("broadcastPowerUp", (data) => this.multiplayer.updatePlayerPowerUp(
      data.playerId,
      data.powerUp,
      data.row,
      data.col
    ));
  }

  // TODO: different socket events
  // player lost life
  // bomb planted etc
}
