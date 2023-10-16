export const zip = (array1, array2) => {
    const zipped = [];
    for (let i = 0; i < Math.min(array1.length, array2.length); i++) {
        zipped.push([array1[i], array2[i]]);
    }
    return zipped;
}