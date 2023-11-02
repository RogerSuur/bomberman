//import { Socket } from "socket.io";
import fw from "./src/fwinstance.js";
// import Chat from "./src/chat.js";
import BombermanGame from "./src/game.js";

const socket = io();

const App = (attrs = {}, children = []) =>
    fw.dom.createVirtualNode("div", {
        attrs: {
            ...attrs,
        },
        children,
    });

export const gameInstance = new BombermanGame(fw, socket, {});
export const appNode = App({ id: "app", class: "gameapp" }, []);
fw.dom.mount(document.getElementById("app"), appNode);
