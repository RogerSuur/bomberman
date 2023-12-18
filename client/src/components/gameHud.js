import fw from "../fwinstance.js";

const livesPositions = [247, 319, 391, 463];

export const gameHud = (playerCount) => {
  const newGameHud = fw.dom.createVirtualNode("div", {
    attrs: { class: `hud-${playerCount}-pl` },
  });

  for (let i = 1; i <= playerCount; i++) {
    const playerLives = fw.dom.createVirtualNode("div", {
      attrs: {
        id: `pl-${i}`,
        class: `lives-3`,
        style: `margin-top: 28.5px;margin-left:${livesPositions[i - 1]}px`,
      },
    });
    console.log(`Player ${i} lives virtual node:`, playerLives);
    newGameHud.children.push(playerLives);
  }

  console.log("Final HUD virtual node:", newGameHud);
  return newGameHud;
};
