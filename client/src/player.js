import fw from "../src/fwinstance.js";
import { CollisionDetector } from "./collision.js";
import { Bomb } from "./bomb.js";
import { PowerUp } from "./powerup.js";
import { cellSize } from "./config.js";

export default class Player {
  constructor(
    playerId,
    classCounter,
    socket,
    startPosition,
    bombsPlaced,
    lives,
    powerUps,
    userName,
    multiplayer
  ) {
    this.playerId = playerId;
    this.socket = socket;
    this.actionQueue = []; // Action queue for client-side prediction
    // Initialize player properties
    this.currentPosition = startPosition;
    this.lives = lives;
    this.userName = userName;
    this.bombs = powerUps.bombs;
    this.flames = powerUps.flames;
    this.speed = powerUps.speed + 5;
    this.bombsPlaced = bombsPlaced;
    this.counter = classCounter;
    this.multiplayer = multiplayer;
  }

  isLocalPlayer() {
    return this.playerId === sessionStorage.getItem("localPlayerId");
  }

  createNode() {
    const playerVirtualNode = fw.dom.createVirtualNode("div", {
      attrs: {
        id: `player-${this.playerId}`,
        class: `player-${this.counter}`,
      },
    });
    const playerNode = fw.dom.render(playerVirtualNode);
    const grid = document.querySelector("#gamegrid");
    grid.appendChild(playerNode);
    if (this.isLocalPlayer()) {
      this.addMovementListeners();
    }
    this.startPosition();
  }
  startPosition() {
    const player = document.getElementById(`player-${this.playerId}`);
    player.style.left = `${this.currentPosition.x}px`;
    player.style.top = `${this.currentPosition.y}px`;
  }

  addMovementListeners() {
    document.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowUp":
          this.move("up");
          break;
        case "ArrowDown":
          this.move("down");
          break;
        case "ArrowLeft":
          this.move("left");
          break;
        case "ArrowRight":
          this.move("right");
          break;
        case " ":
          this.placeBomb(this.currentPosition);
          break;
      }
    });
  }

  move(direction) {
    if (
      !CollisionDetector.performWallCheck(
        this.currentPosition,
        direction,
        this.speed
      )
    ) {
      switch (direction) {
        case "up":
          this.currentPosition.y -= this.speed;
          break;
        case "down":
          this.currentPosition.y += this.speed;
          break;
        case "left":
          this.currentPosition.x -= this.speed;
          break;
        case "right":
          this.currentPosition.x += this.speed;
          break;
      }
      requestAnimationFrame(() => this.updatePosition());

      if (this.isLocalPlayer()) {
        if (CollisionDetector.performPowerUpCheck(this.currentPosition)) {
          const row = Math.floor(this.currentPosition.y / cellSize);
          const col = Math.floor(this.currentPosition.x / cellSize);
          let powerUpEffect = PowerUp.getPowerUp(row, col);

          if (powerUpEffect !== undefined) {
            this.applyPowerUp(powerUpEffect);
            this.socket.emit("powerUp", {
              playerId: this.playerId,
              powerUp: powerUpEffect,
              row: row,
              col: col,
            });
          }
        }
      }

      if (this.isLocalPlayer()) {
        this.socket.emit("move", {
          playerId: this.playerId,
          direction,
        });
      }
    }
  }

  updatePosition() {
    const player = document.getElementById(`player-${this.playerId}`);
    // TODO: CHANGE THE CLASS TO DISPLAY MOVEMENT ANIMATION
    player.style.left = `${this.currentPosition.x}px`;
    player.style.top = `${this.currentPosition.y}px`;
  }

  placeBomb(position) {
    //CHeck if there are bombs available to place
    if (this.bombs - this.bombsPlaced > 0) {
      Bomb.newBomb(
        position,
        this.flames,
        this.bombs,
        this.playerId,
        this.multiplayer
      );

      if (this.isLocalPlayer()) {
        this.bombsPlaced++;
        this.socket.emit("placeBomb", {
          playerId: this.playerId,
          position: this.currentPosition,
        });
      }
    }

    // this.actionQueue.push("placeBomb"); // Add to action queue
  }

  applyPowerUp(powerUp) {
    switch (powerUp) {
      case "speed":
        this.speed += 2;
        break;
      case "flames":
        this.flames += 1;
        break;
      case "bombs":
        this.bombs += 1;
        break;
      default:
        break;
    }
  }

  removePowerUpRemotely(row, col) {
    PowerUp.removePowerUp(row, col);
  }
}
