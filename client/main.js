import fw from "./src/fwinstance.js";
//import Chat from "./src/chat.js";
import BombermanGame from "./src/game.js";

const App = (attrs = {}, children = []) =>
    fw.dom.createVirtualNode("div", {
        attrs: {
            ...attrs,
        },
        children,
    });

const socket = io(); // Establish WebSocket connection

const gameConfig = {
  gridSize: [10, 10],
  // Add more configs as needed
};

const gameInstance = new BombermanGame(fw, socket, gameConfig);
const gameNode = gameInstance.generateLayout();
const appNode = App({ id: "app", class: "gameapp" }, [gameNode]);
fw.dom.mount(document.getElementById("app"), appNode);
