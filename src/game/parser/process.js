import { Beatmap } from '../../calculate/classes.mjs';
import { ManiaBeatmap } from '../../calculate/mania-stable.mjs';
import { ProgressManager } from "./progressManager.js";
import { parseOsuFile } from './osu.js';
import JSZip from 'jszip';
async function parseZipFile(zipFile) {
    let zip = new JSZip();
    await zip.loadAsync(zipFile);
    return zip;
}
/**
* process the osu files in .osz(.zip) file.
* @param {Object} zipFile
* @param {File[]} array 
* @param {ImageLoader} ImgLoader 
* @param {ProgressManager} progressMgr 
* @returns {{zip:Object,data:ManiaBeatmap,artist:String}[]}
*/
export async function process(zipFile, array, ImgLoader, progressMgr) {
    const update = (partProccedNum, partListLength, titleUnicode, totalProgress) => progressMgr.updateProgress(partProccedNum, partListLength, titleUnicode, totalProgress);
    const zip = await parseZipFile(zipFile);
    let partProccedNum = 0;
    let totalProgress = 0;
    // const osuFilePromises = Object.keys(zip.files).filter(key => key.endsWith('.osu')).map(async (k, _idx, list) => {
    //     const o = await parseOsuFile(zip, k, ImgLoader);
    //     partProccedNum++;
    //     update(partProccedNum, list.length, o.metadata.titleUnicode, totalProgress, o.metadata.version);
    //     return {
    //         zip,
    //         data: o,
    //         artist: o.metadata.artistUnicode
    //     };
    // });
    const osuFilePromises = Object.keys(zip.files).filter(key => key.endsWith('.osu')).map(async (k, _idx, list) => {
        try {
            const o = await parseOsuFile(zip, k, ImgLoader).catch(e => {
                throw e;
            });
            partProccedNum++;
            update(partProccedNum, list.length, o.metadata.titleUnicode, totalProgress, o.metadata.version);
            return {
                zip,
                data: o,
                artist: o.metadata.artistUnicode
            };
        } catch (error) {
            // console.error(`Error parsing .osu file: ${k}`, error);
            let data = new Beatmap();
            data.difficulty.starRate = 0;
            data.metadata.titleUnicode = k;
            data.error = error;
            return {
                zip,
                data,
            };
        }
    });

    const parsedData = (await Promise.all(osuFilePromises)).filter(Boolean);
    progressMgr.processedCount++;
    totalProgress = progressMgr.processedCount / array.length;
    if (!parsedData[0].error)
        update(null, null, parsedData[0].data.metadata.titleUnicode, totalProgress);

    return parsedData;
}