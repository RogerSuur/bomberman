import fw from "./src/fwinstance.js";
//import Chat from "./src/chat.js";
import BombermanGame from "./src/game.js";
import PreLobby from "./src/lobby/preLobby.js";
import Lobby from "./src/lobby/lobby.js";
import ChatComponent from "./src/chat.js";

import Player from "./src/player.js";
import SocketManager from "./src/socketManager.js";
import { gameGrid } from "./src/components/gameGrid.js";
import Multiplayer from "./src/multiplayer.js";
const socket = io(); // Establish WebSocket connection
const chatComponent = new ChatComponent(socket);
const multiplayer = new Multiplayer(socket);
const chatElement = chatComponent.getChatElement();
const socketManager = new SocketManager(socket, multiplayer);

// Add the chat element to the DOM
//document.body.appendChild(chatElement);

/*
const form = document.getElementById("form");
const input = document.getElementById("input");
const start = document.getElementById("start");
const chat = document.getElementById("chat");
const chatmessage = document.getElementById("chatmessage");


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

chat.addEventListener("submit", (e) => {
  e.preventDefault();
  if (chatmessage.value) {
    socket.emit("chat message", chatmessage.value);
    chatmessage.value = "";
  }
}); */

socket.on("user left", (msg) => {
  console.log(`A user ${msg} disconnected`);
});

/* socket.on("joined", (msg) => {
  console.log(`A user ${msg} connected`);
}); */

socket.on("startGame", (newMap, players) => {
  const gridVirtualNodes = gameGrid(newMap);
  const gameInstance = new BombermanGame(fw, socket, {});
  const gameLayout = gameInstance.generateLayout(
    players.length,
    gridVirtualNodes
  );
  console.log(gameLayout);
  const newApp = App({ id: "app", class: "gameapp" }, [gameLayout]);
  console.log(newApp);
  const patch = fw.dom.diff(appNode, newApp);
  const actualDOMNode = document.getElementById("app");
  patch(actualDOMNode);

  for (let i = 0; i < players.length; i++) {
    if (players[i].id === socket.id) {
      sessionStorage.setItem("localPlayerId", players[i].id);
    }
    let newPlayer = new Player(
      `${players[i].id}`,
      i + 1,
      socket,
      players[i].position,
      players[i].bombsPlaced,
      players[i].lives,
      players[i].powerUps,
      players[i].userName,
      multiplayer
    );
    newPlayer.createNode();
    multiplayer.addPlayer(newPlayer);
  }
});

const App = (attrs = {}, children = []) =>
  fw.dom.createVirtualNode("div", {
    attrs: {
      ...attrs,
    },
    children,
  });

//export const appNode = App({ id: "app", class: "gameapp" }, [chatElement]);

//Lobby
const preLobbyInstance = new PreLobby(fw, socket, false);
const preLobby = preLobbyInstance.render();

export const appNode = App({ id: "app", class: "gameapp" }, [preLobby]);
fw.dom.mount(document.getElementById("app"), appNode);

socket.on("username taken", () => {
  preLobbyInstance.errorPresent = true;
  preLobbyInstance.update();
});

socket.on("userlist", (data) => {
  const lobbyInstance = new Lobby(fw, socket, data, 0);
  const lobby = lobbyInstance.render();
  const newApp = App({ id: "app", class: "gameapp" }, [lobby]);
  const patch = fw.dom.diff(appNode, newApp);
  const actualDOMNode = document.getElementById("app");
  patch(actualDOMNode);
});

socket.on("tick", (data) => {
  const lobbyInstance = new Lobby(fw, socket, data.users, data.seconds);
  const lobby = lobbyInstance.render();
  const newApp = App({ id: "app", class: "gameapp" }, [lobby]);
  const patch = fw.dom.diff(appNode, newApp);
  const actualDOMNode = document.getElementById("app");
  patch(actualDOMNode);
});
