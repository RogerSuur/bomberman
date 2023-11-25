import fw from "../src/fwinstance.js";
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
        this.speed = powerUps.speed;
        this.bombsPlaced = bombsPlaced;
        this.counter = classCounter;
    }

    isLocalPlayer() {
        return this.playerId === localStorage.getItem("localPlayerId");
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
    move(direction) {
        // Sends a move request to the server
        this.socket.emit("move", {
            playerId: this.playerId,
            direction,
        });
        this.predictMovement(direction);
        // Optionally handle optimistic UI updates or wait for
        // server confirmation
    }
    predictMovement(direction) {
        // Apply the movement immediately on the client-side for
        // smoother user experience:
        /* With client-side prediction, as soon as the "up" button is pressed, the client would immediately display the character as having moved up one square. Simultaneously, it would send this move to the server for validation. Once validated, the server's new authoritative state would be sent back to all clients. If for some reason the move was not valid (e.g., there was a wall), the client would reconcile this and move the character back to its original position. */
        // Create a temporary new position based on direction
        const tempNewPosition = calculateNewPosition(
            this.currentPosition,
            direction
        );
        // Check if the new position is a valid move locally
        if (isPositionValid(tempNewPosition)) {
            // Update the local state with the new position
            this.currentPosition = tempNewPosition;
            // Add the move to the actionQueue for later reconciliation
            this.actionQueue.push({
                action: "move",
                position: tempNewPosition,
            });
        }
    }
    placeBomb() {
        // Sends a bomb placement request to the server
        this.socket.emit("placeBomb", { playerId: this.playerId });
        this.actionQueue.push("placeBomb"); // Add to action queue
    }
    // ... other player methods
    addMovementListeners() {
        //saada socketisse
        document.addEventListener("keydown", (event) => {
            console.log(event.key);
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

    move(direction) {
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
    }

    updatePosition() {
        const player = document.getElementById(`player-${this.playerId}`);
        player.style.left = `${this.currentPosition.x}px`;
        player.style.top = `${this.currentPosition.y}px`;
    }
}
