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
    const cornerProximity = cellSize * 0.1;
    
    for (let index = 0; index < currentObstacles.length; index++) {
      const obstacle = currentObstacles[index];
      
      const obstacleLeftEdge = obstacle.x * cellSize;
      const obstacleRightEdge = obstacleLeftEdge + cellSize;
      const obstacleTopEdge = obstacle.y * cellSize;
      const obstacleBottomEdge = obstacleTopEdge + cellSize;
  
      const playerLeftEdge = futurePosition.x;
      const playerRightEdge = playerLeftEdge + playerSize;
      const playerTopEdge = futurePosition.y + playerOffset;
      const playerBottomEdge = playerTopEdge + playerSize;
  
      // Collision check
      if (playerRightEdge > obstacleLeftEdge && playerLeftEdge < obstacleRightEdge &&
          playerBottomEdge > obstacleTopEdge && playerTopEdge < obstacleBottomEdge) {
  
        // Check for corner proximity
        const isNearHorizontalCorner = (direction === "left" || direction === "right") && 
                                       (Math.abs(playerTopEdge - obstacleBottomEdge) <= cornerProximity || 
                                        Math.abs(playerBottomEdge - obstacleTopEdge) <= cornerProximity);
        const isNearVerticalCorner = (direction === "up" || direction === "down") && 
                                     (Math.abs(playerLeftEdge - obstacleRightEdge) <= cornerProximity || 
                                      Math.abs(playerRightEdge - obstacleLeftEdge) <= cornerProximity);
  
        if (!isNearHorizontalCorner && !isNearVerticalCorner) {
          return true; // Collision detected
        }
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
