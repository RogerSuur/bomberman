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
            let powerUpClass;
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
                    tileClass = "soft-wall";
                    powerUpClass = "power-up-speed";
                    break;
                case "F":
                    tileClass = "soft-wall";
                    powerUpClass = "power-up-flames";
                    break;
                case "B":
                    tileClass = "soft-wall";
                    powerUpClass = "power-up-bombs";
                    break;

                case "P":
                    tileClass = "grass";
                    // playerPositions.push({ x: parseInt(colIndex), y: i });
                    break;
                default:
                    break;
            }

            // if (tile === "#" || tile === "|" || tile === "W") {
            if (tile !== " " && tile !== "." && tile !== "P") {
                obstacles.push({
                    x: parseInt(colIndex),
                    y: parseInt(rowIndex),
                    type: tile,
                });
            }

            //reverse the row and col index x: row, y: col
            if (tile === "S" || tile === "F" || tile === "B") {
                powerUps.push({
                    x: parseInt(colIndex),
                    y: parseInt(rowIndex),
                    type: `grid-cell ` + powerUpClass,
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
