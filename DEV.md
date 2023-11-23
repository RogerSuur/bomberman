```
const player = {
    id Number,
    username String,
    lives Number,
    position: {x Number, y Number},
    powerups: {bombs Number, flames Number, speed Number},
    bombs_placed Number,
}
```

An initial instance of Player has 1 bomb, 2 flames, 1 speed and 0 bombs_placed. Positions are assigned clockwise starting from the top left corner.

When gameStart event is emitted, the instance has a map and an array of Player instances. When a powerup is picked up the corresponding powerup is incremented.
