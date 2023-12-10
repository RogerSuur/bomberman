import { obstacles, cellSize, playerSize, powerUps } from "./config.js";

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
            if (
                futurePosition.x < obstacle.x * cellSize + cellSize &&
                futurePosition.x + playerSize > obstacle.x * cellSize &&
                futurePosition.y < obstacle.y * cellSize + cellSize &&
                futurePosition.y + playerSize > obstacle.y * cellSize
            ) {
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
                playerPosition.x + playerSize / 2 <
                    powerUp.x * cellSize + cellSize &&
                playerPosition.x + playerSize / 2 > powerUp.x * cellSize &&
                playerPosition.y + playerSize / 2 <
                    powerUp.y * cellSize + cellSize &&
                playerPosition.y + playerSize / 2 > powerUp.y * cellSize
            ) {
                return true;
            }
        }
        return false;
    }

    static performBombVsBombCheck() {
        console.log("performing bomb Check");
    }

    static performBombVsPlayerCheck() {
        console.log("performing bomb Check");
    }
}
