import fw from "./src/fwinstance.js";
// import Chat from "./src/chat.js";
import BombermanGame from "./src/game.js";
import ChatComponent from "./src/chat.js";
import Player from "./src/player.js";
import { gameGrid } from "./src/components/gameGrid.js";
const socket = io(); // Establish WebSocket connection
const chatComponent = new ChatComponent(socket);
const chatElement = chatComponent.getChatElement();

// Add the chat element to the DOM
//document.body.appendChild(chatElement);

const form = document.getElementById("form");
const input = document.getElementById("input");
const start = document.getElementById("start");
/* const chat = document.getElementById("chat");
const chatmessage = document.getElementById("chatmessage");
 */

start.addEventListener("click", () => {
  socket.emit("launch");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("username", input.value);
    input.value = "";
  }
});

/* chat.addEventListener("submit", (e) => {
  e.preventDefault();
  if (chatmessage.value) {
    socket.emit("chat message", chatmessage.value);
    chatmessage.value = "";
  }
}); */

socket.on("joined", (msg) => {
  console.log(msg);
});

socket.on("startGame", (newMap, playerCount) => {
  const { gridVirtualNodes, playerPositions } = gameGrid(newMap);
  const gameInstance = new BombermanGame(fw, socket, {});
  const gameLayout = gameInstance.generateLayout(playerCount, gridVirtualNodes);
  appNode.children.push(gameLayout);
  fw.dom.mount(document.getElementById("app"), appNode);

  console.log(playerPositions);
  for (let i = 0; i < playerCount; i++) {
    new Player(`${i + 1}`, socket, playerPositions[i]).createNode();
  }
});

const App = (attrs = {}, children = []) =>
  fw.dom.createVirtualNode("div", {
    attrs: {
      ...attrs,
    },
    children,
  });

export const appNode = App({ id: "app", class: "gameapp" }, [chatElement]);

fw.dom.mount(document.getElementById("app"), appNode);
