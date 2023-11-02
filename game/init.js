const blockDensity = 0.6;

// //Insert random destroyable blocks
//TODO: insert power ups and players
export const randomizer = (templateMap) => {
    const updatedMap = templateMap.map((row) =>
        row.replace(/ /g, () => (Math.random() < blockDensity ? "W" : " "))
    );
    return updatedMap;
};
