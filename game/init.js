const blockDensity = 0.6;

const powerUps = {
    speed: "S",
    bombs: "B",
    flames: "F",
};
var totalPowerUps;

// //Insert random destroyable blocks
//TODO: insert players by the numvers
export const populateMapWithWallsAndPowerUps = (templateMap, playerCount) => {
    totalPowerUps = calculateNumberOfPowerUps(playerCount);
    const powerUpPositions = findPowerUpPositions(templateMap);
    let updatedMap = [];
    //replace the characters in map with powerups or grass
    templateMap.forEach((row, rowIndex) => {
        let newRow = "";
        for (const colIndex in row) {
            if (row.hasOwnProperty(colIndex)) {
                const cell = row[colIndex];
                if (
                    cell === " " &&
                    powerUpPositions.some(
                        (pos) =>
                            pos.rowIndex === rowIndex &&
                            pos.colIndex == colIndex
                    )
                ) {
                    newRow += randomPowerUp();
                } else if (cell === " " && Math.random() < blockDensity) {
                    newRow += "W";
                } else {
                    newRow += cell;
                }
            }
        }
        updatedMap.push(newRow);
    });
    return updatedMap;
};

// select a random powerup from the pre-generated list
const randomPowerUp = () => {
    let powerUpTypes = [powerUps.speed, powerUps.bombs, powerUps.flames];
    powerUpTypes = shufflePositions(powerUpTypes);

    for (let i = 0; i < powerUpTypes.length; i++) {
        if (totalPowerUps[powerUpTypes[i]] > 0) {
            totalPowerUps[powerUpTypes[i]] -= 1;
            return powerUpTypes[i];
        }
    }

    return null;
};

const shufflePositions = (array) => {
    let currentIndex = array.length,
        randomIndex;
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
    return array;
};

const calculateNumberOfPowerUps = (playerCount) => {
    return {
        [powerUps.speed]: playerCount + Math.floor(Math.random() * playerCount),
        [powerUps.bombs]: playerCount + Math.floor(Math.random() * playerCount),
        [powerUps.flames]:
            playerCount + Math.floor(Math.random() * playerCount),
    };
};

//return row-col index array for all powerup positions
const findPowerUpPositions = (templateMap) => {
    //find all possible positions for powerup
    const grassPositions = templateMap
        .flatMap((row, rowIndex) =>
            [...row].map((cell, colIndex) =>
                cell === " " ? { rowIndex, colIndex } : null
            )
        )
        .filter(Boolean);
    shufflePositions(grassPositions);
    return grassPositions.slice(
        0,
        totalPowerUps.S + totalPowerUps.B + totalPowerUps.F
    );
};
