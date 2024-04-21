import { padNumber, findLatestArtistElm, sleep, getIsMobile } from '../utils.js';
import { updateLvPreview } from './updateLvPreview.js';
import { process } from '../game/parser/process.js';
import gameClient from '../game/gameClient.js';


export async function initCharts(progressManager, uploadFiles, imgLoader) {
    /**
     *  @constant
     * @type {PgMgr} 
    */
    const progressMgr = progressManager;
    const files = uploadFiles;
    //레벨(보면)들 로딩
    const charts = await Promise.all(Array.from(files).map((file, _idx, arr) => process(file, arr, imgLoader, progressMgr)));
    await sleep(1000);
    progressMgr.reset();
    // 각 최상위 배열의 원소에 대해 반복하며 내부 배열을 starRate 기준으로 정렬
    charts.forEach(group => {
        if (!group) return;
        group.sort((a, b) => a.data.difficulty.starRate - b.data.difficulty.starRate);
    });

    return charts;
}
/**
 * @typedef {Object} artworkSetting
 * @prop {string} sizes image size (320x180)
 * @prop {string} src image url
 * @prop {string} type imageFormat
 */

/**
 * 
 * @param {Object} option
 * @param {String} option.title
 * @param {String} option.artist
 * @param {String} option.album
 * @param {artworkSetting[]} option.artwork
 */
function updateGlobalMedia(option) {
    if ('mediaSession' in navigator) navigator.mediaSession.metadata = new MediaMetadata(option);
}

/**
 * 곡이나 난이도 변경시 처리하는 핸들러
 * 
 * @param {Object?} event 이벤트 객체
 * @param {gameClient} client 게임 클라이언트 객체
 * @param {boolean} isDiffChange 난이도 변경 여부
 */
export function songChangeHandler(event, client, isDiffChange) {
    // console.log(isDiffChange ? "diffChange" : "songListChange");
    const { imgLoader, charts } = client;
    client.previewMusic.pause();
    let songSelNum = 0;
    let diffSelNum = 0;
    let thisSongElm = $($('.songDiffList .carousel-item').get(0));
    let idx = 1;
    //난이도 변경
    if (event && event.target && event.target.id.includes("btn-check-")) {
        let s = event.target.id.replace("btn-check-", "").split("_");
        songSelNum = parseInt(s[0]);
        diffSelNum = parseInt(s[1] ?? 0);
        console.log(1)
        findLatestArtistElm(client.selSongNumber, client.selSongDiff, charts)?.classList.toggle('active');
        if (getIsMobile()) {
            Array.from($(event.target).offsetParent().find("label")).forEach(e => { $(e).removeAttr("style") });
        } else {
            //Array.from($(event.target).offsetParent().find("label")).forEach(e => { $(e).find(".innerWrap")[0].style.border = "2px solid transparent"; });
        }

        thisSongElm = $(`.songDiffList .carousel-item#s_${songSelNum}`);
        idx = thisSongElm.index() + 1;
        //client.selSongDiff = parseInt($(event.target).attr("id").replace(`btn-check-${client.selSongNumber}_`, ''));
    }
    //곡 변경
    else if (event && event.to) {
        let s = event.relatedTarget.id.replace("s_", "");
        songSelNum = parseInt(s);
        // songSelNum = event.to;
        thisSongElm = $(event.relatedTarget);
        idx = thisSongElm.index() + 1;
        findLatestArtistElm(client.selSongNumber, client.selSongDiff, charts)?.classList.remove('active');
    } else {
        songSelNum = thisSongElm?.attr('id').replace("s_", "") ?? 0;
        //songSelNum
        //diffSelNum
    }
    // 곡이나 난이도 변경에 따른 새로운 선택 반영
    $("#currentSongNumber").text(padNumber(idx, 3));
    console.log(songSelNum, diffSelNum);
    client.selSongNumber = songSelNum;
    client.selSongDiff = diffSelNum;

    //새로운 곡이나 난이도에 맞는 앨범 커버 및 미리보기 음악 설정
    const albumCoverUrl = imgLoader.getImage(charts[client.selSongNumber][client.selSongDiff]);
    ((songIdx, levelIdx) => {
        let elm = findLatestArtistElm(songIdx, levelIdx, charts);
        if (elm) elm.classList.add('active');
    })(client.selSongNumber, client.selSongDiff);

    (async () => {
        const chartData = charts[client.selSongNumber][client.selSongDiff].data;
        let volume = client.agent?.userConfigs.musicVolume ?? 1;
        if (!chartData.error) {
            await client.previewMusic.init(chartData, charts[client.selSongNumber][client.selSongDiff].zip);
            client.previewMusic.volume(volume);
            client.previewMusic.play();
            const mediaCfg = {
                title: chartData.metadata.titleUnicode,
                artist: chartData.metadata.artistUnicode,
                album: chartData.metadata.source,
            }
            if (albumCoverUrl) mediaCfg.artwork = [{
                src: albumCoverUrl
            }];
            updateGlobalMedia(mediaCfg);
        }
    })();

    // 앨범 커버 및 난이도 미리보기 업데이트
    if (thisSongElm && !isDiffChange) {
        thisSongElm.find('.albumCover-big')[0].src = albumCoverUrl ?? '';
        updateLvPreview.call(thisSongElm.find(`.${getIsMobile() ? 'lvListMob' : 'levelList'} input[type=radio]`)[client.selSongDiff],
            client.selSongNumber);
    } else if (thisSongElm) {
        thisSongElm.find('.albumCover-big')[0].src = albumCoverUrl ?? '';
        updateLvPreview.call(event.target,
            client.selSongNumber);
    }
}
