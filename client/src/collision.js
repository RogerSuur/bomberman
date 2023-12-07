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

        for (let obstacle of obstacles) {
            if (
                futurePosition.x < obstacle.x + cellSize &&
                futurePosition.x + playerSize > obstacle.x &&
                futurePosition.y < obstacle.y + cellSize &&
                futurePosition.y + playerSize > obstacle.y
            ) {
                return true;
            }
        }
        return false;
    }
}
