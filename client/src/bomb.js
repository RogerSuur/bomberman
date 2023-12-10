import { cellSize, obstacles } from "./config.js";
import fw from "../src/fwinstance.js";
var bombsData = {};

const explosionRotatingDirections = {
    center: 0,
    right: 0,
    left: 180,
    down: 90,
    up: 270,
};

const centerExplosionStages = [
    "expl-center-1",
    "expl-center-3",
    "expl-center-4",
    "expl-center-5",
    "expl-center-4",
    "expl-center-3",
    "expl-center-2",
];
const sideExplosionStages = [
    "expl-side-1",
    "expl-side-2",
    "expl-side-3",
    "expl-side-4",
    "expl-side-3",
    "expl-side-2",
    "expl-side-1",
];
const wingExplosionStages = [
    "expl-wing-1",
    "expl-wing-2",
    "expl-wing-3",
    "expl-wing-4",
    "expl-wing-3",
    "expl-wing-2",
    "expl-wing-1",
];

const bombTickingStage = ["bomb-2", "bomb-3", "bomb-2", "bomb-1"];

//creates a bomb element with unique id in the playerposition cell
export function newBomb(playerPosition) {
    const row = Math.floor(playerPosition.y / cellSize);
    const col = Math.floor(playerPosition.x / cellSize);

    const bombId = `bomb-${Date.now()}`;
    const bombElement = fw.dom.createVirtualNode("div", {
        attrs: { class: "bomb-2", id: bombId },
    });

    bombsData[bombId] = {
        ticker: setInterval(() => bombTickingAnimation(bombId), 600),
        timer: setTimeout(() => explode(bombId), 2400),
        currentIndex: 0,
        explosionStageCounter: 0,
        reqFrameId: null,
        frameCount: 0,
        affectedCells: [],
        framesPerStage: 4,
        flames: 1,
    };

    const realBombElement = fw.dom.render(bombElement);
    const cellId = `row-${row}-cell-${col}`;
    const gridCell = document.getElementById(cellId);
    if (gridCell) {
        gridCell.appendChild(realBombElement);
    }
}

//clears the ticking animations and starts explosion animation
function explode(bombId) {
    clearInterval(bombsData[bombId].ticker);
    clearTimeout(bombsData[bombId].timer);
    bombsData[bombId].ticker = null;
    bombsData[bombId].timer = null;
    const bombCell = document.getElementById(bombId).parentNode;
    const [rowCol, col] = bombCell.id.split("cell-");
    const row = rowCol.split("row-").pop();
    explodeAnimation(row, col, bombId);
}

//uses framesCOunt and framesPerStage to animate explosion
function explodeAnimation(row, col, bombId) {
    if (bombsData[bombId].frameCount % bombsData[bombId].framesPerStage === 0) {
        setExplosionEffect(
            row,
            col,
            bombsData[bombId].explosionStageCounter,
            bombsData[bombId].flames,
            bombId
        );
        bombsData[bombId].explosionStageCounter++;
        if (bombsData[bombId].explosionStageCounter === 6) {
            clearExplosionEffect(bombId);
            return;
        }
    }
    bombsData[bombId].frameCount++;

    bombsData[bombId].reqFrameId = requestAnimationFrame(() =>
        explodeAnimation(row, col, bombId)
    );
}

//explosion effect in all directions range
function setExplosionEffect(row, col, explosionStageCounter, flames, bombId) {
    const directions = ["center", "up", "down", "left", "right"];
    directions.forEach((direction) => {
        let positions = [];
        for (let i = 1; i <= flames; i++) {
            let r = parseInt(row),
                c = parseInt(col);
            switch (direction) {
                case "center":
                    i++;
                    break;
                case "up":
                    r -= i;
                    break;
                case "down":
                    r += i;
                    break;
                case "left":
                    c -= i;
                    break;
                case "right":
                    c += i;
                    break;
            }
            const tileType = getTileType(r, c);
            if (tileType === "grid-cell main-wall") break;
            positions.push([r, c]);

            if (!arrayContains(bombsData[bombId].affectedCells, [r, c])) {
                bombsData[bombId].affectedCells.push([r, c]);
            }

            if (tileType === "grid-cell soft-wall") break;
        }
        applyExplosionEffect(positions, direction, explosionStageCounter);
    });
}

function arrayContains(arr, target) {
    return arr.some(([x, y]) => x === target[0] && y === target[1]);
}

//Applies the correct explosionstage png to correct direction position
function applyExplosionEffect(positions, direction, explosionStageCounter) {
    positions.forEach((position, index) => {
        const [r, c] = position;
        const adjacentCell = document.getElementById(`row-${r}-cell-${c}`);
        if (!adjacentCell) return;
        let isWing = false;
        if (direction !== "center") {
            if (index === positions.length - 1) {
                isWing = true;
            }
        }

        const explosion = constructExplosionElement(
            direction,
            explosionStageCounter,
            isWing
        );

        if (!adjacentCell.hasChildNodes()) {
            const realExplosionElement = fw.dom.render(explosion);
            adjacentCell.appendChild(realExplosionElement);
        } else {
            updateCellClass(
                adjacentCell.firstChild,
                adjacentCell.firstChild.className,
                explosion.attrs.class
            );
        }
    });
}

//chooses correct explosion stage and rotates it to necessary direction
function constructExplosionElement(key, explosionStageCounter, isWing) {
    var explosion = fw.dom.createVirtualNode("div", {
        attrs: { class: "", style: `` },
        children: [],
    });
    //Bomb center explosion order: 1,3,4,5,4,3,2
    //                      sides: 1,2,3,4,3,2,1

    if (key === "center") {
        explosion.attrs.class = centerExplosionStages[explosionStageCounter];
    } else if (isWing) {
        explosion.attrs.class = wingExplosionStages[explosionStageCounter];
    } else {
        explosion.attrs.class = sideExplosionStages[explosionStageCounter];
    }
    if (key !== "center") {
        explosion.attrs.style = `transform: rotate(${explosionRotatingDirections[key]}deg)`;
    }
    return explosion;
}

//clears the explosion classes from bomb and all adjacentpositions
function clearExplosionEffect(bombId) {
    if (!bombsData[bombId] || !bombsData[bombId].affectedCells) {
        console.error("Bomb data not found for bombId:", bombId);
        return;
    }

    bombsData[bombId].affectedCells.forEach(([r, c]) => {
        const cell = document.getElementById(`row-${r}-cell-${c}`);
        if (cell) {
            if (cell.classList.contains("soft-wall")) {
                destroySoftWall(cell, r, c);
            }

            const explosionElement = Array.from(cell.children).find((child) =>
                child.className.startsWith("expl-")
            );
            if (explosionElement) {
                cell.removeChild(explosionElement);
            }

            // TODO: Implement explosion-player collision handling logic

            // TODO: Implement bomb-bomb collision handling logic

            cell.className = "grid-cell grass";
        }
    });
    bombsData[bombId].affectedCells = [];
    delete bombsData[bombId];
}

function destroySoftWall(cell, row, col) {
    //TODO: Display wall destroction animation
    //TODO: Remove it from obstacles array
    console.log("destroying cell at", row, col);
    const index = obstacles.findIndex((obj) => obj.y === row && obj.x === col);
    if (index !== -1) {
        obstacles.splice(index, 1);
    }
}

function getTileType(r, c) {
    const cell = document.getElementById(`row-${r}-cell-${c}`);
    return cell.className;
}

function updateCellClass(cell, oldClass, newClass) {
    cell.classList.remove(oldClass);
    cell.classList.add(newClass);
}

//animates the bomb ticking
function bombTickingAnimation(bombId) {
    const bomb = document.getElementById(bombId);
    let currentIndex = bombsData[bombId].currentIndex;
    bomb.className = bombTickingStage[currentIndex];
    bombsData[bombId].currentIndex =
        (currentIndex + 1) % bombTickingStage.length;
}
