import { obstacles, cellSize, playerSize, powerUps, playerOffset } from "./config.js";

export class CollisionDetector {

  static performWallCheck(futurePosition) {
    const currentObstacles = obstacles;

    // Calculate the player's center position
    const playerCenterX = futurePosition.x + playerSize / 2;
    const playerCenterY = futurePosition.y + playerOffset + playerSize / 2;

    for (let index = 0; index < currentObstacles.length; index++) {
        const obstacle = currentObstacles[index];

        // Calculate the obstacle's center position
        const obstacleCenterX = obstacle.x * cellSize + cellSize / 2;
        const obstacleCenterY = obstacle.y * cellSize + cellSize / 2;

        // Calculate distances between player center and obstacle center
        const distanceX = Math.abs(playerCenterX - obstacleCenterX);
        const distanceY = Math.abs(playerCenterY - obstacleCenterY);

        // Check for collision based on proximity
        if (distanceX < (playerSize / 2 + cellSize / 2) && distanceY < (playerSize / 2 + cellSize / 2)) {
            return true; // Collision detected
        }
    }
    return false; // No collision detected
  }

  //check if player is on the div of a powerup
  static performPowerUpCheck(playerPosition) {
    const currentPowerUps = powerUps;

    for (let index = 0; index < currentPowerUps.length; index++) {
      const powerUp = currentPowerUps[index];

      const posXAgainstPowerUpMax = playerPosition.x + playerSize / 2 < powerUp.x * cellSize + cellSize;
      const posXAgainstPowerUpMin = playerPosition.x + playerSize / 2 > powerUp.x * cellSize;
      const posYAgainstPowerUpMax = playerPosition.y + playerOffset + playerSize / 2 < powerUp.y * cellSize + cellSize;
      const posYAgainstPowerUpMin = playerPosition.y + playerOffset + playerSize / 2 > powerUp.y * cellSize;

      if (posXAgainstPowerUpMax && posXAgainstPowerUpMin && posYAgainstPowerUpMax && posYAgainstPowerUpMin) {
        return true;
      }
    }
    return false;
  }

  static performBombVsBombCheck(row, col) {
    const cell = document.getElementById(`row-${row}-cell-${col}`);
    if (cell) {
      const bomb = cell.querySelector("div[class^='bomb']");
      return bomb ? bomb.id : null;
    }
    return null;
  }

  static findFlamesInCell(row, col) {
    const cell = document.getElementById(`row-${row}-cell-${col}`);
    if (cell) {
      const hasFlames = cell.querySelector("div[class^='expl-center']");
      if (hasFlames) return true;
    }
    return false;
  }

  static isPlayerInFlames(playerPosition, affectedCells) {
    const playerRow = Math.floor((playerPosition.y + playerOffset) / cellSize);
    const playerCol = Math.floor(playerPosition.x / cellSize);

    return affectedCells.some(
      ([row, col]) => playerRow === row && playerCol === col
    );
  }
}
