import { obstacles, cellSize, playerSize, powerUps, playerOffset } from "./config.js";

export class CollisionDetector {
  static performWallCheck(playerPosition, direction, speed) {
    const futurePosition = { ...playerPosition };
    switch (direction) {
      case "up":
        futurePosition.y -= speed;
        break;
      case "down":
        futurePosition.y += speed;
        break;
      case "left":
        futurePosition.x -= speed;
        break;
      case "right":
        futurePosition.x += speed;
        break;
    }

    const currentObstacles = obstacles;

    for (let index = 0; index < currentObstacles.length; index++) {
      const obstacle = currentObstacles[index];
      // console.log(`Checking obstacle at index ${index}:`, obstacle);
      
      const posXAgainstObstacle = futurePosition.x < obstacle.x * cellSize + cellSize;
      const posXAgainstPlayerSize = futurePosition.x + playerSize > obstacle.x * cellSize;
      const posYAgainstObstacle = futurePosition.y + playerOffset < obstacle.y * cellSize + cellSize;
      const posYAgainstPlayerSize = futurePosition.y + playerOffset + playerSize > obstacle.y * cellSize;

      if (posXAgainstObstacle && posXAgainstPlayerSize && posYAgainstObstacle && posYAgainstPlayerSize) {
        return true;
      }
    }
    return false;
  }

  //check if player is on the div of a powerup
  static performPowerUpCheck(playerPosition) {
    const currentPowerUps = powerUps;

    for (let index = 0; index < currentPowerUps.length; index++) {
      const powerUp = currentPowerUps[index];
      if (
        playerPosition.x + playerSize / 2 < powerUp.x * cellSize + cellSize &&
        playerPosition.x + playerSize / 2 > powerUp.x * cellSize &&
        playerPosition.y + playerOffset + playerSize / 2 < powerUp.y * cellSize + cellSize &&
        playerPosition.y + playerOffset + playerSize / 2 > powerUp.y * cellSize
      ) {
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
    const playerRow = Math.floor(playerPosition.y / cellSize);
    const playerCol = Math.floor(playerPosition.x / cellSize);

    return affectedCells.some(
      ([row, col]) => playerRow === row && playerCol === col
    );
  }
}
