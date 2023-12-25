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
  
    let newPosition = { ...this.currentPosition };
    const cornerProximity = 10; // Pixels within which corner adjustment should happen

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
        console.log("We're in 2 dimensions, dude!")
        return; // Invalid direction
    }

    // Check if near a corner and adjust position accordingly
    if (this.isNearCorner(newPosition, cornerProximity)) {
      console.log("near corner");
      newPosition = this.adjustPositionForCorner(newPosition, direction, cornerProximity);
    }
  
    // Perform collision check with the new position
    if (!CollisionDetector.performWallCheck(newPosition)) {
      this.currentPosition = newPosition;
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

  isNearCorner(position, proximity) {
    // Calculate the player's center position
    const playerCenterX = position.x + playerSize / 2;
    const playerCenterY = position.y + playerOffset + playerSize / 2;
  
    // Find the nearest grid corner
    const nearestCornerX = Math.round(playerCenterX / cellSize) * cellSize;
    const nearestCornerY = Math.round(playerCenterY / cellSize) * cellSize;
  
    // Calculate the distance from the player's center to the nearest grid corner
    const distanceToCornerX = Math.abs(playerCenterX - nearestCornerX);
    const distanceToCornerY = Math.abs(playerCenterY - nearestCornerY);

    console.log("distance to corner", distanceToCornerX, distanceToCornerY);
  
    // Check if the player is within proximity to a corner
    return distanceToCornerX < proximity || distanceToCornerY < proximity;
  }
  
  // Method to adjust the player's position to align with the grid
  adjustPositionForCorner(position, direction, proximity) {
    const gridX = Math.floor(position.x / cellSize) * cellSize;
    const gridY = Math.floor(position.y / cellSize) * cellSize;
    
    switch (direction) {
      case "left":
      case "right":
        // Adjust vertically to align with the grid
        if (Math.abs(position.y - gridY) < proximity) {
          console.log("adjusting vertically");
          position.y = gridY;
        }
        break;
      case "up":
      case "down":
        // Adjust horizontally to align with the grid
        if (Math.abs(position.x - gridX) < proximity) {
          console.log("adjusting horizontally");
          position.x = gridX;
        }
        break;
    }
  
    return position;
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

  handlePlayerHit(player) {
    this.lives -= 1;
    console.log("player", player);
    
    const playerLives = document.getElementById(`player-lives-${player.playerId}`);
    playerLives.classList.replace(`lives-${this.lives + 1}`, `lives-${this.lives}`);

    if (this.lives <= 0) {
      console.log("game over for player", player.userName);
      this.handlePlayerDeath(player.playerId);
    } else {
      this.startingPosition(player.playerId, this.spawnPosition);
      this.currentPosition = { ...this.spawnPosition };
      //TODO: Display lives on the game-HUD
    }
    //TODO:make player dies animation
    console.log("player", player.userName, "lives", this.lives);
  }

  handlePlayerDeath(playerId) {
    const player = document.getElementById(`player-${playerId}`);
    if (player) {
      player.parentNode.removeChild(player);
    }

    this.isAlive = false;
    // this.multiplayer.removePlayer(playerId);
  }
}
