/**
 * stores Difficulty Label, Range, ColorList
 * @exports
 * @constant
 * @type { ((string | null)[] | (string | number[] | string[])[])[]}
 */
export const diffData = [
    ["Easy", [0, 2], ["#4290ff", "#00FF00"]],
    ["Normal", [2, 2.7], ["#00FF00", "#FFFF00"]],
    ["Hard", [2.7, 4.0], ["#FFFF00", "#ff4e6f"]],
    ["Insane", [4.0, 5.3], ["#ff4e6f", "#c645b8"]],
    ["Expert", [5.3, 6.5], ["#c645b8", "#6563de"]],
    ["Master", [6.5, 8.0], ["#6563de", "#13106f"]],
    ["INFERNO", [8.0, 8.51], ["#13106f", "#000000"]],
    ["MAXIMUM", [8.51, Infinity], ["#000000", "#000000"]]
];
function hex_to_rgb(hex_color) {
    hex_color = hex_color.replace("#", "");
    let r = parseInt(hex_color.substring(0, 2), 16);
    let g = parseInt(hex_color.substring(2, 4), 16);
    let b = parseInt(hex_color.substring(4, 6), 16);
    return [r, g, b];
}

function rgb_to_hex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
/**
 * find Interpolate Color
 * @param {string} color1 hexColor
 * @param {string} color2 hexColor 
 * @param {number} ps MixRate 
 * @returns {string} hexColor
 */
function findInterpolateColor(color1, color2, ps) {
    let [r1, g1, b1] = hex_to_rgb(color1);
    let [r2, g2, b2] = hex_to_rgb(color2);
    let r = Math.floor(r1 + (r2 - r1) * ps);
    let g = Math.floor(g1 + (g2 - g1) * ps);
    let b = Math.floor(b1 + (b2 - b1) * ps);
    return rgb_to_hex(r, g, b);
}

export function findDifficultyCol(v) {
    let difficulty, color;
    /**
     * @type {Number} rounding off mixPoint
     */
    const mixPoint = 0.8;

    for (let i = 0; i < diffData.length; i++) {
        const diff = diffData[i];
        const diffName = diff[0];
        const range = diff[1];
        const colors = diff[2];

        //if (!range) break; // v is exceeded the range? 
        if (v >= range[0] && v < range[1]) {
            difficulty = diffName;
            const ps = (v - range[0]) / (range[1] - range[0]) * mixPoint;
            color = findInterpolateColor(colors[0], colors[1], ps);
            // console.log(v, range[0], range[1], colors[0], colors[1])
            break;
        }

    }

    if (!difficulty) {
        difficulty = "MAXIMUM";
        color = "#000";
    }

    return [difficulty, color];
}