import * as THREE from "three";

export const NoteState = {
    NOT_HIT: 0,
    HIT: 1, // note is fully hit (i.e. single note hit/ln fully held)
    HELD: 2, // ln currently held
    MISSED: 3
}

// export enum HitJudge
// {
//     NOT_HIT,
//     EXCELLENT,
//     MISSED
// }

class MeshQueue {
    queue = [];
    newMesh;

    constructor(newMesh) {
        this.newMesh = newMesh;
    }

    popOrNew(laneIndex = 0) {
        if (this.queue.length > 0) {
            let result = this.queue.pop();
            return result != null ? result : [];
        }
        //console.log('note생성', laneIndex)
        return this.newMesh(laneIndex);
    }

    push(mesh) {
        if (mesh)
            this.queue.push(mesh);
    }
}

export class FastNoteQueue {
    noteMeshQueue;
    lnMeshQueue;
    lnCapQueue;
    laneIndex = 0;
    skin;

    constructor(skin, laneIndex) {
        this.skin = skin;
        this.noteMeshQueue = new MeshQueue((idx) => skin.getNoteMesh(idx));
        this.lnMeshQueue = new MeshQueue(() => skin.lnMesh);
        this.lnCapQueue = new MeshQueue(() => skin.lnCapMesh);
        this.laneIndex = laneIndex;
    }

    getNote(isLn = false) {
        //console.log('note생성')
        const noteMesh = this.noteMeshQueue.popOrNew(this.laneIndex);
        if (!isLn)
            return noteMesh;

        const lnMesh = this.lnMeshQueue.popOrNew();
        const lnCap = this.lnCapQueue.popOrNew();
        return [noteMesh, lnMesh, lnCap];
    }

    releaseNote(noteMesh, lnMesh, lnCap) {
        this.noteMeshQueue.push(noteMesh);
        this.lnMeshQueue.push(lnMesh);
        this.lnCapQueue.push(lnCap);
    }

}

export class Note {
    startTime;
    endTime;

    startHitTime;
    endHitTime;

    state = NoteState.NOT_HIT;

    skin;
    noteQueue;

    mesh; // base note
    lnMesh; // ln body
    lnCap; // end ln (goes after the ln body)

    noteGroup = new THREE.Group(); // groups note, ln body and ln cap
    laneIndex = null;
    constructor(startTime, skin, noteQueue, hitSound, laneIndex) {
        this.skin = skin;
        // this.mesh = skin.noteMesh;
        this.startTime = startTime;

        // this.noteGroup.add(this.mesh);
        this.noteGroup.position.y = 100; // set outside of screen
        this.noteQueue = noteQueue;
        this.hitSound = hitSound ?? 0;
        this.laneIndex = laneIndex;

    }

    set noteVisibility(visible) {
        this.noteGroup.visible = false;
    }

    createLn(endTime) {
        // set to ln visual origin to middle of the note
        this.endTime = endTime;
    }

    getYFromTime(targetTime, time, speed) {
        return (targetTime - time) * speed + this.yOrigin;
    }

    #getMeshes() {
        const r = this.noteQueue.getNote(this.isLn);
        if (!Array.isArray(r)) {
            this.mesh = r;
        }
        else {
            [this.mesh, this.lnMesh, this.lnCap] = r;
            this.lnMesh.position.y = this.skin.noteScale / 2;

            this.noteGroup.add(this.lnMesh);
            this.noteGroup.add(this.lnCap);
        }

        this.noteGroup.add(this.mesh);
    }

    releaseMeshes() {
        this.noteQueue.releaseNote(this.mesh, this.lnMesh, this.lnCap);
    }

    update(time, speed) {
        if (!this.mesh)
            this.#getMeshes();

        const startPos = this.getYFromTime(this.startTime, time, speed);
        this.noteGroup.position.y = startPos;

        if (this.state === NoteState.HIT || (!this.isLn && this.state === NoteState.MISSED))
            this.noteVisibility = false;

        if (this.isLn) {
            const endPos = this.getYFromTime((this.endTime != null ? this.endTime : 0), time, speed);
            const origin = this.yOrigin;
            const lastHit = this.endHitTime && this.getYFromTime(this.endHitTime, time, speed);

            let relativeEnd = endPos - startPos;
            if (origin > startPos) {
                // FIXME: scale down end cap when reach past the point
                // if (origin >= endPos)
                // {
                //     debugger;
                //     this.lnCap!.scale.y = relativeEnd;
                // }
                if (this.state === NoteState.HELD) {
                    relativeEnd = endPos - origin;
                    this.noteGroup.position.y = origin;
                }
                else if (lastHit && lastHit >= startPos) {
                    relativeEnd = endPos - lastHit;
                    this.noteGroup.position.y = lastHit;
                }
            }

            this.lnMesh ? this.lnMesh.scale.y = relativeEnd - this.skin.noteScale / 2 : 0;
            this.lnCap ? this.lnCap.position.y = relativeEnd : 0;

        }
    }

    setState(state, time) {
        if (state === NoteState.HELD)
            if (!this.isLn)
                throw new Error("Regular notes cannot be set to held state");
            else if (time === null)
                throw new Error("Time required when setting non-held states");

        if (state !== NoteState.HELD) {
            if (this.state === NoteState.HELD)
                this.endHitTime = time;
        }

        this.startHitTime ??= time;
        this.state = state;
        return state;
    }

    get isLn() {
        return !!this.endTime;
    }

    get yOrigin() {
        // offset bottom of screen by skin visual offset
        return this.skin.receptorOffset - 1;
    }

    #isLnOnScreen(time, speed) {
        if (!this.isLn)
            return false;
        const y = this.getYFromTime(this.startTime, time, speed);
        const ey = this.getYFromTime((this.endTime != null ? this.endTime : 0), time, speed);
        return ey >= -2 && y <= 1;
    }

    isNoteOnScreen(time, speed) {
        const y = this.getYFromTime(this.startTime, time, speed);
        return this.#isLnOnScreen(time, speed) || ((y >= -2) && y <= 1);
    }

    isAboveScreen(time, speed) {
        return this.getYFromTime(this.startTime, time, speed) > 1;
    }

}