import { GameEngine } from "../engine.js";

export default class PauseMenu {
    /**
     * @param {GameEngine} engine 
     */
    constructor(engine) {
        this.elem = null;
        this.popuped = false;
        this.client = engine.client;
        this.engine = engine;

        this.#init();
        return this;
    }
    #temp = `<section class="pauseModal modal fade" id="pauseModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="pauseModalTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-fullscreen">
            <div class="modal-content">
                <div class="modal-header d-flex justify-content-between">
                    <h3 class="modal-title" id="pauseModalTitle">Game Paused</h3>
                </div>
                <div class="modal-body d-flex flex-column justify-content-center gap-4 p-4">
                    <button type="button" class="btn btn-success" id="continue">Countinue</button>
                    <button type="button" class="btn btn-warning" id="retry">Retry</button>
                    <button type="button" class="btn btn-danger" id="quit">Quit to Mein Menu</button>
                    <button type="button" class="btn btn-danger d-none" id="skipToResult">Show Result</button>
                </div>
            </div>
        </div>
    </section>`;

    #init() {
        if ($('body .pauseModal').length == 0) $('body').append(this.#temp);
        if(this.engine.client.skin.isDebugMode)  $('.pauseModal .btn#skipToResult').removeClass("d-none");
        this.elem = $('.pauseModal');
        $('.pauseModal .btn#continue').on("click", () => {
            this.elem.modal('hide');
            this.popuped = false;
            this.engine.resume(this.engine.musicPlayer.audioElm.currentTime);
        });
        $('.pauseModal .btn#skipToResult').on("click", () => {
            this.elem.modal('hide');
            this.popuped = false;
            this.engine.resume(this.engine.musicPlayer.audioElm.currentTime);
            this.engine.goToResult();
        });
        $(".pauseModal .btn#retry").on("click", () => {
            this.elem.modal('hide');
            this.popuped = false;
            $("main").toggleClass("d-none");
            this.client.retry();
        });
        $('.pauseModal .btn#quit').on("click", () => {
            this.elem.modal('hide');
            this.popuped = false;
            this.client.gotoSongMenu();
        });
    }
    popup() {
        if (!this.elem) return;
        if (this.popuped) return;
        if ($("main.d-none").length != 0) return; //게임화면이 아닐때 실행 중지.
        this.popuped = true;
        this.engine.quit();
        this.engine.keyInputMgr.stopKeyPressDetection();
        //TODO: Crash 인경우 continue 숨기기.
        if (this.engine.selfCrash.isCrashed) {
            $(".pauseModal .btn#continue").attr("disabled", true);
        }
        // console.log(this.game.selfCrash.isCrashed);
        this.elem.modal('show');
        console.warn("게임 일시정지");
    }
};