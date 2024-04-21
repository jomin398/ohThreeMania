import * as THREE from "three";
import { Note, NoteState, FastNoteQueue } from "./note.js";
import { ckNoteExpired, handleLongNoteJudge, handleNoteJudge } from "./judge/calc.js";
import Playfield from "./playfield.js";
export const NoteInputTiming = {
    NORMAL: 0,
    FAST: 1,
    LATE: 2
}
function setNoteReceptor(laneIndex) {
    switch (laneIndex) {
        case 0:
            this.noteReceptor.position.x = -0.12;
            this.noteReceptor.position.y = -0.78;
            this.noteReceptor.rotation.z = THREE.MathUtils.DEG2RAD * 270;
            break;
        case 2:
            this.noteReceptor.position.x = 0;
            this.noteReceptor.position.y = -0.66;
            this.noteReceptor.rotation.z = THREE.MathUtils.DEG2RAD * 180;
            break;
        case 3:
            this.noteReceptor.position.x = 0.12;
            this.noteReceptor.position.y = -0.78;
            this.noteReceptor.rotation.z = THREE.MathUtils.DEG2RAD * 90;
            break;
        default:
        case 1:
            // 아래 방향으로는 추가 회전 필요 없음
            break;
        // console.log("잘못된 인덱스입니다.");
    };
}
export class Lane {
    notes = [];
    lastActiveState = false; // is lane pressed by player
    lastNoteHitIndex = -1;
    lastVisualNote = 0; // optimisation for rendering
    skin;
    noteQueue;
    noteReceptor;
    laneGroup = new THREE.Group();
    laneIndex = 0;
    gcModeEnable = false;
    /**
     * 
     * @param {Playfield} playField 
     * @param {Number} laneIndex 
     */
    constructor(playField, laneIndex) {
        const skin = playField.skin;
        this.isAutoPlay = playField.autoPlay;
        this.skin = skin;
        this.noteReceptor = skin.noteReceptorMesh;
        this.noteReceptor.position.y = skin.receptorOffset - 1;
        if (!this.gcModeEnable) setNoteReceptor.call(this, laneIndex);
        this.laneGroup.add(this.noteReceptor);
        this.noteQueue = new FastNoteQueue(skin, laneIndex);
        this.laneIndex = laneIndex;
    }
    initScene(scene) {
        scene.add(this.laneGroup);
    }
    // visually change note receptor when player presses input key
    set noteReceptorActive(isActive) {
        this.noteReceptor.material = isActive ? this.skin.noteReceptorActiveMaterial : this.skin.noteReceptorMaterial;
        this.noteReceptor.material.needsUpdate = true;
    }
    get currentNote() {
        //console.log(this.notes.length)
        return this.notes[this.lastNoteHitIndex + 1];
    }

    handleNoteInput(n, time, isActive, judgement) {
        const [judge, offset] = judgement.getJudge(time, n.startTime);
        // note passed without player hitting it

        if (ckNoteExpired(n, judge, time)) {
            //console.log("note expired");
            return [n.setState(NoteState.MISSED, time), judgement.missTiming, offset];
        }
        if (n.isLn) return handleLongNoteJudge(n, time, isActive, judgement, this.lastActiveState, this.isAutoPlay);
        else return handleNoteJudge(n, time, isActive, judgement, this.lastActiveState, this.isAutoPlay);
    }
    update(time, isActive, speed, judgement, scoreboard) {
        const updateVisibleNotes = () => {
            for (let i = this.lastVisualNote; i < this.notes.length; i++) {
                const n = this.notes[i];
                if (n.isAboveScreen(time, speed)) break;
                n.update(time, speed);
                if (!n.isNoteOnScreen(time, speed)) {
                    n.releaseMeshes();
                    this.lastVisualNote = i + 1;
                }
            }
        }
        if (this.lastActiveState !== isActive) this.noteReceptorActive = isActive;
        updateVisibleNotes();
        let hitDelta = null;
        const n = this.currentNote;
        if (n !== undefined) {
            const noteJudge = this.handleNoteInput(n, time, isActive, judgement);
            if (noteJudge !== null) // not null if note has changed state
            {
                let judge, offset;
                [judge, hitDelta, offset] = noteJudge;
                const score = judgement.scoreHitDelta(hitDelta);
                scoreboard.recalculateAccuracy(score, judgement.maxScore, noteJudge, n, this);

                if (judge !== NoteState.HELD) {
                    this.skin.playSound(this.currentNote.hitSound)
                    this.lastNoteHitIndex++;
                }
            }
        }
        this.lastActiveState = isActive;
        return hitDelta;
    }
    addNote(startTime, endTime = -1, hitSound) {
        const note = new Note(startTime, this.skin, this.noteQueue, hitSound, this.laneIndex);
        if (endTime >= 0) note.createLn(endTime);
        this.notes.push(note);
        this.laneGroup.add(note.noteGroup);
    }
}