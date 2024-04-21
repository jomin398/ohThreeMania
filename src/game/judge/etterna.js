
import * as Util from "../../utils.js";
import { HitJudge } from "./judgement.js";
// etterna calculations taken from official repo: https://github.com/etternagame/etterna/
// https://www.desmos.com/calculator/qebv9dcoll
export default class EtternaJudgement {
    #timings = [
        [22, 45, 90, 135, 180], // j4
        [18, 38, 76, 113, 151] // j5
    ];

    #timingScales = [1, 1, 1, 1, 0.84, 0.66, 0.50, 0.33, 0.20];

    #judgeTiming = [];
    #timingScale = 0;

    constructor(judge) {
        this.#judgeTiming = this.#timings[0];
        this.#timingScale = this.#timingScales[judge - 1];
    }

    // wife3 calculator
    scoreHitDelta(delta) {
        const missWeight = -5.5;
        const ridic = 5 * this.#timingScale;
        const maxBooWeight = 180 * this.#timingScale;
        const tsPow = 0.75;
        const zero = 65 * (this.#timingScale ** tsPow);
        const dev = 22.7 * (this.#timingScale ** tsPow);

        if (delta <= ridic)
            return this.maxScore;
        else if (delta <= zero)
            return this.maxScore * Util.erf((zero - delta) / dev);
        else if (delta <= maxBooWeight)
            return (delta - zero) * missWeight / (maxBooWeight - zero);
        return this.maxScore;

    }

    get maxScore() { return 2; }

    get autoPlayHitTime() {
        return this.#judgeTiming[0];
    }
    getJudge(time, targetTime) {
        // 판정 시간과 목표 시간의 차이 계산
        let timeOff = time - targetTime;
        // 절대값을 사용하여 얼마나 벗어났는지 계산
        const timeAbs = Math.abs(timeOff);
        // note within timing window
        if (timeAbs <= this.#judgeTiming[this.#judgeTiming.length - 1]) {
            const judge = this.#judgeTiming.findIndex(window => timeAbs <= window);
            //if perfect, set offset to 0;
            if (judge == 0 || judge == 1) timeOff = 0;
            return [judge, timeOff]; // 기존의 판정 값과 오프셋을 배열로 반환
        }
        else if (timeOff > 0) {
            return [HitJudge.MISS, timeOff]; // Miss 판정과 오프셋 반환
        }
        return [HitJudge.NOT_HIT, timeOff]; // Not Hit 판정과 오프셋 반환
    }

    get missTiming() {
        return this.#judgeTiming[this.#judgeTiming.length - 1];
    }

}