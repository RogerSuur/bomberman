import fw from "../src/fwinstance.js";
import { obstacles } from "./components/gameGrid.js";

const cellSize = 36;

export default class Player {
    constructor(
        playerId,
        classCounter,
        socket,
        startPosition,
        bombsPlaced,
        lives,
        powerUps,
        userName
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

    placeBomb() {
        this.socket.emit("placeBomb", { playerId: this.playerId });
        this.actionQueue.push("placeBomb"); // Add to action queue
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
            }
        });
    }

    //TODO: INSERT COLLISIONDETECTOR
    move(direction) {
        if (!this.performWallCheck(direction)) {
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
                this.socket.emit("move", {
                    playerId: this.playerId,
                    direction,
                });
            }
        }
    }

    performWallCheck(direction) {
        const futurePosition = { ...this.currentPosition };
        switch (direction) {
            case "up":
                futurePosition.y -= this.speed;
                break;
            case "down":
                futurePosition.y += this.speed;
                break;
            case "left":
                futurePosition.x -= this.speed;
                break;
            case "right":
                futurePosition.x += this.speed;
                break;
        }

        const playerSize = 36;
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

    updatePosition() {
        const player = document.getElementById(`player-${this.playerId}`);
        // TODO: CHANGE THE CLASS TO DISPLAY MOVEMENT ANIMATION
        player.style.left = `${this.currentPosition.x}px`;
        player.style.top = `${this.currentPosition.y}px`;
    }
    // ... other player methods
}
