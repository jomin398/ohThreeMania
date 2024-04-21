import { BeatmapDecoder, BeatmapEncoder } from "../../calculate/parsers.mjs";
import { BeatmapCalculator } from "../../calculate/index.js";
import { ManiaRuleset } from "../../calculate/mania-stable.mjs";
import { ImageLoader } from "../../input/ImageLoader.js";
import { Beatmap } from "../../calculate/classes.mjs";

/**
 * beatmap noteProcess.
 * @version 3
 * @returns {{keys:Number,notes:{lane:Number,hitSound:Number,startTime:Number,endTime:Number?}[]}}
 */
function toChart() {
    /**
     * 롱노트의 시작부터 종료 시간 사이에 있는 노트를 확인하는 함수
     * @param {{lane:Number,hitSound:Number,startTime:Number,endTime:Number?}[]} 
     * @param {Number} anchorLane 기준 Lane 번호
     * @param {Number} anchorStartTime 시작시간기준
     * @param {Number} anchorEndTime 끝나는시간기준
     * @returns {Boolean}
     */
    function isWithinLnRange(notes, anchorLane, anchorStartTime, anchorEndTime) {
        return notes.some(note => {
            // 노트와 주어진 레인이 동일하고, 롱노트(종료 시간이 있는 노트)인지 확인
            if (note.lane !== anchorLane || !note.endTime) return false;

            // 주어진 시간 범위와 롱노트의 시간 범위가 겹치는지 확인
            //시작시간 겹침?
            const startsWithinNote = anchorStartTime >= note.startTime && anchorStartTime <= note.endTime;
            //끝시간 겹침?
            const endsWithinNote = anchorEndTime >= note.startTime && anchorEndTime <= note.endTime;
            //롱노트중간 노트가 있나?
            const noteWithinTimeRange = note.startTime >= anchorStartTime && note.startTime <= anchorEndTime;
            return startsWithinNote || endsWithinNote || noteWithinTimeRange;
        });
    }

    const keys = 4;
    // 노트를 시작 시간, 종료 시간, 레인 순으로 정렬
    this.hitObjects.sort((a, b) =>
        a.startTime - b.startTime || a.endTime - b.endTime || a.lane - b.lane
    );

    let processedNotes = {};

    // 노트 처리 로직
    const notes = this.hitObjects.reduce((accumulatedNotes, currentNote) => {
        const lane = Math.trunc(currentNote.startPosition.x * keys / 512);
        const key = `${lane}-${currentNote.startTime}`;
        const endTime = currentNote.hitType === 128 ? currentNote.endTime : undefined;

        if (!processedNotes[key]) {
            const isNewLongNote = endTime !== undefined;
            const isNoteWithinRange = isWithinLnRange(
                accumulatedNotes, lane, currentNote.startTime, endTime || currentNote.startTime
            );

            if (!isNoteWithinRange) {
                accumulatedNotes.push({
                    lane,
                    hitSound: currentNote.hitSound ?? 0,
                    startTime: currentNote.startTime,
                    endTime: isNewLongNote ? endTime : undefined
                });
                processedNotes[key] = true;
            }
        }

        return accumulatedNotes;
    }, []);

    return { keys, notes };
}


/**
 * Function to determine if the beatmap is for osu! standard or osu!mania and convert accordingly.
 * @param {string} rawBeatmapData - The raw string data of the beatmap to be converted.
 * @param {boolean} shouldParseSb - Whether to parse storyboards.
 * @returns {Promise<{beatmap:Beatmap,rawData:String,converted:Boolean}>} A promise that resolves to the converted beatmap object.
 */
async function convertBeatmap(rawBeatmapData, shouldParseSb = true) {
    /**
     * Custom Error for Warning at Convert.
     */
    class AlreadyManiaMap extends Error {
        constructor() {
            super("it's already osu!mania beatmap");
            this.name = "AlreadyManiaMap";
        }
    }

    const decoder = new BeatmapDecoder();
    // Get beatmap object from the raw string data.
    const parsed = decoder.decodeFromString(rawBeatmapData, shouldParseSb);

    // Check if the beatmap is for osu! standard or osu!mania and convert accordingly.
    if (parsed.mode === 3) {
        // If it's already osu!mania, return the parsed beatmap.
        //console.warn(new AlreadyManiaMap())
        return { beatmap: parsed, rawData: rawBeatmapData, converted: false };
    } else {
        // If it's osu! standard, convert it to osu!mania.
        const maniaBeatmap = new ManiaRuleset().applyToBeatmap(parsed);
        const bce = new BeatmapEncoder();
        rawBeatmapData = bce.encodeToString(maniaBeatmap);
        return { beatmap: maniaBeatmap, rawData: rawBeatmapData, converted: true, originalModeID: parsed.mode };
    }
}

export class NOAUDIOError extends Error {
    constructor() {
        super("No Audio on BeatMap");
        this.name = "NOAUDIOError";
    }
}

/**
 * @async
 * @param {Object} zip JSzip Object 
 * @param {string} k osu file path 
 * @param {ImageLoader} ImgLoader image Loader.
 * @returns {Promise<Beatmap | {
 * difficultyName:string,
 * toChart: ()=>Object,
 * isConverted: boolean,
 * originalModeStr: string
 * }>}
 */
export async function parseOsuFile(zip, k, ImgLoader) {
    const rawOsuFileData = await zip.file(k).async('text');
    const { beatmap: bdres, rawData, converted, originalModeID } = await convertBeatmap(rawOsuFileData, true);

    let { approachRate, overallDifficulty } = bdres.difficulty;
    const bc = new BeatmapCalculator();

    const calculateRes = await bc.calculate({
        fileStr: rawData,
        rulesetId: 3,
        accuracy: [90, 92, 99],
        strains: true,
        approachRate,
        overallDifficulty,
        clockRate: 1,
        totalHits: bdres.hitObjects.length ?? 500,
    });
    if (!Object.keys(zip.files).includes(bdres.general.audioFilename)) throw new NOAUDIOError();
    const difficultyName = calculateRes.beatmapInfo.version || '';
    await ImgLoader.load(zip, bdres);
    //replace japanese comma and dot to utf8 comma.
    const removeJpnSplit = (str) => str.replace(/\・|\・/g, ",").replace(/\uff0c|\u3001/g, ',').replace(/\s{2}/, ' ');

    bdres.metadata.artist = removeJpnSplit(bdres.metadata.artist);
    bdres.metadata._artistUnicode = removeJpnSplit(bdres.metadata._artistUnicode);

    bdres.difficulty['starRate'] = Number(calculateRes.difficulty.starRating.toFixed(2));
    const GameMode = ['standard', 'taiko', 'fruits', 'mania'][originalModeID];
    Object.assign(bdres, {
        difficultyName,
        toChart: toChart,
        isConverted: converted,
        originalModeStr: GameMode
    });

    return bdres;
}