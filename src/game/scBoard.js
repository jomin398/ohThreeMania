import gameAgent from "./agent.js";
import ComboSys from "./comboSys.js";
import { HitJudge } from "./judge/judgement.js";
import { update as gameGaugeUpdate } from "./layouts/gameGaugeWrap.js";
import { NoteState } from "./note.js";

function autoComma(str) {
    if (typeof str == 'number') str = str.toString();
    return str.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
}
export const setUiState = (obj) => {
    let { combo, maxCombo, noteAcc, score } = obj;
    const accCont = document.querySelector(".accCont");
    const scoreCont = document.querySelector(".scoreCont");
    if (accCont) {
        document.querySelector(".accCont .maxcomb").innerText = maxCombo;
        document.querySelector(".accCont .combo").innerText = combo;
        //document.querySelector(".accCont .acc").innerText = `${accuracy.toFixed(2)}%`;
        //document.querySelector(".accCont .noteAcc").innerText = `${noteAcc.toFixed(2)}%`;
        gameGaugeUpdate(noteAcc.toFixed(2));
        //document.querySelector(".accCont .miss").innerText = miss;
        //document.querySelector(".accCont .great").innerText = great;
        //document.querySelector(".accCont .perfect").innerText = perfect;
        //document.querySelector(".accCont .fast").innerText = fast;
        //document.querySelector(".accCont .late").innerText = late;
    }
    if (scoreCont) document.querySelector(".scoreCont .score").innerText = autoComma(Math.trunc(score));
}
/**
 * 레인 판정 표시 업데이트 함수
 * @param {[judgeText:string, fastLate:number, msc:number]} arr
 * @param {number} idx lane index
 * @param {{noteJudgmentCheck:boolean,fastLate:boolean,fastLateMS:boolean}?} config 
 */
export function laneJudgeUpdate(arr, idx, config) {
    let judgeText, fastLate, msc;
    if (arr) [judgeText, fastLate, msc] = arr;

    const judgeElement = $(`#lane-${idx + 1}-judge`);
    let flClass = "";
    let flText = "";
    let noteJudgmentCheck, dispFL, fastLateMS;
    if (config) {
        noteJudgmentCheck = config.noteJudgmentCheck;
        dispFL = config.fastLate;
        fastLateMS = config.fastLateMS;
    }
    if (!dispFL) fastLate = -1;
    if (!noteJudgmentCheck) judgeText = "";
    if (!fastLateMS) msc = null;
    switch (fastLate ?? -1) {
        case 0:
            //msc 가 음수일때.
            flClass = "judgeFast";
            flText = "Fast";
            break;
        case 2:
            //msc 가 양수일때.
            flClass = "judgeLate";
            flText = "Late";
            break;
        default:
            flClass = "";
            flText = "";
            break;
    }


    const str = `<span class="text">${judgeText ?? ''}</span>
        <span class="timing ${flClass}">${flText}</span>
        <span class="msc ${flClass}">${msc ? (msc * -1).toFixed(2) : ""}</span>`
    judgeElement.html(str);
}
export class Scoreboard {
    result = {
        combo: 0,
        accuracy: 0,
        maxCombo: 0,
        noteAcc: 0,
        miss: 0,
        good: 0,
        great: 0,
        perfect: 0,
        fast: 0,
        late: 0,
        score: 0
    }
    #comboMgr = null;
    #noteCounter = 0;
    #accuracyScore = 0;
    maxNotes = 0;
    maxLongNotes = 0;
    totalNotes = 0;
    setUiState = null;
    currentJudge = null;

    /**
     * @type {Boolean} allow negative Accuracy Valve
     */
    allowNegAcc = false;
    constructor(uiSettingCallBack, game) {
        this.setUiState = uiSettingCallBack;
        this.#game = game;
        this.keyboardMgr = this.#game.keyInputMgr;
        this.#comboMgr = new ComboSys($('.renderOverlay .comboWrap').get(0), { maxLength: 1 });
        this.#comboMgr.reset();
        this.keyboardMgr.laneClear = (e) => {
            //e.preventDefault();
            let laneIndex;
            if (typeof e == 'string' && this.keyboardMgr.keyBindings.includes(e)) {
                laneIndex = this.keyboardMgr.keyBindings.indexOf(e)
            } else if (typeof e == 'number') {
                laneIndex = e;
            }
            laneJudgeUpdate(null, laneIndex, this.#game.userConfigs);
        };
    }
    // clearLane(idx) {
    //     $(`#lane-${idx + 1}-judge`).html(`<span class="text"></span>
    //     <span class="timing"></span>
    //     <span class="msc">0</span>`);
    // }
    #judgeList = [];
    get judgeList() {
        return this.#judgeList;
    }
    /**
     * @type {gameAgent?}
     */
    #game = null;

    updateJudge(noteJudge, judgeText, laneIndex) {
        let [judge, hitDelta, offset] = noteJudge;
        // const curJudge = this.#curJudges[laneIndex];
        // curJudge[2] = offset;

        this.#judgeList.push({
            j: judge,
            t: offset,
            tx: judgeText
        })
    }

    //keyboard.isPressed("z"), keyboard.isPressed("x"), keyboard.isPressed(","), keyboard.isPressed(".")
    recalculateAccuracy(score, maxScore, noteJudge, note, lane) {
        let [judge, hitDelta, offset] = noteJudge;
        let judgeText = '';

        //this.#curJudges[lane.laneIndex] = ['', -1, 0];

        let fastLate = (Math.sign(offset) + 1);
        //console.log(judge);
        //throw new Error("test")

        if (fastLate == 0) this.result.fast++;
        if (fastLate == 2) this.result.late++;
        //fixed Judge when note is LongNote and Helded.
        if (note.isLn && note.state == NoteState.HELD) {
            judge = HitJudge.PERFECT;
            noteJudge[0] = HitJudge.PERFECT;
            this.result.combo++;
        }
        if (note.state === NoteState.MISSED) {
            console.log('miss', lane.laneIndex, offset);
            this.result.combo = 0;
            this.#comboMgr.reset();
            lane.skin.playSound(-1);

            this.result.miss++; // 'miss' 카운트 증가

            //offset가 양수이면 Late, 음수라면 Fast.
            //this.#curJudges[lane.laneIndex][1] = 0;
            judgeText = 'MISS';
            this.#game.engine.selfCrash.detect()
        }
        else if (note.state === NoteState.HIT) {
            lane.skin.playSound(lane.currentNote.hitSound)
            this.result.combo++;
            this.#comboMgr.update(this.result.combo);
        };
        if (judge === HitJudge.GREAT) {
            this.result.great++;
            judgeText = 'GREAT';
        }
        if (judge === HitJudge.PERFECT) {
            this.result.perfect++;
            judgeText = 'PERFECT';
        }
        this.updateJudge(noteJudge, judgeText, lane.laneIndex);
        laneJudgeUpdate([judgeText, fastLate, offset], lane.laneIndex, this.#game.userConfigs)

        this.#accuracyScore += score;
        this.#noteCounter++;
        this.result.accuracy = (this.#accuracyScore / this.#noteCounter) / maxScore * 100;
        if (!this.allowNegAcc && this.result.accuracy <= 0) this.result.accuracy = 0; // 점수가 음수일 경우 0으로 설정
        //this.result.noteAcc += ((score / maxScore) / this.totalNotes) * 100;
        let indvNoteAcc = ((score / maxScore) / this.totalNotes) * 100;
        if (indvNoteAcc > 0) this.result.noteAcc += indvNoteAcc;
        this.result.score = ((this.result.noteAcc / 100) * 1e6);
        if (this.result.score <= 0) {
            this.result.score = 0; // 점수가 음수일 경우 0으로 설정
        }
    }

    update() {
        if (this.result.combo > this.result.maxCombo) {
            this.result.maxCombo = this.result.combo;
        }
        this.setUiState(this.result);


        // setTimeout(()=>{
        //     this.#clearJudgesDisp();
        // },2000)
    }
}