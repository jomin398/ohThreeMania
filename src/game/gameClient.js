import { findLatestArtistElm, padNumber } from "../utils.js";
import { canvasStr } from "./layouts/main.js";
import { filePage, fileInputInit } from "../input/filepage.min.js";
import Skin from "./skin.js";
import booting from "../boot/index.js";
import { titleScreen } from "./titleScreen.js";
import { initCharts, songChangeHandler } from '../input/level.js';
import { ProgressManager } from "./progressManager.js";
import { default as PGLayout } from "./layouts/pgLayout.js";
import ChrAnimator from "./chrAnimator.js";
import settingMenu from "./layouts/settingMenu.js";
import ImageLoader from "../input/imageloader.min.js";
import { appendSongs } from "../input/appendSongs.js";
import { body as songlevelbody } from "./layouts/levelDisp.js";
import gameAgent from "./agent.js";
import setRangeTooltip from "../input/setRangeTooltip.min.js";
import mediaPlayer from "./mediaPlayer.js";
import KeyboardInput from "../input/keyboard.js";
import BSToastManager from "../bsToastManager.min.js";
import fullScreenMgr from "./fullScreenMgr.min.js";
import SearchEngine from "../input/SearchEngine.js";

export default class gameClient {
    constructor() {
        this.uploadFiles = null;
        this.skin = new Skin();
        this.imgLoader = new ImageLoader();
        this.keyInputMgr = new KeyboardInput();
        this.agent = null;
        this.charts = null;
        this.chrMgr = new ChrAnimator();
        this.searchEngine = new SearchEngine();
        this.searchEngine.selectDefaultSong = () => this.selectDefaultSong();
        this.fScreenMgr = new fullScreenMgr();
        this.selSongNumber = 0;
        this.selSongDiff = 0;
        this.previewMusic = new mediaPlayer("main audio#previewMusic", true);
        this.cvPlayer = null;
        this.info = navigator;
        this.progressManager = null;
        this.toastMgr = null;
        this.#init();
    }
    //mobile 이면 true.
    get isMob() {
        return this.info.userAgentData.mobile;
    }
    async retry() {
        if (this.agent?.engine) {
            this.agent.engine.quit();
        }
        this.agent = new gameAgent(this);
        this.agent.selSongNumber = this.selSongNumber;
        this.agent.selSongDiff = this.selSongDiff;
        this.agent.isRetryed = true;
        await this.agent.main();
    }
    async gotoSongMenu() {
        if (this.agent?.engine) {
            this.agent.engine.selfCrash.hide();
            console.log('removed Esc Lisnner')
            this.keyInputMgr.removeKeyListener("gotoSetting");
            this.keyInputMgr.removeKeyListener("pauseMenu");
            this.agent.engine.quit();
            this.agent.engine = null;
        };
        if (this.isMob) this.fScreenMgr.exit();
        this.previewMusic.isPreview = true;
        this.searchEngine.onSongSelect();
        let lastElm = findLatestArtistElm(this.selSongNumber, this.selSongDiff, this.charts);
        if (lastElm) lastElm.classList.remove('active');
        this.agent = new gameAgent(this);
        await this.agent.main();
    }
    #showSonglist(chartLength) {
        $("#totalSongNumber").text(padNumber(chartLength, 3));
        $(".songDiffList .carousel-inner .carousel-item:nth-child(1)").addClass("active");

        //곡, 난이도 변경 감지 함수 등록.
        this.#initSongChangeListener();
    }
    #initSongChangeListener() {
        let selectElm = $(".songDiffList");
        selectElm.on('click', '.carousel-control-prev', () => selectElm.carousel("prev"));
        selectElm.on('click', '.carousel-control-next', () => selectElm.carousel("next"));
        // //곡 변경 (슬라이드)
        selectElm.on('slid.bs.carousel', ev => songChangeHandler(ev, this));

        // //곡, 난위도 선택됨.

        $(".songDiffListWrap footer button#lastScore").on("click", () => {
            this.agent.result?.show();
        });

        $(".songDiffListWrap footer button#startBtn").on("click", () => {
            this.agent.onSongStart(this.selSongNumber, this.selSongDiff);
        });

        $('.settingMenu input[type=range]').each((_i, e) => setRangeTooltip.call(e));
    }
    selectDefaultSong() {
        //난위도 변경 
        if (this.isMob) {
            $(".lvListMob").off('change');
            $(".selectPreviewWrap input.btn").off("click");
            $(".lvListMob").on('change', 'input[type=radio]', ev => songChangeHandler(ev, this, true));
            $(".selectPreviewWrap input.btn").on("click", function () {
                $(this).offsetParent().find(".lvListMob").modal("show");
            });
        } else {
            $('.levelList').off('change');
            $('.levelList').on('change', 'input[type=radio]', ev => songChangeHandler(ev, this, true));
        }
        songChangeHandler(null, this);
    }
    async main() {
        await titleScreen.call(this, this.skin);
        /** @type {ProgressManager} */
        this.progressManager = new ProgressManager("body .container.progressWrap");

  
        console.log("upload comp");
        $(".container.fileInput").addClass("d-none");
        this.progressManager.progressWrap.toggleClass("d-none");
        this.charts = await initCharts(this);
        $("body").append(songlevelbody);
        //케릭터 초기화.
        await this.chrMgr.init(".chrImage", this);

        appendSongs(this);
        this.searchEngine.init();
        this.#showSonglist(this.charts.length);
        this.gotoSongMenu();
    }
    async #init() {

        return await fileInputInit
            .then(() => filePage.uploaded)
            .then(async (uploadData) => {
                this.uploadFiles = uploadData;
                await this.skin.init();
                await booting.call(this); //show Logos;
                $("body").append(PGLayout, settingMenu, canvasStr);
                this.toastMgr = new BSToastManager();
                if (this.isMob) this.fScreenMgr.set().catch(() => { this.toastMgr.showToast("요청 실패", "전체화면 요청", -1) });
                this.keyInputMgr.toastManager = this.toastMgr;

                this.keyInputMgr.init();

                window.Client = this;
                return 1;
            })
            .then(this.main.bind(this));
    }
}
