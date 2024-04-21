export class BSProgress {
    constructor(selector) {
        this.progressBar = $(`${selector} .progress-bar`);
        this.percentText = this.progressBar;
        this.title = $(`${selector} .fileTitle`).length != 0 ? $(`${selector} .fileTitle`) : null;
        this.thumbImg = $(`${selector} .thumbImg`).length != 0 ? $(`${selector} .thumbImg`) : null;
        this.onUpdate = null;
        return this;
    }

    update(value, title = '') {
        const percentValue = `${value.toFixed(2)}%`;//`${(value * 100).toFixed(2)}%`;
        this.progressBar.attr("aria-valuenow", value);
        this.progressBar[0].style.width = percentValue;
        this.percentText.text(percentValue);

        if (this.title && title) {
            this.title.text(title);
        }
        if (this.thumbImg) {
            this.thumbImg[0].style.display = value > 0 ? 'block' : 'none';
            this.thumbImg[0].style.setProperty('--pgn1', percentValue);
        }
        if (this.onUpdate) this.onUpdate.call(this, value);
    }

    reset() {
        this.update(0);
        if (this.title) this.title.text('');
        if (this.thumbImg) {
            this.thumbImg[0].style.display = 'none';
        }
    }
}

export class ProgressManager {
    constructor(selector) {
        this.progressWrap = $(selector);
        this.processedCount = 0;
        // 메인 진행 상태와 서브 진행 상태를 각각 관리하기 위한 BSProgress 인스턴스 생성
        this.mainProgress = new BSProgress(`${selector} .mainProgress`);
        this.mainProgress.percentText = $(selector).find(`.main-percent`);


        this.mainProgress.onUpdate = function (value) {
            this.percentText.text(value == 100 ? 'Done' : `${value.toFixed(2)}%`);
        }
        this.subProgress = new BSProgress(`${selector} .subProgress`);
        this.subProgress.percentText = $(selector).find(".subProgress .percent");
    }

    reset() {
        // BSProgress 인스턴스의 reset 메소드를 호출하여 초기화
        this.mainProgress.reset();
        this.subProgress.reset();
        this.progressWrap.toggleClass("d-none");
    }

    async updateProgress(partProccedNum, partListLength, titleUnicode, totalProgress) {
        let partProgress = partListLength ? partProccedNum / partListLength : 1;
        // 각 진행 상태를 업데이트하기 위해 BSProgress 인스턴스의 update 메소드 호출
        this.mainProgress.update(totalProgress * 100, titleUnicode);
        this.subProgress.update(partProgress * 100);
    }
};