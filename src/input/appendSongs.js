import { songLevelTemp, genLevelListTemplate } from '../game/layouts/main.js';
import { findDifficultyCol } from '../calculate/findDifficultyCol.js';
import EtternaJudgement from '../game/judge/etterna.js';
import { msToTime } from '../utils.js';
import { Beatmap } from '../calculate/classes.mjs';
import { transformSourceName, transformTag } from '../transformInfo.js';

/**
 * 
 * @param {{artist:string,data:Beatmap}} chart 
 * @param {Number} index 
 * @param {Number} groupIndex 
 * @param {String} songTitle
 * @returns {[string,string,string,string[]]}
 */
function chartProcess(chart, index, groupIndex, songTitle) {
    const { starRate } = chart.data.difficulty;
    const [difficulty, color] = findDifficultyCol(starRate);

    let dur = 0;
    let { startTime, endTime } = chart.data.hitObjects.slice(-1)[0];
    dur = msToTime(new EtternaJudgement().missTiming + (startTime ?? endTime));
    return [
        genLevelListTemplate({ songTitle, difficulty, sr: starRate, color, dur, songNum: groupIndex, difficultyNum: index, convertedFrom: chart.data.originalModeStr }),
        chart.artist,
        chart.data.metadata.source,
        chart.data.metadata.tags
    ];
}
export function appendSongs(context) {
    const { charts, imgLoader } = context;
    const totalSourceSet = new Set();
    const totalTagsSet = new Set();

    charts.forEach((beatmapPack, chartGroupIndex) => {

        let lvListTemplates = [];
        const songTitle = beatmapPack[0].data.metadata.titleUnicode;
        const albumCoverUrl = imgLoader.getImage(beatmapPack[0]);
        const bmpArtistGroup = new Set();

        const bmpSourceGroup = new Set();
        const bmpArtistSplitedGroup = new Set();
        const bmpTagGroup = new Set();
        let currentSource = null;
        beatmapPack.forEach((c, i) => {
            try {
                if (c.data.error) throw c.data.error;
                let [lvListTemplate, artist, source, tags] = chartProcess(c, i, chartGroupIndex, songTitle);
                lvListTemplates.push(lvListTemplate);
                if (source) {
                    currentSource = transformSourceName(source)
                    totalSourceSet.add(currentSource); // source를 sourceSet에 추가
                    bmpSourceGroup.add(currentSource);
                } else {
                    bmpSourceGroup.add("UnSorted");
                }
                tags.forEach(tag => {
                    if (!tag || tag == '') return;
                    tag = transformTag(tag);
                    bmpTagGroup.add(tag);
                    totalTagsSet.add(tag)
                }); // 각 태그를 tagsSet에 추가
                transformTag(artist).split(",").map(e => { bmpArtistSplitedGroup.add(e) });
                bmpArtistGroup.add(artist);
            } catch (error) {
                console.log(error);
                lvListTemplates.push(genLevelListTemplate({ songTitle, difficulty: 0, sr: 0, color: "#000", dur: 0, songNum: chartGroupIndex, difficultyNum: i, convertedFrom: null, error }));
                bmpSourceGroup.add("UnSorted");
                // lvListTemplates.push(lvListTemplate);
                // 여기서 오류를 처리하거나 기록할 수 있습니다.
                //console.error(`Processing error for chart index ${i} in chart group index ${chartGroupIndex}:`, error);
                // 이 catch 블록 끝에서 다음 반복으로 넘어갑니다.
                return; // 현재 반복을 건너뛰고 다음 반복으로 넘어갑니다.
            }
        });
        const artistArr = [...bmpArtistGroup];
        console.log(artistArr)
        const artistListTemplates = artistArr.map((artist, index) => `<span class="vocalListItem" id="artist${index}">${artist}</span>`).join(', ');
        $(".songDiffList .carousel-inner").append(songLevelTemp(songTitle,
            artistArr[0],
            artistListTemplates,
            lvListTemplates.join(''),
            albumCoverUrl ?? '',
            [...new Set([...bmpSourceGroup, ...bmpArtistSplitedGroup, ...bmpTagGroup])].map(s => `<span class="song-src">${s}</span>`).join(''),
            chartGroupIndex
        ));
    });

    //console.log(sourceSet)
}