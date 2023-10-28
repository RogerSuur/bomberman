import { GameGrid } from "./components/gameGrid.js";

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

    generateLayout() {
        const gridNodes = GameGrid();

        const gameNode = this.fw.dom.createVirtualNode("div", {
            attrs: { id: "gamegrid" },
            children: [...gridNodes],
        });

        return gameNode;
    }
}
