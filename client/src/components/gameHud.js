import fw from "../fwinstance.js";

const livesPositions = [247, 319, 391, 463];

export const gameHud = (players) => {
  const newGameHud = fw.dom.createVirtualNode("div", {
    attrs: { 
      id: "game-hud",
      class: `hud-${players.length}-pl`,
    },
  });

  for (let i = 0; i < players.length; i++) {
    const playerLives = fw.dom.createVirtualNode("div", {
      attrs: {
        id: `player-lives-${players[i].id}`,
        class: `lives-3`,
        style: `margin-top: 28.5px;margin-left:${livesPositions[i]}px`,
      },
    });
    newGameHud.children.push(playerLives);
  }

  return newGameHud;
};
