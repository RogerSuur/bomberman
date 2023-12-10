import { obstacles, cellSize, playerSize } from "./config.js";

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

    static performPowerUpCheck() {
        console.log("performing power Up Check");
    }

    static performBombVsBombCheck() {
        console.log("performing bomb Check");
    }

    static performBombVsPlayerCheck() {
        console.log("performing bomb Check");
    }
}
