const socket = io.connect('http://localhost');  // Establish WebSocket connection

const gameConfig = {
    gridSize: [10, 10]
    // Add more configs as needed
}

const game = new BombermanGame(fw, socket, gameConfig);
game.render();  // Render the initial game state

const chat = new Chat(socket, fw.state);