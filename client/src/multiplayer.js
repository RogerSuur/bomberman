import { CollisionDetector } from "./collision.js";

export default class Multiplayer {
  constructor(socket, stateManager) {
    this.socket = socket;
    this.state = stateManager;
    this.players = {};
  }

  addPlayer(player) {
    this.players[player.playerId] = player;
  }

  removePlayer(playerId) {
    if (this.players[playerId]) {
      delete this.players[playerId];
    }
    console.log(this.players);
  }

  updatePlayerPosition(playerId, direction) {
    this.players[playerId].move(direction);
  }

  updatePlacedBomb(playerId, position) {
    this.players[playerId].placeBomb(position);
  }

  updatePlayerPowerUp(playerId, powerUp, row, col) {
    this.players[playerId].applyPowerUp(powerUp);
    this.players[playerId].removePowerUpRemotely(row, col);
  }

  updatePlayerBombsPlaced(playerId) {
    this.players[playerId].bombsPlaced--;
  }

  checkPlayersInFlames(bombsData) {
    Object.keys(this.players).forEach((playerId) => {
      const player = this.players[playerId];
      const playerPosition = player.currentPosition;

      Object.keys(bombsData).forEach((bombId) => {
        const bomb = bombsData[bombId];
        if (
          CollisionDetector.isPlayerInFlames(playerPosition, bomb.affectedCells)
        ) {
          player.handlePlayerHit(player);
        }
      });
    });
  }
}
