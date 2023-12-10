import fw from "../fwinstance.js";
import { cellSize, obstacles, powerUps } from "../config.js";

export const gameGrid = (newMap) => {
    const gridVirtualNodes = [];
    for (let rowIndex = 0; rowIndex < newMap.length; rowIndex++) {
        const row = newMap[rowIndex];
        const rowElementVirtualNode = fw.dom.createVirtualNode("div", {
            attrs: { class: "grid-row" },
        });
        for (let colIndex in row) {
            const tile = row[colIndex];
            let tileClass = "";
            switch (tile) {
                case " ":
                case ".":
                    tileClass = "grass";
                    break;
                case "#":
                    tileClass = "main-wall";
                    break;
                case "|":
                    tileClass = "grey-wall";
                    break;
                case "W":
                    tileClass = "soft-wall";
                    break;
                case "S":
                    tileClass = "power-up-speed";
                    break;
                case "F":
                    tileClass = "power-up-flames";
                    break;
                case "B":
                    tileClass = "power-up-bombs";
                    break;

                case "P":
                    tileClass = "grass";
                    // playerPositions.push({ x: parseInt(colIndex), y: i });
                    break;
                default:
                    break;
            }

            if (tile === "#" || tile === "|" || tile === "W") {
                obstacles.push({
                    x: parseInt(colIndex),
                    y: parseInt(rowIndex),
                    type: tile,
                });
            }

            if (tile === "S" || tile === "F" || tile === "B") {
                powerUps.push({
                    x: parseInt(colIndex),
                    y: parseInt(rowIndex),
                    type: tile,
                });
            }

            const cellVirtualNode = fw.dom.createVirtualNode("div", {
                attrs: {
                    id: `row-${rowIndex}-cell-${colIndex}`,
                    class: `grid-cell ${tileClass}`,
                },
            });
            rowElementVirtualNode.children.push(cellVirtualNode);
        }
        gridVirtualNodes.push(rowElementVirtualNode);
    }
    return gridVirtualNodes;
};
