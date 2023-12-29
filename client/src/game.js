import { gameHud } from "./components/gameHud.js";

export default class BombermanGame {
  constructor(fw, socket, config) {
    this.fw = fw;
    this.socket = socket;
    this.state = fw.state;
    this.config = config;
    this.gridNodes = [];

    // Initialize game elements like the grid, players,
    // bombs, etc.
  }

  generateLayout(playersData, gridVirtualNodes) {
    this.gridNodes = gridVirtualNodes;
    const gameGridNode = this.fw.dom.createVirtualNode("div", {
      attrs: { id: "gamegrid", class: "game-grid" },
      children: [...this.gridNodes],
    });
    const hudNode = gameHud(playersData);
    const gameOverNode = this.fw.dom.createVirtualNode("div", {
      attrs: { id: "gameover", class: "game-over" },
      children: [
        this.fw.dom.createVirtualNode("h1", {
          attrs: { id: "gameover-text", class: "game-over-text" },
          children: ["GAME OVER!"],
        }),
        this.fw.dom.createVirtualNode("button", {
          attrs: { id: "restart-btn", class: "restart-btn" },
          children: ["Restart game"],
          listeners: { click: this.restartGame.bind(this) },
          props: { disabled: true },
        }),
      ],
    });
    const gameLayout = this.fw.dom.createVirtualNode("div", {
      attrs: { id: "gameapp" },
      children: [hudNode, gameGridNode, gameOverNode],
    });
    // console.log(gameLayout);
    return gameLayout;
  }

  restartGame() {
    console.log("restarting game");
    this.socket.emit("gameReset", {});
  }

  render() {
    // Render the game elements
    console.log("Rendering game");
  }
}
