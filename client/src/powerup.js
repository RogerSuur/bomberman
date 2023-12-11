import { powerUps, cellSize } from "./config.js";
import { Bomb } from "./bomb.js";

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

    static getPowerUp(position) {
        const row = Math.floor(position.y / cellSize);
        const col = Math.floor(position.x / cellSize);

        let powerUpEffect = this.findPowerUp(row, col);
        if (powerUpEffect) {
            this.removePowerUp(row, col);
            const powerUpType = powerUpEffect.split("power-up-")[1];
            return powerUpType;
        }
    }

    static removePowerUp(row, col) {
        const index = powerUps.findIndex((pu) => pu.x === col && pu.y === row);
        if (index > -1) {
            powerUps.splice(index, 1);
        }

        console.log("remove powerup from display");
        const powerUpNode = document.getElementById(`row-${row}-cell-${col}`);
        if (powerUpNode) {
            powerUpNode.className = "grid-cell grass";
        }
        //TODO:Remove it from the map
    }
}
