import fw from "./src/fwinstance.js";
// import Chat from "./src/chat.js";
import BombermanGame from "./src/game.js";
import { gameHud } from "./src/components/gameHud.js";

const App = (attrs = {}, children = []) =>
    fw.dom.createVirtualNode("div", {
        attrs: {
            ...attrs,
        },
        children,
    });

const gameInstance = new BombermanGame(fw, null, {});
const gameNode = gameInstance.generateLayout();

const appNode = App({ id: "app", class: "gameapp" }, [gameNode]);
fw.dom.mount(document.getElementById("app"), appNode);
