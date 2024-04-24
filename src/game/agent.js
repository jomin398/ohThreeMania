import { getFileExt, pgnBarUpdate } from "../utils.js";
import { GameEngine } from "./engine.js";
import EtternaJudgement from "./judge/etterna.js";
import { Scoreboard, setUiState } from "./scBoard.js";
import Playfield from "./playfield.js";
import { VoiceList } from "./booting.js";
import { Howl } from "howler";
import gameClient from "./gameClient.js";
import { ResultScreen } from "./layouts/resultScreen.js";
import { gcScoreRanges } from "./judge/playRank.js";

export default class gameAgent {
    /**
     * @param {gameClient} sup 
     */
    constructor(sup) {
        this.client = sup;
        this.uploadFiles = this.client.uploadFiles;
        this.progressManager = this.client.progressManager;
        this.imgLoader = this.client.imgLoader;
        this.skin = this.client.skin;
        this.keyInputMgr = this.client.keyInputMgr;
        this.chrMgr = this.client.chrMgr;
        this.charts = this.client.charts;
        this.previewMusic = sup.previewMusic;
        this.chart = null;
        this.selSongNumber = 0;
        this.selSongDiff = 0;
        this.field = null;
        this.engine = null;
        this.result = new ResultScreen();
        this.isRetryed = false;
        this.scoreRanges = gcScoreRanges;
    }
    userConfigs = {
        keyBinds: [],
        countdownCheck: true,
        noteJudgmentCheck: true,
        skilVoiceMute: true,
        giveUP: true,
        lanePosAuto: true,
        musicVolume: 1,
        voiceVolume: 1,
        playSfx: false,
        sfxVolume: 0.3,
        lanePosL1: 0.35,
        lanePosL2: 0.1,
        lanePosR1: 0.1,
        lanePosR1: 0.35,
        fastLate: true,
        fastLateMS: true,
        selfCrash: true,
        autoPlay: false,
        view3d: false
    }
    #baseSpeed = .0035; //.0015;
    #settingScreen = {
        popuped: false,
        toggle: () => {
            if (this.#settingScreen.popuped) return;
            if ($("main.d-none").length != 1) return; //게임 창이 열려있으면 작동불가.
            console.warn("설정매뉴 팝업");
            $('.settingMenu').modal('show');
            $('.settingMenu').on('hidden.bs.modal', () => {
                this.#settingScreen.popuped = false;
                this.#settingScreen.update();
            })
            this.#settingScreen.popuped = true;
        },
        update: () => {
            Array.from($('.settingMenu input,.songDiffListWrap footer input')).map(e => {
                if (e.type == 'checkbox') this.userConfigs[e.id] = e.checked;
                else if (e.type == 'range' || e.type == 'number') this.userConfigs[e.id] = parseFloat(e.value);
                else this.userConfigs[e.id] = e.value;
            });
        }
    }
    #zip = null;
    #calculateMeshCoordinates(meshCount) {
        const start = -0.35;
        const end = 0.35;
        const interval = (end - start) / (meshCount - 1);
        const coordinates = [];
        for (let i = 0; i < meshCount; i++) {
            const x = start + interval * i;
            coordinates.push(x);
        }
        return coordinates;
    }
    render(delta) {
        // 게임이 끝났으면 렌더링 중단
        if (this.field.isFinished) {
            this.engine.showSkip();
            return;
        }
        // console.log(field.lanes[0].notes[0].state);
        this.field.update(delta, this.keyInputMgr.getPressedKeys());
    }
    async #regGameEngine() {
        if (this.userConfigs.view3d) {
            $(".renderCont").addClass("view3d")
        }
        $(".renderOverlay .songTitle").text(this.chart.metadata.titleUnicode);
        $(".renderOverlay .songTitleSub").text(this.chart.metadata.titleUnicode);
        this.skin.playSfx = this.userConfigs.playSfx;
        this.engine = new GameEngine(this);
        this.engine.keyInputMgr = this.keyInputMgr;
        this.engine.audioLeadIn = this.chart.general.audioLeadIn ?? 0;
        this.engine.onSongTimeUpt = p => pgnBarUpdate({ selector: ".songPgn .progress-bar", ps: p });
        this.engine.bpm = Math.trunc(this.chart.bpm);
        this.engine.firstBeatTIme = this.chart.hitObjects[0].startTime ?? 0;
        this.engine.countdownSpeed = this.chart.general.countdown;
        this.engine.countdownOffset = this.chart.general.countdownOffset ?? 0;
        this.field.initScene(this.engine.scene);

        //set Lane Postions
        const laneCont = this.field.lanes.length;
        const postions = this.#calculateMeshCoordinates(laneCont);
        (this.userConfigs.lanePosAuto ? postions : [
            this.userConfigs.lanePosL1 * -1,
            this.userConfigs.lanePosL2 * -1,
            this.userConfigs.lanePosR1,
            this.userConfigs.lanePosR1
        ]).map((xpos, i) => this.field.lanes[i].laneGroup.position.x = xpos);

        console.log('song loading done.')
        this.engine.init();
    }
    async #registAudios() {
        this.client.previewMusic.stop();
        this.client.previewMusic.isPreview = false;

        // this.audio = new mediaPlayer("main audio#previewMusic");
        await this.client.previewMusic.init(this.chart, this.#zip);
        //load Sfxs from chartData.
        await (async () => {
            const audios = Object.keys(this.#zip.files).filter(k => (k.endsWith('.wav') || k.endsWith('.mp3') || k.endsWith('.ogg')));
            audios.forEach(async relativePath => {
                let n = relativePath.toLowerCase();
                if (n.includes("normal") || n.includes("whistle") || n.includes("finish") || n.includes("clap")) {
                    const blobUrl = [URL.createObjectURL(await this.#zip.file(relativePath).async('blob'))];
                    let sName = n.includes("clap") ? "clap" : n.includes("finish") ? "finish" : n.includes("whistle") ? "whistle" : "normal";
                    this.skin.sfxs[sName] = new Howl({
                        src: blobUrl,
                        format: [getFileExt(n)],
                        volume: this.userConfigs.sfxVolume
                    });
                }
            });
        })();
        //load Break Sfxs from Skin.
        (p => {
            this.skin.sfxs["break"] = new Howl({
                src: p,
                format: [getFileExt(p)],
                volume: this.userConfigs.sfxVolume
            });
        })(this.skin.basePath + this.skin.parser.General.Break);
    };
    get scores() {
        return this.field.scoreboard;
    }
    async onReseted() {
        $(".settingMenu  input#musicVolume").on('input', ev => {
            this.userConfigs.musicVolume = parseFloat($(ev.target).val());
            if (this.previewMusic) this.previewMusic.volume(this.userConfigs.musicVolume);
        })
        await this.client.cvPlayer.init(this.skin.basePath + VoiceList.levelSel);
        this.client.cvPlayer.play();
        this.chrMgr.executeScript(this.chrMgr.dialogueList.select);
        this.client.selectDefaultSong();
    }
    escPressed = null;
    async main() {
        this.engine = null;
        this.keyInputMgr.addKeyListener("gotoSetting", (e) => {
            if (e.key != "Escape") return;
            if (e.key == "Escape" && e.type === "keydown") {
                if (!this.engine) this.#settingScreen.toggle();
            }
        });
        if (this.client.isMob) $(".songSelectWrap .settingBtn").toggleClass("d-none");
        $(".songSelectWrap .settingBtn").on('click', () => this.#settingScreen.toggle());
        $(".renderOverlay .pauseBtn").on('click', () => this.engine.pauseMenu.popup());
        if ($(".renderCont canvas").length) $(".renderCont canvas").remove();

        if (!this.isRetryed) {
            //hide game.
            $("main").addClass("d-none");
            //show song menu.
            $(".songSelectWrap").removeClass("d-none");
            await this.onReseted();
        } else {
            if (this.previewMusic) this.previewMusic.pause();
            // 다른곡 이 로딩....?

            this.#zip = this.charts[this.selSongNumber][this.selSongDiff].zip;
            this.#gameStart();
        }
    }

    #songLoading() {
        console.log(this.selSongNumber, this.selSongDiff)
        this.chart = this.charts[this.selSongNumber][this.selSongDiff].data;
        const chartData = this.chart.toChart();
        return {
            laneCont: chartData.keys,
            data: chartData
        }
    }
    #setField() {
        const scBoard = new Scoreboard(setUiState, this);
        // scBoard.maxNotes = this.chart.hitObjects.length;
        this.field = new Playfield(this, this.#baseSpeed, new EtternaJudgement(4), scBoard);
        this.field.autoPlay = this.userConfigs.autoPlay;

    }
    async #setSkin(laneCont) {
        this.skin.laneSkinKey = laneCont;
        this.field.skin = await this.skin.applyNoteSkin();
        //this.#field.setNoteQueue();
    }
    async #gameStart() {
        console.log("songLoading...")
        $("main").toggleClass('d-none');
        $(".renderCont").append(`<canvas style="position: absolute"></canvas>`);
        this.canvas = $(".renderCont canvas")[0];

        this.keyInputMgr.addGameKeys();
        const {
            data,
            laneCont
        } = this.#songLoading();

        this.#settingScreen.update();
        this.#setField();
        await this.#registAudios();
        await this.#setSkin(laneCont);
        this.field.loadChart(data);
        await this.#regGameEngine();
    }
    #resetSelectMenu() {
        $(".songDiffList  .carousel-item.active").removeClass("active")
        $(".songDiffList .carousel-inner .carousel-item:nth-child(1)").addClass("active");
        $(".songSelectWrap").toggleClass("d-none");
    }
    async onSongStart(songIndex, diffIndex) {
        this.selSongNumber = songIndex;
        this.selSongDiff = diffIndex;
        if (this.previewMusic) this.previewMusic.pause();
        if (this.charts[this.selSongNumber][this.selSongDiff].data.error) {
            this.client.toastMgr.showToast("선택한 곡에 오류가 있어 불가능 합니다.", null, -1)
            return;
        }
        this.#zip = this.charts[this.selSongNumber][this.selSongDiff].zip;


        this.chrMgr.executeScript(this.chrMgr.dialogueList.levelStart);
        await this.client.cvPlayer.init("./data/skin/" + VoiceList.songStart);
        await this.client.cvPlayer.play();
        this.chrMgr.removeEyeBlinking();
        this.#resetSelectMenu(this.isRetryed);
        // return true;
        this.#gameStart();
    }
}