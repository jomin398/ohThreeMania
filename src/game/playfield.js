import { Lane } from "./lane.js";
import { laneJudgeUpdate } from "./scBoard.js";

export default class Playfield {
    scoreboard;

    baseSpeed;
    skin;
    lanes = [];
    judgement;
    noteQueue;
    constructor(agent, speed, judgement, scoreboard) {
        this.baseSpeed = speed;
        //this.skin = skin;
        this.lanes = [];
        this.judgement = judgement;
        this.scoreboard = scoreboard;
        this.agent = agent;
    }
    #autoPlayMode = false;
    #finshTime = null;
    // #notesNum = 0;
    isFinished = false;
    set autoPlay(v = false) {
        this.#autoPlayMode = v;
    }
    get autoPlay() {
        return this.#autoPlayMode;
    }
    initScene(scene) {
        this.lanes.forEach(l => l.initScene(scene));
    }
    update(time, laneState) {
        //auto play node.
        const autoPlay = n => {
            const st = n.startTime;
            const et = n.endTime;

            const d = this.judgement.autoPlayHitTime;

            const isInRange = (min, max) => time >= min && time <= max;

            return isInRange(st, st + d) || // note within judge
                (n.isLn && isInRange(st, (et != null ? et : 0))); // note and ln end within judge
        };

        //console.log(this.lanes[0].lastNoteHitIndex);
        this.lanes.forEach((l, i) => {
            if (this.#autoPlayMode && l.currentNote) {
                laneState[i] = autoPlay(l.currentNote);
                laneJudgeUpdate(null, i);
            }
            l.update(time, laneState[i], this.baseSpeed, this.judgement, this.scoreboard, i);
            //detect chart is Finished.
            if (time >= this.#finshTime) this.isFinished = true;
        });
        this.scoreboard.update();
    }
    loadChart(chart) {
        const keys = chart.keys;
        let noteCount = 0;
        let longNoteCount = 0;
        this.lanes = chart.notes.reduce((acc, o) => {
            const lane = o.lane;
            const currLane = acc.laneObjects[lane];
            if (!currLane) return acc;
            currLane.addNote(o.startTime, o.endTime ?? null, o.hitSound);
            noteCount++;
            // 롱노트의 경우 개수를 추가로 세어줍니다.
            if (o.endTime != null) {
                longNoteCount++;
            }

            return acc;
        }, {
            laneObjects: [...Array(keys)].map((v, i) => new Lane(this, i)),
        }).laneObjects;
        this.scoreboard.maxNotes = noteCount;
        this.scoreboard.maxLongNotes = longNoteCount;
        this.scoreboard.totalNotes = noteCount + longNoteCount;
        // this.scoreboard.longNoteCount = longNoteCount;
        for (let i = 0; i < chart.notes.length; i++) {
            let note = chart.notes[i];
            let noteTime = note.endTime ? note.endTime : note.startTime;
            if (noteTime + this.judgement.missTiming > this.#finshTime) {
                this.#finshTime = noteTime + this.judgement.missTiming;
            }
        }
    }

}