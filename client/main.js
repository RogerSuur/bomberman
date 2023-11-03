import fw from "./src/fwinstance.js";
//import Chat from "./src/chat.js";
import BombermanGame from "./src/game.js";

const socket = io(); // Establish WebSocket connection

const form = document.getElementById("form");
const input = document.getElementById("input");
const chat = document.getElementById("chat");
const chatmessage = document.getElementById("chatmessage");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("username", input.value);
    input.value = "";
  }
});

chat.addEventListener("submit", (e) => {
  e.preventDefault();
  if (chatmessage.value) {
    socket.emit("chat message", chatmessage.value);
    chatmessage.value = "";
  }
});

socket.on("user left", (msg) => {
  console.log(`A user ${msg} disconnected`);
});

socket.on("joined", (msg) => {
  console.log(`A user ${msg} disconnected`);
});

const gameConfig = {
  gridSize: [10, 10],
  // Add more configs as needed
};

const game = new BombermanGame(fw, socket, gameConfig);

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
fw.dom.mount(document.getElementById("app"), game);

game.render();

//const chat = new Chat(socket, fw.state);

// const Span = (attrs = {}, children = [], listeners) =>
//   fw.dom.createVirtualNode("span", {
//     attrs: {
//       ...attrs,
//     },
//     children,
//     listeners,
//   });

// const newItemsToDo = Span({ id: "todo-count", class: "todo-count" }, [
//   `Items left: 3`,
// ]);

// const App = (attrs = {}, children = []) =>
//   fw.dom.createVirtualNode("section", {
//     attrs: {
//       ...attrs,
//     },
//     children,
//   });

// // Set up the application with imported components
// const myApp = App({ id: "app", class: "todoapp" }, [game, newItemsToDo]);

// // Mount the application to the DOM
// fw.dom.mount(document.getElementById("app"), myApp);
