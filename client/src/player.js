export default class Player {
  constructor(playerId, socket) {
    this.playerId = playerId;
    this.socket = socket;
    this.actionQueue = []; // Action queue for client-side prediction
    // Initialize player properties
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
      this.actionQueue.push({ action: "move", position: tempNewPosition });
    }
  }

  placeBomb() {
    // Sends a bomb placement request to the server
    this.socket.emit("placeBomb", { playerId: this.playerId });
    this.actionQueue.push("placeBomb"); // Add to action queue
  }
  // ... other player methods
}