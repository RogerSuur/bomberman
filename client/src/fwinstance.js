import MiniFramework from "../framework/mini-framework.js";

const fwConfig = {
  initialState: {
    players: [],
    bombs: [],
    gameStatus: "notStarted",
    messages: [],
  },
  routes: [
    {
      path: "/",
      component: "game",
    },
  ],
};

const fw = new MiniFramework(fwConfig);

export default fw;
