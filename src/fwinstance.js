import MiniFramework from "../framework/mini-framework.js";

const fwConfig = {
  initialState: {
        players: [],
        bombs: [],
        gameStatus: 'notStarted',
        messages: [],
        // ... other initial states
  },
  routes: {/* ... */}
};

const fw = new MiniFramework(fwConfig);

export default fw;
