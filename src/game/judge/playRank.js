/**
 * 클리어 점수와 점수 범위 를 받아 클리어 등급을 반환
 * @param {number} score 클리어 점수
 * @param {[number,number,string][]} scoreRanges 클리어 점수 범위 와 등급 목록 (최저,최대,등급)
 * @returns {string} 클리어 등급
 */
function getPlayRank(score, scoreRanges) {
    // 등급을 저장할 변수
    let rate = null;

    // 점수 범위를 순회하며 해당하는 등급 찾기
    for (let i = 0; i < scoreRanges.length; i++) {
        const [minScore, maxScore, rateName] = scoreRanges[i];
        if (score >= minScore && (score < maxScore || maxScore === Infinity)) {
            rate = rateName;
            break;
        }
    }

    return rate;
}
/**
 * 사운드 볼텍스의 클리어 점수 범위 와 등급 목록
 * @type {[number,number,string][]}
 */
const sdvxScoreRanges = [
    [0, 600000, "D"],
    [600000, 700000, "C"],
    [700000, 800000, "B"],
    [800000, 900000, "A"],
    [900000, 950000, "AA"],
    [950000, 1000000, "S"],
    //풀콤보
    [1000000, Infinity, "UC"]
];
/**
 * 그루브코스터의 클리어 점수 범위 와 등급 목록
 * @type {[number,number,string][]}
 */
const gcScoreRanges = [
    [0, 300000, "E"],
    [300000, 500000, "D"],
    [500000, 700000, "C"],
    [700000, 800000, "B"],
    [800000, 900000, "A"],
    [900000, 950000, "S"],
    [950000, 1000000, "S+"],
    //풀콤보
    [1000000, Infinity, "S++"]
];

export { gcScoreRanges, sdvxScoreRanges, getPlayRank };