import { powerUps, cellSize } from "./config.js";

export class PowerUp {
    static findPowerUp(row, col) {
        let currentPowerUps = powerUps;
        console.log(row, col, powerUps);
        const powerUpEl = currentPowerUps.find(
            (pu) => pu.x === col && pu.y === row
        );
        if (!powerUpEl) {
            return;
        } else {
            return powerUpEl.type;
        }
    }

    static applyPowerUp(playerId, position) {
        console.log("applying powerup to player");
        const row = Math.floor(position.y / cellSize);
        const col = Math.floor(position.x / cellSize);

        let powerUpEffect = this.findPowerUp(row, col);
        if (powerUpEffect) {
            this.removePowerUp(row, col);
            switch (powerUpEffect) {
                case "grid-cell power-up-speed":
                    console.log(playerId.speed);
                    playerId.speed += 1; // Increase player's speed
                    break;
                case "grid-cell power-up-flames":
                    console.log(playerId.flames);
                    playerId.flames += 1; // Increase player's flames
                    break;
                case "grid-cell power-up-bombs":
                    console.log(playerId.bombs);
                    playerId.bombs += 1; // Increase player's bombs
                    break;
            }
        }
    }

    static removePowerUp(row, col) {
        const index = powerUps.findIndex((pu) => pu.x === col && pu.y === row);
        if (index > -1) {
            powerUps.splice(index, 1);
        }

        //TODO:Remove it from the map
    }
}
