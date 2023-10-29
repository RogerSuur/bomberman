import { gameGrid } from "./components/gameGrid.js";
import { gameHud } from "./components/gameHud.js";
import fw from "./fwinstance.js.js";
import Multiplayer from "./multiplayer.js";


export default class BombermanGame {
    constructor(fw, socket, config) {
        this.fw = fw;
        this.socket = socket;
        this.state = fw.state;
        this.config = config;

        //this.multiplayer = new Multiplayer(socket, this.state);
        // Initialize game elements like the grid, players,
        // bombs, etc.
    }

    render() {
      const gameNode = this.fw.dom.createVirtualNode(
        "div",
        { id: "game" } /* ... */
      );
      this.fw.dom.render(gameNode, document.body);
      this.update();
    }
  
    update() {
      // Use requestAnimationFrame for efficient rendering
      requestAnimationFrame(() => {
        // We use the stateManager to get the updated state
        this.gameState = this.state.getState();
  
        // Update game elements based on the current game state
        // ...
  
        this.render(); // Re-render the game
      });
    }

generateLayout() {
  const gridNodes = gameGrid();
  const hud = gameHud();

  const gameNode = this.fw.dom.createVirtualNode("div", {
      attrs: { id: "gamegrid" },
      children: [hud, ...gridNodes],
  });

  return gameNode;
}