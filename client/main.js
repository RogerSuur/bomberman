// import fw from "./src/fwinstance.js";
// import Chat from "./src/chat.js";
// import BombermanGame from "./src/game.js";

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
