//import { Socket } from "socket.io";
import fw from "./src/fwinstance.js";
// import Chat from "./src/chat.js";
import BombermanGame from "./src/game.js";
import ChatComponent from "./src/chat.js";
import Player from "./src/player.js";
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

socket.on("userlist", (chatlist) => {
    console.log(chatlist);
});

socket.on("joined", (msg) => {
    console.log(msg);
});

socket.on("startGame", (newMap, playerCount) => {
    console.log(socket);
    const gameInstance = new BombermanGame(fw, socket, {});
    const gameLayout = gameInstance.generateLayout(playerCount, newMap);
    appNode.children.push(gameLayout);
    fw.dom.mount(document.getElementById("app"), appNode);

    for (let i = 0; i < playerCount; i++) {
        new Player(`${i + 1}`, socket).createNode();
    }
});

// export const gameInstance = new BombermanGame(fw, socket, {});

const App = (attrs = {}, children = []) =>
    fw.dom.createVirtualNode("div", {
        attrs: {
            ...attrs,
        },
        children,
    });

export const appNode = App({ id: "app", class: "gameapp" }, [chatElement]);

fw.dom.mount(document.getElementById("app"), appNode);

//gameInstance.render();
