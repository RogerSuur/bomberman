import { gameGrid } from "./components/gameGrid.js";
import { gameHud } from "./components/gameHud.js";
import Multiplayer from "./multiplayer.js";
import { appNode } from "../main.js";

export default class BombermanGame {
    constructor(fw, socket, config) {
        this.fw = fw;
        this.socket = socket;
        this.state = fw.state;
        this.config = config;
        this.gridNodes = [];

        this.multiplayer = new Multiplayer(socket, this.state);

        socket.on("startGame", (newMap, playerCount) => {
            console.log("PayerCount on clientside", playerCount);
            this.gridNodes = gameGrid(newMap);
            const gameNode = this.generateLayout(playerCount);
            appNode.children.push(gameNode);
            fw.dom.mount(document.getElementById("app"), appNode);
        });

        // Initialize game elements like the grid, players,
        // bombs, etc.
    }

    generateLayout(playerCount) {
        const gameGridNode = this.fw.dom.createVirtualNode("div", {
            attrs: { id: "gamegrid" },
            children: [...this.gridNodes],
        });
        const hudNode = gameHud(playerCount);
        const gameLayout = this.fw.dom.createVirtualNode("div", {
            attrs: { id: "gameapp" },
            children: [hudNode, gameGridNode],
        });
        return gameLayout;
    }

    render() {
        // Render the game elements
        console.log("Rendering game");
    }
}
