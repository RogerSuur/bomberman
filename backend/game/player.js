export default class Player {
  constructor(id, username, position) {
    this.id = id;
    this.username = username;
    this.position = position;
    this.lives = 3;
    this.bombsPlaced = 0;
    this.powerups = { bombs: 1, flames: 2, speed: 1 };
  }
}
