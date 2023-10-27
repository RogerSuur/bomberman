import fw from "../fwinstance.js";
import { templateMap } from "../game/tilemap.js";
import { randomizer } from "../game/init.js";

export const GameGrid = () => {
    const newMap = randomizer(templateMap);

    const gridVirtualNodes = [];
    for (let i = 0; i < newMap.length; i++) {
        const row = newMap[i];
        const rowElementVirtualNode = fw.dom.createVirtualNode("div", {
            attrs: { class: "grid-row" },
        });
        for (let i in row) {
            const tile = row[i];
            let tileClass = "";
            switch (tile) {
                case " ":
                case ".":
                    tileClass = "tile-grass";
                    break;
                case "#":
                    tileClass = "tile-wall";
                    break;
                case "|":
                    tileClass = "tile-grey";
                    break;
                case "W":
                    tileClass = "tile-block";
                    break;
                case "P":
                    tileClass = "tile-grass";
                    break;
                default:
                    break;
            }
            const cellVirtualNode = fw.dom.createVirtualNode("div", {
                attrs: { class: `grid-cell ${tileClass}` },
            });
            rowElementVirtualNode.children.push(cellVirtualNode);
        }
        gridVirtualNodes.push(rowElementVirtualNode);
    }
    return gridVirtualNodes;
};
