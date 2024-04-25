import { getIsMobile } from "../../utils.js";
import { NOAUDIOError } from "../parser/osu.js";
import { accDebugTemp } from "./accDebugTemp.js";
import { convertedWarn } from "./convertedWarn.js";
import { gameGaugeWrap } from "./gameGaugeWrap.js";
import judgeDispStr from "./judge.js";
import errorStackParser from 'https://cdn.jsdelivr.net/npm/error-stack-parser@2.1.4/+esm';

const selfCrashWarn = `<div class="selfCrashWarn d-none">
  <div class="messageWrap">
    <i class="bi bi-exclamation-triangle-fill"></i>
    <span>경고, 자폭모드 활성됨!</span>
  </div>
  <span class="countDown"></span>
</div>`;

export const canvasStr = `<main class="d-none">
  <audio id="previewMusic"></audio>
  <audio id="music"></audio>
  <div class="renderOverlayWrap">
    <div class="renderOverlay">
      <div class="headerInfo">
        <div class="titleCont">
          <h4 class="songTitle d-flex justify-content-center"></h4>
          <h4 class="songTitleSub"></h4>
        </div>
        <div class="scoreCont">
          <div class="label_score">Score : </div>
          <div class="score">0</div>
        </div>
        <div class="progress songPgn">
          <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
      <div class="statJS"></div>
      ${accDebugTemp}
      <i class="pauseBtn bi bi-pause-circle"></i>
      <div class="comboWrap"></div>
    </div>
  </div>
  <div class="renderCont">
  <button class="btn btn-neon skip d-none" type="button">skip</button>
    ${judgeDispStr}
    ${selfCrashWarn}
    ${gameGaugeWrap}
  </div>
</main>`;

export const fileInputlayout = `
<section class="container fileInput mt-5" data-bs-theme="dark">
  <div class="card">
      <div class="card-body">
          <div id="drop-area" class="border rounded d-flex justify-content-center align-items-center"
              style="height: 200px; cursor: pointer;">
              <div class="text-center">
                  <i class="bi bi-cloud-arrow-up-fill text-primary" style="font-size: 48px;"></i>
                  <p class="mt-3">.zip 또는 .osz 파일을 드레그 해주세요</p>
              </div>
          </div>
          <input type="file" accept=".zip,.osz" id="fileElem" class="d-none" multiple>
          <input class="btn btn-primary onlyMobile" type="button" value="확인">
      </div>
  </div>
</section>`;

export function songLevelTemp(title, artist, vocalList, LvList, coverUrl, songSources, songNo) {
  let dynamicLayout = null;
  let mobModal = '';
  const isMobile = getIsMobile();
  if (isMobile) {
    dynamicLayout = `<div class="selectPreviewWrap d-flex flex-column flex-grow-1">
    <div class="previewLv flex-grow-1 d-flex flex-column"></div>
    <input class="btn btn-neon" type="button" value="난위도 변경">
    </div>`;
    mobModal = `<div class="lvListMob modal fade" id="lvListMob" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-body d-flex flex-column">${LvList}</div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary">렌덤선택</button>
        </div>
      </div>
    </div>
  </div>`;
  } else {
    dynamicLayout = `<div class="levelListWrap d-flex flex-column flex-grow-1">
    <div class="levelList d-flex flex-column flex-grow-1">
      ${LvList}
    </div>
  </div>`;
  }
  return `<div class="carousel-item" id="s_${songNo}">
    <div class="albumCoverWrap d-flex justify-content-center">
      <img class="albumCover-big" src="${coverUrl}">
      <button type="button" class="btn btn-secondary" id="songSourceBtn" data-bs-toggle="modal" data-bs-target="#songSourceWrap_${songNo}" title="태그목록 열기">
        <i class="bi bi-tags"></i>
      </button>
    </div>
    <div class="songInfoWrap d-flex flex-column flex-grow-1">
      <h2 class="songTitle">${title}</h2>
      <p class="albumArtist">${artist}</p>
      <div class="infoBottomWrap d-flex flex-column flex-grow-1">
        <div class="infoBottom d-flex flex-column flex-grow-1">
          <div class="vocalWrap">
            <span class="vocalLabel">VOCAL</span>
            <span class="vocalList">${vocalList}</span>
          </div>
          ${dynamicLayout}
        </div>
      </div>
    </div>
   ${mobModal}

    <div class="songSourceWrap modal fade" id="songSourceWrap_${songNo}" tabindex="-1" aria-labelledby="songSourceWrapLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable modal-fullscreen-xl-down">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="songSourceWrapLabel">테그 목록</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body d-flex flex-wrap align-content-start gap-2" translate="no">
          ${songSources ? songSources : ''}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}
/**
 * @param {{songTitle:string,difficulty:string, sr:number, color:string, dur:number, songNum:number, difficultyNum:number, convertedFrom:string?, error:Error?}} o 
 * @returns {string}
 */
export const genLevelListTemplate = o => {
  let { songTitle, difficulty, sr, color, dur, songNum, difficultyNum, convertedFrom, error } = o;
  if (!error) return `<input type="radio" class="btn-check" name="${songTitle}" id="btn-check-${songNum}_${difficultyNum}" autocomplete="off" ${difficultyNum == 0 ? 'checked' : ''}>
  <label class="btn levelItem text-white" for="btn-check-${songNum}_${difficultyNum}" style="border-color:${color};">
      <div class="innerWrap" style="background-color:${color};">
        <span class="text" translate="no">${difficulty}</span>
        <div>
          <i class="bi bi-hourglass-split"></i>
          <span class="dur">${dur}</span>
        </div>
        <div>
          <i class="bi bi-star-fill"></i>
          <span class="starRate">${sr}</span>
        </div>
        ${convertedFrom ? convertedWarn(convertedFrom) : ''}
      </div>
  </label>`;

  let stackData = errorStackParser.parse(error);
  let msg = '';
  if (error instanceof NOAUDIOError) {
    msg = `노래 파일 분실 (${stackData[0].functionName})`;
  }
  return `<input type="radio" class="btn-check" name="${songTitle}" id="btn-check-${songNum}_${difficultyNum}" autocomplete="off" ${difficultyNum == 0 ? 'checked' : ''}>
  <label class="btn levelItem text-white" for="btn-check-${songNum}_${difficultyNum}" style="border-color:darkred;">
      <div class="innerWrap" style="background-color:${color};">
        <span class="text"><i class="bi bi-exclamation-octagon-fill"></i> ${error.name}</span>
        <div>
        ${msg}
        </div>
      </div>
  </label>`;
};