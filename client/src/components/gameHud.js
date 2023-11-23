import fw from "../fwinstance.js";

export const gameHud = (playerCount) => {
    const newGameHud = fw.dom.createVirtualNode("div", {
        attrs: { class: `hud-${playerCount}-pl` },
    });
    return newGameHud;
};
