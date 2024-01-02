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
      const player = document.getElementById(`player-${playerId}`);
      if (player) {
        player.parentNode.removeChild(player);
      }
      delete this.players[playerId];
    } else {
      console.log("this.players[playerId] doesnt exist");
    }

    const remainingPlayers = Object.values(this.players);
    if (remainingPlayers.length === 1) {
      remainingPlayers[0].win();
    }
  }

  updatePlayerPosition(playerId, position) {
    this.players[playerId].currentPosition = position;
    this.players[playerId].updatePosition();
  }

  updatePlacedBomb(playerId, position) {
    this.players[playerId].placeBomb(position);
  }

  updatePlayerPowerUp(playerId, powerUp, row, col) {
    this.players[playerId].applyPowerUp(powerUp);
    this.players[playerId].removePowerUpRemotely(row, col);
  }

  updatePlayerBombsPlaced(playerId) {
    if (this.players[playerId]) {
      this.players[playerId].bombsPlaced--;
    } else {
      console.log("this.players[playerId] doesnt exist");
    }
  }

  updatePlayerHit(playerId) {
    // update broadcasted player
    this.players[playerId].handlePlayerHit(this.players[playerId]);
  }

  resetPlayerPowerUps(playerId) {
    this.players[playerId].resetPowerUps();
  }

  checkPlayersInFlames(bombsData) {
    Object.keys(this.players).forEach((playerId) => {
      const player = this.players[playerId];

      if (!player.isLocalPlayer()) return;

      const playerPosition = player.currentPosition;

      Object.keys(bombsData).forEach((bombId) => {
        const bomb = bombsData[bombId];
        if (
          CollisionDetector.isPlayerInFlames(playerPosition, bomb.affectedCells)
        ) {
          // handle local player
          player.handlePlayerHit(player);
          // broadcast to other players
          this.socket.emit("playerHit", { playerId: player.playerId });
        }
      });
    });
  }

  updateUserLeft(data) {
    this.removePlayer(data);
    //TODO: Remove disconnected player from the HUD
  }
}
