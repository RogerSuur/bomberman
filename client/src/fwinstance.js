import MiniFramework from "../framework/mini-framework.js";

// Define the configuration for the application
let players = [];
let currentRoute = {};

let storedPlayers = JSON.parse(localStorage.getItem("players"));

if (storedPlayers != null && storedPlayers instanceof Array) {
    players = storedPlayers;
}

const fwConfig = {
    initialState: {
        players: players,
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

debugger

const fw = new MiniFramework(fwConfig);

export default fw;
