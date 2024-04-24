import * as THREE from "three";
import { Note, NoteState, FastNoteQueue } from "./note.js";
import { ckNoteExpired, handleLongNoteJudge, handleNoteJudge } from "./judge/calc.js";
import Playfield from "./playfield.js";
import { setNoteReceptor } from "./setNoteReceptor.js";
import LaneBgManager from "./laneBg.min.js";
export const NoteInputTiming = {
    NORMAL: 0,
    FAST: 1,
    LATE: 2
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
        this.noteReceptor.name = "noteReceptor";
        this.noteReceptor.position.y = skin.receptorOffset - 1;
        this.agent = playField?.agent;
        if (!this.gcModeEnable) setNoteReceptor(this.noteReceptor, laneIndex);
        this.laneBgManager = new LaneBgManager(this); // Initialize LaneBgManager
        this.laneBgManager.init(); // Initialize LaneBgManager
        this.laneGroup.add(this.noteReceptor);
        this.noteQueue = new FastNoteQueue(skin, laneIndex);
        this.laneIndex = laneIndex;
    }
    reqRemoveGradient = false;
    initScene(scene) {
        scene.add(this.laneGroup);
    }
    // visually change note receptor when player presses input key
    set noteReceptorActive(isActive) {
        this.noteReceptor.material = isActive ? this.skin.noteReceptorActiveMaterial : this.skin.noteReceptorMaterial;

        if (isActive) {
            this.laneBgManager.add("#000000", "#ffffff", 3);
        } else {
            this.laneBgManager.requestRemoval();
        }
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
        this.laneBgManager.update();
        return hitDelta;
    }
    addNote(startTime, endTime = -1, hitSound) {
        const note = new Note(startTime, this.skin, this.noteQueue, hitSound, this.laneIndex);
        if (endTime >= 0) note.createLn(endTime);
        this.notes.push(note);
        this.laneGroup.add(note.noteGroup);
    }
}