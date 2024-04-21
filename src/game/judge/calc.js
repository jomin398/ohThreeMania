import { NoteState } from "../note.js";
import { HitJudge } from "./judgement.js";

export function handleNoteJudge(n, time, isLaneActive, judgement, lastActiveState, isAutoPlay) {
    const [judge, offset] = judgement.getJudge(time, n.startTime);
    const laneStateHasChanged = lastActiveState !== isLaneActive;
    if (laneStateHasChanged && judge !== HitJudge.NOT_HIT && isLaneActive) {
        //console.log("normal note hit");
        // player pressed key and triggers miss judgement
        return [n.setState(judge === HitJudge.MISS ? NoteState.MISSED : NoteState.HIT, time), time - n.startTime, offset];
    }
    return null;
}
// default stepmania judge system for now. can implement release judge
export function handleLongNoteJudge(n, time, isLaneActive, judgement, lastActiveState, isAutoPlay) {
    const [judge, offset] = judgement.getJudge(time, n.startTime);
    // ln is being held past starting timing
    if (isLaneActive && n.state === NoteState.HELD && time >= (n.endTime != null ? n.endTime : 0)) {
        // auto count hit once past end point 
        //console.log("holding ln");
        return [n.setState(NoteState.HIT, time), ((n.startHitTime != null ? n.startHitTime : 0) - n.startTime), offset];
    }
    const laneStateHasChanged = lastActiveState !== isLaneActive;
    if (laneStateHasChanged) {
        // ln press
        if (isLaneActive) {
            //console.log("ln hit");
            return [n.setState(judge === HitJudge.MISS ? NoteState.MISSED : NoteState.HELD, time), time - n.startTime, offset];
        } else {
            // ln release
            // const endJudge = n.checkHit(time, true);
            //console.log("ln release")
            // release while ln was held and get release judgement
            if (n.state === NoteState.HELD) {
                // n.state = endJudge === HitJudge.MISSED ? NoteState.MISSED : NoteState.HIT;
                let noteEndTime = n.endTime != null ? n.endTime : 0;
                if (noteEndTime - time <= 200) {
                    let startHitTime = n.startHitTime != null ? n.startHitTime : 0;
                    if (!isAutoPlay) console.log("ln released No miss", startHitTime, noteEndTime, n.startTime);
                    return [n.setState(NoteState.HIT, time), startHitTime - n.startTime, 0];
                } else {
                    return [n.setState(NoteState.MISSED, time), judgement.missTiming, offset];
                }
                // return n.setState(n.endTime! - time <= 200 ? NoteState.HIT : NoteState.MISSED, time);
            }
        }
    }
    return null;
}

export const ckNoteExpired = (n, judge, time) => n.state !== NoteState.HELD && judge === HitJudge.MISS && time > n.startTime;