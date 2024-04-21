import gameClient from "./gameClient.js";

export default class ChrAnimator {
    constructor() {
        this.chrWrap = null;
        this.chrElem = null;
        this.isClosed = false; // 눈의 상태
        this.blinkInterval = null;
        this.autoBlinkStart = true;
        this.counterThreadId = null;
        this.skin = null;
        this.client = null;
        this.idleTime = 0;
        /**
         * @type {Object.<string, {action:string[],args:*[]}[]>|null}
        */
        this.dialogueList = null;
    }
    /**
     * @param {String} selector 
     * @param {gameClient} client 
     * @returns {Promise<void>}
     */
    async init(selector, client) {
        this.client = client;
        this.skin = this.client.skin;

        this.chrWrap = $(selector);
        this.chrElem = this.chrWrap.find(".faceWrap");
        if (this.autoBlinkStart) this.startEyeBlinking();
        return await this.initDialogue(this.skin.basePath + 'dialogues.json');
    }
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * 지정된 ID로 케릭터의 표정을 바꿉니다.
     * @param {Number|String} id 표정 ID
     * @returns 
     */
    face(id) {
        this.chrWrap.find(".faceWrap .face").attr('id', `f${id}`);
        return id;
    }

    mouth(id) {
        this.chrWrap.find(".mouthWrap .mouth").attr('id', `m${id}`);
        return id;
    }
    /**
     * 미리 등록된 움직임 에니메이션을 실행합니다.
     * @param {*} id 에니메이션 ID.
     * @param {*} animeSpeed 애니메이션이 몇초안에 실행될건지
     * @param {*} movingVac 에니메이션이 움직이는 크기
     */
    moveChr(id, animeSpeed = 1, movingVac = 50) {
        const classMap = {
            '0': '',
            '1': 'chrMove-up',
            '2': 'chrMove-down',
            '3': 'chrMove-shake',
            '4': 'chrFadeIn',
            '5': 'chrFadeOut'
        };
        const actionClass = classMap[id];

        this.chrElem.attr("style", `--anitime:${animeSpeed}s; --movingVac:${movingVac}px;`);
        if (actionClass === '') {
            this.chrElem.removeClass().addClass("faceWrap");
            this.chrElem.off();
        } else {
            this.chrElem.toggleClass(actionClass);
            this.chrElem.on('animationend', () => this.moveChr(0));
        }
    }
    /**
     * 케릭터의 눈을 깜박인다.
     */
    blinkEyes() {
        if (!this.isClosed) {
            this.chrElem.find(".face").attr('id', 'f2');
            this.isClosed = true;

            setTimeout(() => {
                this.chrElem.find(".face").attr('id', 'f1');
                this.isClosed = false;
            }, 200);
        }
    }
    /**
     * excutes Animation Script
     * @param { {action:string[],args:*[]}[]} script 
     * @returns 
     */
    async executeScript(script) {
        clearInterval(this.blinkInterval);
        for (let i = 0; i < script.length; i++) {
            //console.log('Executing Dialogue:', i);
            const action = (str => {
                const obj = { sleep: this.sleep.bind(this), face: this.face.bind(this), mouth: this.mouth.bind(this), moveChr: this.moveChr.bind(this) };
                return Array.isArray(str) ? str.map(e => obj[e]) : obj[str];
            })(script[i].action);
            const args = script[i].args;

            if (Array.isArray(action)) {
                for (let j = 0; j < action.length; j++) {
                    await action[j](...args[j]);
                }
            } else {
                await action(...args);
            }
        };
        if (this.autoBlinkStart) this.startEyeBlinking();
        return 1;
    }
    async initDialogue(path) {
        this.dialogueList = await (await fetch(path)).json(); //import(path).then(m => m.default);
    }
    startEyeBlinking() {
        this.removeEyeBlinking();
        this.blinkInterval = setInterval(this.blinkEyes.bind(this), 4000);
        return this.blinkInterval;
    }
    removeEyeBlinking() {
        clearInterval(this.blinkInterval);
        this.blinkInterval = null;
    }
};