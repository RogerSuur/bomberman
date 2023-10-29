import fw from "../fwinstance.js";

export const gameHud = () => {
    const newGameHud = fw.dom.createVirtualNode("div", {
        attrs: { class: "hud-4-pl" },
    });
    return newGameHud;
};
