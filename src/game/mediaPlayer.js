import { Beatmap } from "../calculate/classes.mjs";

export default class mediaPlayer {
    constructor(selector, isPreview = false) {
        this.sel = selector;
        this.isPreview = isPreview;
        this.chart = null;
        this.zip = null;
        this.elm = null;
        this.isLooping = false;
        this.loopTimeoutID = null; // setTimeout의 타이머 ID를 저장할 속성 추가
        this.previewDuration = 30000; // 추가: 프리뷰 재생 시간을 밀리초 단위로 설정 (예: 30초)
    }

    get audioElm() {
        return this.elm ? this.elm.get(0) : null;
    }

    async init(c, z) {
        if (this.elm) this.removeEndedListener();
        this.elm = $(this.sel);
        this.isLooping = false;
        // 곡이 변경될 때 기존의 setTimeout을 중단합니다.
        if (this.loopTimeoutID) {
            clearTimeout(this.loopTimeoutID);
            this.loopTimeoutID = null; // 타이머 ID를 리셋합니다.
        }
        if (typeof c === 'string') {
            this.audioElm.src = c;
        } else if (c instanceof Beatmap && z !== undefined) {
            this.chart = c;
            this.zip = z;
            const audioFilename = this.chart.general.audioFilename;
            const blobUrl = URL.createObjectURL(await this.zip.file(audioFilename).async('blob'));
            this.audioElm.src = blobUrl;
        } else {
            throw new Error('Invalid arguments passed to init');
        }
        this.audioElm.load();
        await new Promise(resolve => this.elm.ready(() => resolve(1)));
        return 1;
    }

    get previewStartTime() {
        if (!this.chart) return 0;
        return Math.max(this.chart.general.previewTime / 1000, 0);
    }

    // async play() {
    //     return new Promise((resolve, reject) => {
    //         if (this.isPreview) {
    //             this.audioElm.currentTime = this.previewStartTime;
    //             if (!this.isLooping) {
    //                 this.elm.one('ended', () => {
    //                     this.#loopPreview();
    //                     resolve();
    //                 });
    //                 this.isLooping = true;
    //             }
    //         }

    //         else {
    //             this.elm.one('ended', resolve);
    //         }
    //         this.audioElm.play().catch(error => reject(new Error("Playback failed", error)));
    //     });
    // }
    async play() {
        return new Promise((resolve, reject) => {
            if (this.isPreview) {
                this.audioElm.currentTime = this.previewStartTime;
                if (!this.isLooping) {
                    this.#loopPreview(); // 변경: 이벤트 리스너 대신 바로 loopPreview 호출
                    resolve();
                    this.isLooping = true;
                }
            }
            else {
                this.elm.one('ended', resolve);
            }
            this.audioElm.play().catch(error => reject(new Error("Playback failed", error)));
        });
    }
    // #loopPreview() {
    //     if (this.isPreview) {
    //         this.audioElm.currentTime = this.previewStartTime;
    //         this.startPlayback();
    //         this.removeEndedListener();
    //         this.elm.on('ended', this.#loopPreview.bind(this));
    //     } else {
    //         this.removeEndedListener();
    //         this.isLooping = false;
    //     }
    // }
    #loopPreview() {
        if (this.isPreview) {
            this.audioElm.currentTime = this.previewStartTime;
            this.startPlayback();
            this.removeEndedListener();
            // 변경: 지정된 시간(여기서는 10초) 후에 #loopPreview를 다시 호출하도록 setTimeout 사용
            this.loopTimeoutID = setTimeout(() => this.#loopPreview(), this.previewDuration);
        } else {
            this.removeEndedListener();
            this.isLooping = false;
            if (this.loopTimeoutID) {
                clearTimeout(this.loopTimeoutID);
                this.loopTimeoutID = null;
            }
        }
    }

    startPlayback() {
        this.audioElm.play().catch(error => console.error("Playback failed", error));
    }

    removeEndedListener() {
        this.elm.off('ended');
    }

    pause = () => {
        if (this.audioElm) this.audioElm.pause();
    }

    volume = v => this.audioElm.volume = v;

    seek(sec) {
        this.audioElm.currentTime = sec ? sec / 1000 : 0;
        return this.audioElm.currentTime * 1000;
    }

    stop() {
        this.audioElm.pause();
        this.audioElm.currentTime = 0;
        if (this.isLooping) {
            this.removeEndedListener();
            this.isLooping = false;
        }
    }
}
