export default class selfCrash {
    constructor() {
        this.enabled = false;
        this.keyboardMgr = null;
        this.showMenu = null;
        this.elem = $(".renderCont .selfCrashWarn");
        this.countDownElm = $(".renderCont .selfCrashWarn .countDown");
        this.isCrashed = false;
        this.isCountDown = false;
    }

    hide() {
        if ($(".renderCont .selfCrashWarn.d-none").length == 0) this.elem.addClass("d-none");
    }
    detect() {
        if (this.enabled)
            this.keyboardMgr.startKeyPressDetection(
                null,
                () => {
                    this.elem.removeClass("d-none").addClass("blinkBshadow");
                    this.countDownElm.text(5);
                    console.log("5초 후 자폭!");
                    this.isCountDown = true;
                    this.keyboardMgr.startKeyPressDetection(
                        () => {
                            //자폭해제.
                            this.elem.addClass("d-none").removeClass("blinkBshadow");
                            this.isCountDown = false;
                        },
                        () => {
                            this.elem.removeClass("blinkBshadow");
                            console.warn("자폭");
                            this.isCountDown = false;
                            this.isCrashed = true;
                            this.showMenu();

                        },
                        5000,
                        v => {
                            this.countDownElm.text(v);
                            console.warn(`자폭 ${v}초 남음!`);
                        }
                    );
                }
            );
    }
}