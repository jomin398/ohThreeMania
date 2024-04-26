import mediaPlayer from "../game/mediaPlayer.js";
import gameClient from "../game/gameClient.js";
import showLogos from "./showLogos.js";
export const VoiceList = {
  "levelSel": "voices/select_02.mp3",
  "difficultySel": "sysVoices/difficulty_00.mp3",
  "songStart": "sysVoices/difficulty_03.mp3"
};

/**
 * @this {gameClient}
 */
export default function booting() {
  const that = this;
  return new Promise(async r => {
    console.warn('booting.');
    $(".container").toggleClass("d-none");
    $("body").append(`<audio id="cv"><audio/>`);
    that.cvPlayer = new mediaPlayer('body audio#cv');
    await showLogos(that.skin.basePath, that.cvPlayer);
    r(1);
  });
}