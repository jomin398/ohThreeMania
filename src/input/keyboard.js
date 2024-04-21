import KeySettingManager from "./keySettingManager.js";

export default class KeyboardInput extends KeySettingManager {
    constructor() {
        super();
        this.keyState = {}; // esc = Escape
        /**
         * @type {Object<string,function(ev:KeyboardEvent):void>}
         */
        this.keyEventlisteners = {};
        /**
        * 반응할 키보드 키 목록
        * @type {string[]}
        */
        this.keyBindings = ["z", "x", ",", "."];
        this.laneClear = null;
        this.isMobile = navigator.userAgentData && navigator.userAgentData.mobile;
        this.resolveFn = () => {
            const k = Object.values(this.keySetting);
            this.keyBindings = k;
        };
    }




    /**
     * @param {string} key 눌린 키보드 키 
     * @returns {Boolean} 
     */
    isPressed(key) {
        return this.keyState[key] ?? false;
    }

    /**
     * registing Key Board Event Listener with key
     * @param {string} key 
     * @param {function(KeyboardEvent):void} listener 
     */
    addKeyListener(key, listener) {
        if (typeof listener === 'function') {
            this.keyEventlisteners[key] = listener;
        } else {
            console.error("keyEventlisteners에는 함수만 등록할 수 있습니다.");
        }
    }

    /**
    * remove Key Board Event Listener with key
    * @param {string} key 
    */
    removeKeyListener(key) {
        if (this.keyEventlisteners[key]) delete this.keyEventlisteners[key];
    }
    /**
     * execute registed Key Board Event Listeners
     * @param {KeyboardEvent} event 
     */
    executeKeyEventListeners(event) {
        Object.values(this.keyEventlisteners).forEach(listener => listener(event));
    }
    init() {
        this.registSettingEdit();
        if (!this.isMobile) {
            window.addEventListener("keydown", e => {
                this.keyState[e.key] = true;
                this.executeKeyEventListeners(e);
            });
            window.addEventListener("keyup", e => {
                this.keyState[e.key] = false;
                this.executeKeyEventListeners(e);
                if (this.laneClear && this.keyBindings.some(key => key == e.key)) this.laneClear(e.key);
            });
            return;
        }
    }
    addGameKeys() {
        //모바일이 아닐경우 바이페스.
        if (!this.isMobile) return;
        // 터치 이벤트에 대응하는 부분 추가
        const renderContElement = document.querySelector(".renderCont");

        // .touchWrap 요소 생성
        const touchWrapElement = document.createElement("div");
        touchWrapElement.classList.add("touchWrap");
        renderContElement.appendChild(touchWrapElement);
        this.keyBindings.forEach((button, idx) => {
            const buttonElement = document.createElement("div");
            buttonElement.className = "touchBtn";
            touchWrapElement.appendChild(buttonElement);

            buttonElement.addEventListener("touchstart", () => {
                this.keyState[button] = true;
            });

            buttonElement.addEventListener("touchend", () => {
                this.keyState[button] = false;
                if (this.laneClear) this.laneClear(idx)
            });
        });
    }
    getPressedKeys() {
        // keyBindings 배열을 순회하며 각 키가 눌렸는지 확인
        return this.keyBindings.map(key => this.isPressed(key));
    }
    get isAnyKeyPressed() {
        return this.keyBindings.some(key => this.isPressed(key));
    }
    /** @type {Boolean} 감지상태 저장 */
    #isDetectionOn = false;
    /** @type {Number?} requestAnimationFrame 호출 ID를 저장하기 위한 변수 */
    #animationFrameId = null;
    //제한시간 키 눌림 감지 시스템
    startKeyPressDetection(onDetected, onNotDetected, timeout = 5000, countdownCallBack) {
        if (this.#isDetectionOn) return; // 이미 감지 중이면 반환
        this.#isDetectionOn = true;

        let countdown = timeout / 1000; // 초 단위로 카운트다운 초기화
        const detectionStartTime = Date.now();

        const updateCountdown = (callBack) => {
            const elapsed = Date.now() - detectionStartTime;
            const remaining = timeout - elapsed;
            const newCountdown = Math.ceil(remaining / 1000);

            if (newCountdown < countdown) {
                countdown = newCountdown;
                if (callBack) callBack(countdown);
            }

            if (countdown <= 0) {
                this.#isDetectionOn = false; // 감지 상태 종료
                onNotDetected();
                return;
            }
        };

        const checkKeyPress = () => {
            if (!this.#isDetectionOn) {
                cancelAnimationFrame(this.#animationFrameId); // 감지가 중단되면 스케줄된 호출 취소
                return;
            }

            if (this.isAnyKeyPressed) {
                this.stopKeyPressDetection();
                if (onDetected) onDetected();
                return;
            }

            if (countdownCallBack) updateCountdown(countdownCallBack);

            if (Date.now() - detectionStartTime < timeout) {
                this.#animationFrameId = requestAnimationFrame(checkKeyPress);
            } else {
                this.stopKeyPressDetection();
                if (!countdownCallBack) onNotDetected();
            }
        };

        this.#animationFrameId = requestAnimationFrame(checkKeyPress);
    }

    stopKeyPressDetection() {
        if (!this.#isDetectionOn) return;
        this.#isDetectionOn = false;
        cancelAnimationFrame(this.#animationFrameId);
    }
}
