export default class Multiplayer {
    constructor(socket, stateManager) {
        this.socket = socket;
        this.state = stateManager;

    this.socket.on("stateUpdate", (data) => {
      console.log("State Updated");
      // The server sends back the updated state
      this.state.setState(data);
      this.reconcile();
    });
  }
  reconcile() {
    // Compare server state with client-side predicted state
    // and correct any discrepancies
  }
}
