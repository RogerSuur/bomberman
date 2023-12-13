import { cellSize, obstacles } from "./config.js";
import fw from "../src/fwinstance.js";
import { PowerUp } from "./powerup.js";
import Multiplayer from "./multiplayer.js";
import SocketManager from "./socketManager.js";
import { CollisionDetector } from "./collision.js";

export class Bomb {
  static bombsData = {};

  static explosionRotatingDirections = {
    center: 0,
    right: 0,
    left: 180,
    down: 90,
    up: 270,
  };

  static centerExplosionStages = [
    "expl-center-1",
    "expl-center-3",
    "expl-center-4",
    "expl-center-5",
    "expl-center-4",
    "expl-center-3",
    "expl-center-2",
  ];

  static sideExplosionStages = [
    "expl-side-1",
    "expl-side-2",
    "expl-side-3",
    "expl-side-4",
    "expl-side-3",
    "expl-side-2",
    "expl-side-1",
  ];

  static wingExplosionStages = [
    "expl-wing-1",
    "expl-wing-2",
    "expl-wing-3",
    "expl-wing-4",
    "expl-wing-3",
    "expl-wing-2",
    "expl-wing-1",
  ];

  static bombTickingStage = ["bomb-2", "bomb-3", "bomb-2", "bomb-1"];

  static newBomb(playerPosition, flames, bombs, playerId, multiplayer) {
    const row = Math.floor(playerPosition.y / cellSize);
    const col = Math.floor(playerPosition.x / cellSize);

    const bombId = `bomb-${Date.now()}`;
    const bombElement = fw.dom.createVirtualNode("div", {
      attrs: { class: "bomb-2", id: bombId },
    });

    this.bombsData[bombId] = {
      ticker: setInterval(() => this.bombTickingAnimation(bombId), 600),
      timer: setTimeout(() => this.explode(bombId), 2400),
      currentIndex: 0,
      explosionStageCounter: 0,
      reqFrameId: null,
      frameCount: 0,
      affectedCells: [],
      framesPerStage: 4,
      flames: flames,
      bombs: bombs,
      playerId: playerId,
      multiplayer: multiplayer,
    };

    const realBombElement = fw.dom.render(bombElement);
    const cellId = `row-${row}-cell-${col}`;
    const gridCell = document.getElementById(cellId);
    if (gridCell) {
      gridCell.appendChild(realBombElement);
    }
  }

  //animates the bomb ticking
  static bombTickingAnimation(bombId) {
    const bomb = document.getElementById(bombId);
    let currentIndex = this.bombsData[bombId].currentIndex;
    bomb.className = this.bombTickingStage[currentIndex];
    this.bombsData[bombId].currentIndex =
      (currentIndex + 1) % this.bombTickingStage.length;
  }

  //clears the ticking animations and starts explosion animation
  static explode(bombId) {
    clearInterval(this.bombsData[bombId].ticker);
    clearTimeout(this.bombsData[bombId].timer);
    this.bombsData[bombId].ticker = null;
    this.bombsData[bombId].timer = null;
    const bombCell = document.getElementById(bombId).parentNode;
    const [rowCol, col] = bombCell.id.split("cell-");
    const row = rowCol.split("row-").pop();
    this.explodeAnimation(row, col, bombId);
  }

  //uses framesCOunt and framesPerStage to animate explosion
  static explodeAnimation(row, col, bombId) {
    if (
      this.bombsData[bombId].frameCount %
        this.bombsData[bombId].framesPerStage ===
      0
    ) {
      this.setExplosionEffect(
        row,
        col,
        this.bombsData[bombId].explosionStageCounter,
        this.bombsData[bombId].flames,
        bombId
      );
      this.bombsData[bombId].explosionStageCounter++;
      if (this.bombsData[bombId].explosionStageCounter === 6) {
        this.clearExplosionEffect(bombId);
        return;
      }
    }
    this.bombsData[bombId].frameCount++;

    this.bombsData[bombId].reqFrameId = requestAnimationFrame(() =>
      this.explodeAnimation(row, col, bombId)
    );
  }

  //explosion effect in all directions range
  static setExplosionEffect(row, col, explosionStageCounter, flames, bombId) {
    const directions = ["center", "up", "down", "left", "right"];
    directions.forEach((direction) => {
      let positions = [];
      for (let i = direction === "center" ? 0 : 1; i <= flames; i++) {
        let r = parseInt(row),
          c = parseInt(col);
        switch (direction) {
          case "up":
            r -= i;
            break;
          case "down":
            r += i;
            break;
          case "left":
            c -= i;
            break;
          case "right":
            c += i;
            break;
        }
        const tileType = this.getTileType(r, c);
        if (tileType === "grid-cell main-wall") break;
        // Check for other bombs
        const otherBombId = CollisionDetector.performBombVsBombCheck(r, c);
        if (otherBombId && otherBombId !== bombId) {
          this.explode(otherBombId);
        } else {
          //CHeck for existing flames
          if (
            CollisionDetector.findFlamesInCell(r, c) &&
            direction !== "center"
          )
            break;
          // if (
          //   CollisionDetector.isPlayerInFlames(
          //     playerPosition,
          //     bombData.affectedCells
          //   )
          // )
          // {
          // Handle player collision with flames
          // }
          positions.push([r, c]);
          if (
            !this.arrayContains(this.bombsData[bombId].affectedCells, [r, c])
          ) {
            this.bombsData[bombId].affectedCells.push([r, c]);
          }
        }
      }
      this.applyExplosionEffect(positions, direction, explosionStageCounter);
    });
  }

  //Applies the correct explosionstage png to correct direction position
  static applyExplosionEffect(positions, direction, explosionStageCounter) {
    positions.forEach((position, index) => {
      const [r, c] = position;
      const adjacentCell = document.getElementById(`row-${r}-cell-${c}`);
      if (!adjacentCell) return;
      let isWing = false;
      if (direction !== "center") {
        if (index === positions.length - 1) {
          isWing = true;
        }
      }

      const explosion = this.constructExplosionElement(
        direction,
        explosionStageCounter,
        isWing
      );

      if (!adjacentCell.hasChildNodes()) {
        const realExplosionElement = fw.dom.render(explosion);
        adjacentCell.appendChild(realExplosionElement);
      } else {
        this.updateCellClass(
          adjacentCell.firstChild,
          adjacentCell.firstChild.className,
          explosion.attrs.class
        );
      }
    });
  }

  //chooses correct explosion stage and rotates it to necessary direction
  static constructExplosionElement(key, explosionStageCounter, isWing) {
    var explosion = fw.dom.createVirtualNode("div", {
      attrs: { class: "", style: `` },
      children: [],
    });

    if (key === "center") {
      explosion.attrs.class = this.centerExplosionStages[explosionStageCounter];
    } else if (isWing) {
      explosion.attrs.class = this.wingExplosionStages[explosionStageCounter];
    } else {
      explosion.attrs.class = this.sideExplosionStages[explosionStageCounter];
    }
    if (key !== "center") {
      explosion.attrs.style = `transform: rotate(${this.explosionRotatingDirections[key]}deg)`;
    }
    return explosion;
  }

  //clears the explosion classes from bomb and all adjacentpositions
  static clearExplosionEffect(bombId) {
    if (!this.bombsData[bombId] || !this.bombsData[bombId].affectedCells) {
      console.error("Bomb data not found for bombId:", bombId);
      return;
    }

    this.bombsData[bombId].affectedCells.forEach(([r, c]) => {
      const cell = document.getElementById(`row-${r}-cell-${c}`);
      if (cell) {
        let powerUpEl = PowerUp.findPowerUp(r, c);
        if (cell.classList.contains("soft-wall")) {
          this.destroySoftWall(cell, r, c);
        }

        const explosionElement = Array.from(cell.children).find((child) =>
          child.className.startsWith("expl-")
        );
        if (explosionElement) {
          cell.removeChild(explosionElement);
        }

        if (powerUpEl) {
          cell.className = powerUpEl;
        } else {
          cell.className = "grid-cell grass";
        }
      }
    });

    const bombData = this.bombsData[bombId];
    if (bombData && bombData.multiplayer) {
      bombData.multiplayer.updatePlayerBombsPlaced(bombData.playerId);
    }

    const multiplayer = this.bombsData[bombId].multiplayer;
    if (multiplayer) {
      multiplayer.checkPlayersInFlames(this.bombsData);
    }

    this.bombsData[bombId].affectedCells = [];
    delete this.bombsData[bombId];
  }

  static destroySoftWall(cell, row, col) {
    //TODO: Display wall destroction animation
    const index = obstacles.findIndex((obj) => obj.y === row && obj.x === col);
    if (index !== -1) {
      obstacles.splice(index, 1);
    }
  }

  static getTileType(r, c) {
    const cell = document.getElementById(`row-${r}-cell-${c}`);
    return cell.className;
  }

  static updateCellClass(cell, oldClass, newClass) {
    cell.classList.remove(oldClass);
    cell.classList.add(newClass);
  }

  static arrayContains(arr, target) {
    return arr.some(([x, y]) => x === target[0] && y === target[1]);
  }
}
