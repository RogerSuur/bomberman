import fw from "../fwinstance.js";

export let obstacles = [];
const cellSize = 36;

export const gameGrid = (newMap) => {
    obstacles = [];
    const gridVirtualNodes = [];
    for (let i = 0; i < newMap.length; i++) {
        const row = newMap[i];
        const rowElementVirtualNode = fw.dom.createVirtualNode("div", {
            attrs: { class: "grid-row" },
        });
        for (let j in row) {
            const tile = row[j];
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
                    // playerPositions.push({ x: parseInt(j), y: i });
                    break;
                default:
                    break;
            }

            if (tile === "#" || tile === "|" || tile === "W") {
                obstacles.push({
                    x: parseInt(j) * cellSize,
                    y: parseInt(i) * cellSize,
                    type: tile,
                });
            }

            const cellVirtualNode = fw.dom.createVirtualNode("div", {
                attrs: {
                    id: `row-${i}-cell-${j}`,
                    class: `grid-cell ${tileClass}`,
                },
            });
            rowElementVirtualNode.children.push(cellVirtualNode);
        }
        gridVirtualNodes.push(rowElementVirtualNode);
    }
    return gridVirtualNodes;
};
