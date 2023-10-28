import MiniFramework from "../framework/mini-framework.js";

// Define the configuration for the application
let items = [];
let currentRoute = {};

let storedItems = JSON.parse(localStorage.getItem("items"));

if (storedItems != null && storedItems instanceof Array) {
    items = storedItems;
}

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
