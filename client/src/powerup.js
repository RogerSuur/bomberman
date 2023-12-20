import { powerUps } from "./config.js";

export class PowerUp {
  static findPowerUp(row, col) {
    let currentPowerUps = powerUps;
    const powerUpEl = currentPowerUps.find(
      (pu) => pu.x === col && pu.y === row
    );
    if (!powerUpEl) {
      return;
    } else {
      return powerUpEl.type;
    }
  }

  static getPowerUp(row, col) {
    let powerUpEffect = this.findPowerUp(row, col);
    if (powerUpEffect) {
      this.removePowerUp(row, col);
      const powerUpType = powerUpEffect.split("power-up-")[1];
      return powerUpType;
    }
  }

  static removePowerUp(row, col) {
    let currentPowerUps = powerUps;
    const index = currentPowerUps.findIndex(
      (pu) => pu.x === col && pu.y === row
    );
    if (index > -1) {
      powerUps.splice(index, 1);
    }

    const powerUpNode = document.getElementById(`row-${row}-cell-${col}`);
    if (powerUpNode) {
      powerUpNode.className = "grid-cell grass";
    }
  }
}
