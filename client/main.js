//import { Socket } from "socket.io";
import fw from "./src/fwinstance.js";
// import Chat from "./src/chat.js";
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

socket.on("userlist", (chatlist) => {
  console.log(chatlist);
});

socket.on("joined", (msg) => {
  console.log(msg);
});

export const gameInstance = new BombermanGame(fw, socket, {});

const App = (attrs = {}, children = []) =>
  fw.dom.createVirtualNode("div", {
     attrs: {
       ...attrs,
     },
     children,
   });

// // Set up the application with imported components
// const myApp = App({ id: "app" }, ["Cool"]);

// // Mount the application to the DOM
export const appNode = App({ id: "app", class: "gameapp" }, []);

fw.dom.mount(document.getElementById("app"), appNode);

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
