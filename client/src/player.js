import fw from "../src/fwinstance.js";
import { CollisionDetector } from "./collision.js";
import { Bomb } from "./bomb.js";
import { PowerUp } from "./powerup.js";
import { cellSize, playerOffset } from "./config.js";

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
    this.spawnPosition = { ...startPosition };
    this.currentPosition = { ...startPosition };
    this.lives = lives;
    this.userName = userName;
    this.bombs = powerUps.bombs;
    this.flames = powerUps.flames;
    this.speed = powerUps.speed + 5;
    this.bombsPlaced = bombsPlaced;
    this.counter = classCounter;
    this.multiplayer = multiplayer;
    this.isAlive = true;
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
    this.startingPosition(this.playerId, this.currentPosition);
  }
  startingPosition(playerId, position) {
    const player = document.getElementById(`player-${playerId}`);
    player.style.left = `${position.x}px`;
    player.style.top = `${position.y}px`;
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
    if (!this.isAlive) return;
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
          const row = Math.floor((this.currentPosition.y + playerOffset) / cellSize);
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
    if (!this.isAlive) return;
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

  handlePlayerHit(playerId) {
    this.lives -= 1;
    if (this.lives <= 0) {
      console.log("game over for player", playerId);
      this.handlePlayerDeath(playerId);
    } else {
      this.startingPosition(playerId, this.spawnPosition);
      this.currentPosition = { ...this.spawnPosition };
      //TODO: Display lives on the game-HUD
    }
    //TODO:make player dies animation
  }

  handlePlayerDeath(playerId) {
    const player = document.getElementById(`player-${playerId}`);
    if (player) {
      player.parentNode.removeChild(player);
    }

    this.isAlive = false;
    this.multiplayer.removePlayer(playerId);
  }
}
