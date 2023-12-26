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
    this.speed = powerUps.speed;
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
    // once every second emit the state of the player for correction
    this.socket.emit("stateUpdate", {
      playerId: this.playerId,
      position: this.currentPosition,
    });    
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
    const cornerProximity = 3; // Pixels within which corner adjustment should happen

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
    console.log("near corner", newPosition);
    newPosition = this.adjustPositionForCorner(newPosition, direction, cornerProximity);
    console.log("adjusted position", newPosition);
  
    // Perform collision check with the new position
    if (!CollisionDetector.performWallCheck(newPosition)) {
      this.currentPosition = newPosition;

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
          position: this.currentPosition,
        });
      }
    }/*  else {
      // If movement is stopped near a grid point, adjust to align with the grid
      console.log("current position", this.currentPosition)
      this.currentPosition = this.alignWithGrid(this.currentPosition);
      console.log("aligned position", this.currentPosition)
    } */

    requestAnimationFrame(() => this.updatePosition());
  }

  alignWithGrid(position) {
    // Align the position with the nearest grid point based on the top-left corner
    position.x = Math.round(position.x / cellSize) * cellSize;
    position.y = Math.round((position.y + playerOffset) / cellSize) * cellSize - playerOffset;
    return position;
  } 
  
  // Method to adjust the player's position to align with the grid
adjustPositionForCorner(position, direction, proximity) {
  // Calculate the player's center position
  const playerCenterX = position.x + playerSize / 2;
  const playerCenterY = position.y + playerOffset + playerSize / 2;

  // Calculate the center of the current cell
  const gridCenterX = Math.round(playerCenterX / cellSize) * cellSize;
  const gridCenterY = Math.round(playerCenterY / cellSize) * cellSize;

  // Determine if alignment correction is needed based on direction
  if ((direction === "left" || direction === "right") && Math.abs(playerCenterX - gridCenterX) < proximity) {
    let potentialX = gridCenterX - playerSize / 2;
    if (direction === "right" && playerCenterX < potentialX) {
      position.x = potentialX + playerSize / 2;
    }
    if (direction === "left" && playerCenterX > potentialX) {
      position.x = potentialX - playerSize / 2;
    }
  } else if ((direction === "up" || direction === "down") && Math.abs(playerCenterY - gridCenterY) < proximity) {
    let potentialY = gridCenterY - (playerSize / 2 + playerOffset);
    if (direction === "down" && playerCenterY < potentialY) {
      position.y = potentialY + playerSize / 2 - playerOffset;
    }
    if (direction === "up" && playerCenterY > potentialY) {
      position.y = potentialY - playerSize / 2 + playerOffset;
    }
  }

  return position;
}


  updatePosition() {
    const player = document.getElementById(`player-${this.playerId}`);
    // TODO: CHANGE THE CLASS TO DISPLAY MOVEMENT ANIMATION
    player.style.left = `${this.currentPosition.x}px`;
    player.style.top = `${this.currentPosition.y}px`;
  }

  placeBomb() {
    if (!this.isAlive) return;

    if (this.bombsPlaced >= this.bombs) return;

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
        this.speed += 3;
        // console.log("speed", this.speed);
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
    
    if (this.isLocalPlayer()) {
      const gameOver = document.getElementById("gameover-text");
      gameOver.style.display = "block";
    }

    this.multiplayer.removePlayer(playerId);
  }
}
