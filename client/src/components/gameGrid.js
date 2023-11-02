import fw from "../fwinstance.js";

export const gameGrid = (newMap) => {
    const gridVirtualNodes = [];
    for (let i = 0; i < newMap.length; i++) {
        const row = newMap[i];
        const rowElementVirtualNode = fw.dom.createVirtualNode("div", {
            attrs: { class: "grid-row" },
        });
        for (let i in row) {
            const tile = row[i];
            let tileClass = "";
            let cellChildren = [];
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
                case "P":
                    tileClass = "grass";
                    const playerNode = fw.dom.createVirtualNode("div", {
                        attrs: { class: "player" },
                    });
                    cellChildren.push(playerNode);
                    break;
                default:
                    break;
            }
            const cellVirtualNode = fw.dom.createVirtualNode("div", {
                attrs: { class: `grid-cell ${tileClass}` },
                children: cellChildren,
            });
            rowElementVirtualNode.children.push(cellVirtualNode);
        }
        gridVirtualNodes.push(rowElementVirtualNode);
    }
    return gridVirtualNodes;
};
