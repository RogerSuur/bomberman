import fw from "../fwinstance.js";

export const gameHud = (playerCount, playerClassName) => {
    const newGameHud = fw.dom.createVirtualNode("div", {
        attrs: { class: `hud-${playerCount}-pl ${playerClassName}` },
    });
    return newGameHud;
};
