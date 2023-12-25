import fw from "./src/fwinstance.js";
import BombermanGame from "./src/game.js";
import PreLobby from "./src/lobby/preLobby.js";
import Lobby from "./src/lobby/lobby.js";
import ChatComponent from "./src/lobby/chat.js";

import Player from "./src/player.js";
import { gameGrid } from "./src/components/gameGrid.js";
import Multiplayer from "./src/multiplayer.js";
const socket = io(); // Establish WebSocket connection

const multiplayer = new Multiplayer(socket);

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
    const newApp = App({ id: "app", class: "gameapp" }, [gameLayout]);
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
            players[i].userName
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

//Lobby
const preLobbyInstance = new PreLobby(fw, socket, false);
const preLobby = preLobbyInstance.render();
const chatComponent = new ChatComponent(socket);
const lobbyInstance = new Lobby(fw, socket, 0);

export const appNode = App({ id: "app", class: "gameapp" }, [preLobby]);
fw.dom.mount(document.getElementById("app"), appNode);


socket.on("username taken", () => {
    preLobbyInstance.errorPresent = true;
    preLobbyInstance.update()
});

socket.on("userlist", (data) => {
    console.log("userlist", data);
    const name = GetMyUserName(data.users, socket.id);
    chatComponent.addPlayer(name);
    lobbyInstance.addPlayer(data.userNameList, name);
    const lobby = lobbyInstance.content;
    const newApp = App({ id: "app", class: "gameapp" }, [lobby, chatComponent.getChatElement()]);
    const patch = fw.dom.diff(appNode, newApp);
    const actualDOMNode = document.getElementById("app");
    patch(actualDOMNode);
    lobbyInstance.update();

});

socket.on("tick", (data) => {
    /* let name = GetMyUserName(data.users, socket.id);
    lobbyInstance.addPlayer(data.userNameList, name);
    const lobby = lobbyInstance.content;
    const newApp = App({ id: "app", class: "gameapp" }, [lobby]);
    const patch = fw.dom.diff(appNode, newApp);
    const actualDOMNode = document.getElementById("app");
    patch(actualDOMNode); */
    lobbyInstance.update(data.seconds);
  });
  

const GetMyUserName = (userList, id) => {
    const user = userList.find(user => user.id === id);

    if (user) {
        return user.username;
    }

    return "";
};

