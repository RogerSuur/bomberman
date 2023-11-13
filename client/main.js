//import { Socket } from "socket.io";
import fw from "./src/fwinstance.js";
//import Chat from "./src/chat.js";
import BombermanGame from "./src/game.js";
import PreLobby from "./src/lobby/preLobby.js";
import Lobby from "./src/lobby/lobby.js";
import ChatComponent from "./src/chat.js"; 

const socket = io(); // Establish WebSocket connection
const chatComponent = new ChatComponent(socket);
const chatElement = chatComponent.getChatElement();

const form = document.getElementById("form");
const input = document.getElementById("input");
const start = document.getElementById("start");


// start.addEventListener("click", () => {
//     socket.emit("launch");
// });

form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value) {
        socket.emit("username", input.value);
        input.value = "";
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


const gameNode = gameInstance.generateLayout();
// gameInstance.render();

//Lobby
const preLobbyInstance = new PreLobby(fw, false);
const preLobby = preLobbyInstance.render();

export const appNode = App({ id: "app", class: "gameapp" }, [preLobby]);
fw.dom.mount(document.getElementById("app"), appNode);


fw.events.subscribe("userNameInUser",() =>{ 
    preLobbyInstance.errorPresent = true;
    preLobbyInstance.update(preLobby)
})

//LOBBY
fw.events.subscribe("userAdded",() =>{
        const lobbyInstance = new Lobby(fw);
        const lobby = lobbyInstance.render();
        const newApp = App({ id: "app", class: "gameapp" }, [lobby]);
        const patch = fw.dom.diff(appNode, newApp);
        const actualDOMNode = document.getElementById("app");
        patch(actualDOMNode);
        
})
