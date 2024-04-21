import { logo as logoLayout } from "./layouts/logo.js";
import { sleep } from "../utils.js";
import mediaPlayer from "./mediaPlayer.js";
import gameClient from "./gameClient.js";
export const VoiceList = {
  "boot": ["sysVoices/boot_00.mp3", "sysVoices/boot_01.mp3"],
  "logo": ["sysVoices/logo_00.mp3", "sysVoices/logo_01.mp3"],
  "levelSel": "voices/select_02.mp3",
  "difficultySel": "sysVoices/difficulty_00.mp3",
  "songStart": "sysVoices/difficulty_03.mp3"
};
const slidedelays = [500, 500, 1000, 2000, 3000]; // 기존 코드의 대기 시간을 배열로 저장합니다.
async function showLogos(sysVoPath, voicePathList, cvPlayer, devSkip) {
  /**
   * @param {(value: T | PromiseLike<T>) => void} r 
   */
  const skipSlide = (r) => {
    $('#bootingLogos').carousel('dispose');
    $('#bootingLogos').remove();
    r(1);
  }
  return new Promise(async r => {
    if (devSkip) {
      skipSlide(r);
    } else {
      $("#bootingLogos .carousel-inner :nth-child(1)").addClass("active");
      for (let i = 0; i < voicePathList.length; i++) {
        await cvPlayer.init(sysVoPath + voicePathList[i]); // 보이스 파일의 경로를 mediaPlayer 인스턴스에 전달
        // 재생이 끝날 때까지 기다림
        await cvPlayer.play();
        if (i < voicePathList.length - 1) {
          $('#bootingLogos').carousel(i + 1); // 마지막 슬라이드에서는 carousel을 넘기지 않습니다.
        }
        // slidedelays 배열을 활용하여 각 슬라이드 별로 다른 대기 시간을 적용합니다.
        await sleep(slidedelays[i]);
      }
      skipSlide(r);
    }
  })
}

/**
 * @this {gameClient}
 */
export function booting() {
  const that = this;
  return new Promise(async r => {
    // const basePath = skin.basePath;
    console.warn('booting.');
    $(".container").toggleClass("d-none");
    $("body").append(`<audio id="cv"><audio/>`, logoLayout);
    that.cvPlayer = new mediaPlayer('body audio#cv');
    await showLogos("./data/skin/", VoiceList.boot.concat(VoiceList.logo), that.cvPlayer);
    // $(".container").toggleClass("d-none");
    r(1);
  });
}