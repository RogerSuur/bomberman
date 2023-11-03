const blockDensity = 0.6;
const powerUpDensity = 0.2;

const powerUps = {
    speed: "S",
    bombs: "B",
    flames: "F",
};

const randomPowerUp = () => {
    const rnd = Math.random();
    if (rnd < 0.33) {
        return powerUps.speed;
    } else if (rnd < 0.66) {
        return powerUps.bombs;
    } else {
        return powerUps.flames;
    }
};

// //Insert random destroyable blocks
//TODO: insert power ups and players
export const randomizer = (templateMap, playerCount) => {
    const totalPowerUps = {
        [powerUps.speed]: 1 + playerCount,
        [powerUps.bombs]: 2 + playerCount * 2,
        [powerUps.flames]: 2 + playerCount * 2,
    };

    let placedPowerUps = {
        [powerUps.speed]: 0,
        [powerUps.bombs]: 0,
        [powerUps.flames]: 0,
    };

    const updatedMap = templateMap.map((row) => {
        return row.replace(/ /g, () => {
            if (Math.random() < blockDensity) {
                return "W";
            } else if (Math.random() < powerUpDensity) {
                console.log("a power up");
                const powerUp = randomPowerUp();
                if (placedPowerUps[powerUp] < totalPowerUps[powerUp]) {
                    placedPowerUps[powerUp]++;
                    return powerUp;
                }
            }
            return " ";
        });
    });
    console.log("updatedMap", updatedMap);
    return updatedMap;
};
