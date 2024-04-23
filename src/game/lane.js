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

/**
 * colorA 에서 colorB 로 변화하는 그라데이션을 적용하는 함수
 * @param {THREE.Object3D} obj 
 * @param {string} colorA hex color code. 
 * @param {string} colorB hex color code.
 * @param {number} direction 그라데이션의 방향
 * @returns {THREE.Object3D}
 */
function applyGradient(obj, color1, color2, direction = 0) {
    // 캔버스를 생성하여 그라데이션을 그립니다.
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    var context = canvas.getContext('2d');

    // direction 값에 따라 그라데이션 방향을 결정합니다.
    let grad;
    switch (direction) {
        case 0: // 왼쪽에서 오른쪽
            grad = context.createLinearGradient(0, 0, 256, 0);
            break;
        case 1: // 오른쪽에서 왼쪽
            grad = context.createLinearGradient(256, 0, 0, 0);
            break;
        case 2: // 아래에서 위
            grad = context.createLinearGradient(0, 256, 0, 0);
            break;
        case 3: // 위에서 아래
            grad = context.createLinearGradient(0, 0, 0, 256);
            break;
    }

    // 그라데이션에 색상을 추가합니다.
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);

    // 그라데이션을 캔버스에 적용합니다.
    context.fillStyle = grad;
    context.fillRect(0, 0, 256, 256);

    // 텍스처를 생성하고, 이를 평면 오브젝트의 재질에 적용합니다.
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    obj.material.map = texture;
    obj.material.transparent = false;
    obj.material.opacity = 1;
    obj.material.needsUpdate = true;
    return obj;
}
/**
 * 텍스쳐를 제거하는 함수.
 * @param {THREE.Object3D} obj 
 */
function removeGradient(obj) {
    // 텍스쳐 맵을 null로 설정하여 제거
    obj.material.map = null;
    // 투명하게 설정
    obj.material.transparent = true;
    obj.material.opacity = 0;
    // 필요한 경우 재질 업데이트
    obj.material.needsUpdate = true;
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
        this.agent = playField?.agent;
        if (!this.gcModeEnable) setNoteReceptor.call(this, laneIndex);
        const laneBgGeo = new THREE.PlaneGeometry(1, 1);
        laneBgGeo.translate(0, 1 / 2, 0);
        laneBgGeo.scale(0.23, 0.5, 1);
        //const material = new THREE.MeshBasicMaterial();
        const laneBgMat = new THREE.MeshBasicMaterial({
            color: 0xffffff, // 기본 색상을 지정할 수 있습니다. 투명도를 변경하더라도 이 색은 유지됩니다.
            transparent: true, // 투명도 조정을 가능하게 합니다.
            opacity: 0 // 완전히 투명하게 설정합니다.
        });
        this.laneBg = new THREE.Mesh(laneBgGeo, laneBgMat);
        this.laneBg.position.y = -9; // 리시버 기준 맨아레
        this.laneBg.position.z = -5; // 레이어번호

        this.laneBg.name = "laneBg";
        this.laneGroup.add(this.laneBg);
        this.laneGroup.add(this.noteReceptor);
        this.noteQueue = new FastNoteQueue(skin, laneIndex);
        this.laneIndex = laneIndex;
    }
    applyGradient(colorA, colorB) {
        applyGradient(this.laneBg, colorA, colorB, 3);
    }
    checkAndRemove = null; // 초기에는 체크 함수가 없음을 나타냄
    checkStartTime = 0; // 시작 시간 초기화
    reqRemoveGradient = false;
    removeGradient() {
        //agent 가 비어있거나 엔진이 준비되지 않으면 바로 중단
        if (!this.agent || !this.agent.engine || !this.reqRemoveGradient) return;
        this.checkStartTime = this.agent.engine.clock.getElapsedTime(); // 시작 시간 기록
        this.checkAndRemove = () => { // 조건 체크 및 그라데이션 제거 로직
            if (!this.agent || !this.agent.engine) return;
            const currentTime = this.agent.engine.clock.getElapsedTime(); // 현재 시간 업데이트
            if (currentTime - this.checkStartTime >= 0.3) { // 0.3초가 지났는지 확인
                removeGradient(this.laneBg); // 조건 충족 시, 그라데이션 제거 실행
                this.checkStartTime = 0; // 시작 시간 초기화
                this.checkAndRemove = null; // 체크 함수 초기화
                this.reqRemoveGradient = false;
            }
        };
    }

    initScene(scene) {
        scene.add(this.laneGroup);
    }
    // visually change note receptor when player presses input key
    set noteReceptorActive(isActive) {
        this.noteReceptor.material = isActive ? this.skin.noteReceptorActiveMaterial : this.skin.noteReceptorMaterial;

        if (isActive) {
            this.applyGradient("#000000", "#ffffff")
        } else {
            this.reqRemoveGradient = true;
            this.removeGradient()
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

        if (this.checkAndRemove) this.checkAndRemove();
        return hitDelta;
    }
    addNote(startTime, endTime = -1, hitSound) {
        const note = new Note(startTime, this.skin, this.noteQueue, hitSound, this.laneIndex);
        if (endTime >= 0) note.createLn(endTime);
        this.notes.push(note);
        this.laneGroup.add(note.noteGroup);
    }
}