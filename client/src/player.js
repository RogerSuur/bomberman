import fw from "../src/fwinstance.js";
import { CollisionDetector } from "./collision.js";
import { Bomb } from "./bomb.js";
import { PowerUp } from "./powerup.js";
import { cellSize, playerSize, playerOffset } from "./config.js";

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
    this.speed = powerUps.speed + 2;
    this.bombsPlaced = bombsPlaced;
    this.counter = classCounter;
    this.multiplayer = multiplayer;
    this.isAlive = true;
    this.keyStates = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    };
    this.lastUpdateTime = 0;
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
      if (event.key in this.keyStates) {
        this.keyStates[event.key] = true;
      } else if (event.key === " ") {
        event.preventDefault();  // Prevent default action for space key
        this.placeBomb(this.currentPosition);
      }
    });

    document.addEventListener("keyup", (event) => {
      if (event.key in this.keyStates) {
        this.keyStates[event.key] = false;
      }
    });

    // Start the animation loop only once here
    if (!this.animationStarted) {
      this.animationStarted = true;
      requestAnimationFrame(this.update.bind(this));
    }
  }

  update(timestamp) {
    if (timestamp - this.lastUpdateTime > 1000 / 60) { // 60 times per second
      this.moveBasedOnKeyStates();
      this.lastUpdateTime = timestamp;
    }
    requestAnimationFrame(this.update.bind(this));
  }

  moveBasedOnKeyStates() {
    if (!this.isAlive) return;
  
    if (this.keyStates.ArrowUp) this.move("up");
    if (this.keyStates.ArrowDown) this.move("down");
    if (this.keyStates.ArrowLeft) this.move("left");
    if (this.keyStates.ArrowRight) this.move("right");
  }

  move(direction) {
    if (!this.isAlive) return;
  
    let newPosition = { ...this.currentPosition };
    switch (direction) {
      case "up":
        newPosition.y -= this.speed;
        break;
      case "down":
        newPosition.y += this.speed;
        break;
      case "left":
        newPosition.x -= this.speed;
        break;
      case "right":
        newPosition.x += this.speed;
        break;
      default:
        return; // Invalid direction
    }

    // Perform collision check with the new position
    if (!CollisionDetector.performWallCheck(newPosition, direction, this.speed)) {
      this.currentPosition = newPosition;
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

    // Calculate the center of the player's sprite
    const playerCenterX = this.currentPosition.x + playerSize / 2;
    const playerCenterY = this.currentPosition.y + playerOffset + playerSize / 2;

    // Determine the grid cell based on the center of the sprite
    const col = Math.floor(playerCenterX / cellSize);
    const row = Math.floor(playerCenterY / cellSize);

    // Place the bomb in the calculated cell
    if (!CollisionDetector.performBombVsBombCheck(row, col)) {
      Bomb.newBomb(
        { x: col * cellSize, y: row * cellSize - playerOffset },
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
