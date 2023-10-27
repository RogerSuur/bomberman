import fw from "./src/fwinstance.js";
// import Chat from "./src/chat.js";
// import BombermanGame from "./src/game.js";
import { GameGrid } from "./src/components/gameGrid.js";

const App = (attrs = {}, children = []) =>
    fw.dom.createVirtualNode("section", {
        attrs: {
            ...attrs,
        },
        children,
    });

const myGameApp = App({ id: "app", class: "gameapp" }, GameGrid());

fw.dom.mount(document.getElementById("app"), myGameApp);
// //const socket = new WebSocket("ws://localhost:5173"); // Establish WebSocket connection

// const gameConfig = {
//   gridSize: [10, 10],
//   // Add more configs as needed
// };

// const game = new BombermanGame(fw, socket, gameConfig);

// const App = (attrs = {}, children = []) =>
//   fw.dom.createVirtualNode("span", {
//     attrs: {
//       ...attrs,
//     },
//     children,
//   });

// // Set up the application with imported components
// const myApp = App({ id: "app" }, ["Cool"]);

// // Mount the application to the DOM
// fw.dom.mount(document.getElementById("app"), myApp);

// game.render();

// const chat = new Chat(socket, fw.state);
