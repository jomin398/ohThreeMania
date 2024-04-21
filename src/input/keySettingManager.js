import BSToastManager from "../bsToastManager.js";

export default class KeySettingManager {
    constructor() {
        /**
         * @type {Object<string,string>}
         */
        this.keySetting = {}; // 키 저장
        /**
         * @type {BSToastManager?}
         */
        this.toastManager = null;

    }
    registSettingEdit() {
        this.#getKeySettingElmObj().find('#keyButtons .btn').on('click', (e) => {
            const buttonId = e.currentTarget.id;
            $(`#${buttonId}`).removeClass('btn-warning');
            this.#registerKey(buttonId);
        });

        this.#getKeySettingElmObj().find('#saveButton').on('click', () => this.#saveKeys());
    }
    #getKeySettingElmObj() {
        return $('.keyBindSetting');
    }
    showRegistedKeys() {
        this.#getKeySettingElmObj().find('#keyButtons .btn').each((_, element) => {
            const buttonId = element.id;
            if (this.keySetting[buttonId]) {
                $(`#${buttonId}`).text(`(${this.keySetting[buttonId]})`); // 이미 등록된 키가 있으면 버튼 텍스트 업데이트
            }
        });
    }

    #registerKey(buttonId) {
        this.toastManager.showToast(`${buttonId} 등록을 시작합니다. 원하시는 키를 입력해주세요.`, 0);
        $(document).off('keydown').on('keydown', (event) => {
            this.keySetting[buttonId] = event.key;
            this.#getKeySettingElmObj().find(`#${buttonId}`).text(`(${event.key})`); // 버튼 텍스트 업데이트
            this.toastManager.showToast(`${buttonId}에 ${event.key}가 등록되었습니다.`, 1);
            $(document).off('keydown');
        });
    }

    #findDuplicates() {
        let duplicates = [];
        let keyCounts = {};

        Object.keys(this.keySetting).forEach(buttonId => {
            const key = this.keySetting[buttonId];
            if (!keyCounts[key]) {
                keyCounts[key] = [];
            }
            keyCounts[key].push(buttonId);
        });

        Object.keys(keyCounts).forEach(key => {
            if (keyCounts[key].length > 1) {
                keyCounts[key].forEach(buttonId => {
                    duplicates.push({ buttonId, key });
                });
            }
        });

        return duplicates;
    }
    #highlightDuplicates() {
        const duplicates = this.#findDuplicates();
        this.#getKeySettingElmObj().find('#keyButtons .btn').each((_, element) => {
            const buttonId = element.id;
            const isDuplicate = duplicates.some(dup => dup.buttonId === buttonId);
            $(element).toggleClass('btn-warning', isDuplicate);
        });
    }

    #saveKeys() {
        this.#getKeySettingElmObj().find('#keyButtons .btn').removeClass('btn-warning'); // 하이라이트 제거
        if (Object.entries(this.keySetting).length === 0) {
            this.toastManager.showToast(`모든 키가 미등록 되어 있습니다.`, -1);
            return;
        }

        const duplicates = this.#findDuplicates();
        if (duplicates.length) {
            let message = "중복된 키가 있습니다: ";
            duplicates.forEach(dup => {
                message += `${dup.buttonId}에 ${dup.key} `;
            });
            this.toastManager.showToast(message, -1);
            this.#highlightDuplicates();
            return;
        } else if (Object.entries(this.keySetting).length === 4) {
            let message = "모든 키가 성공적으로 등록되었습니다: ";
            Object.entries(this.keySetting).forEach(([key, val]) => {
                message += `${key}에 "${val}", `;
            });
            this.toastManager.showToast(message, 1);
            if (this.resolveFn) this.resolveFn(this.keySetting);
        }
    }
    /** 
     * @private
     * @callback
     * @type {(string)=>string?}
     */
    resolveFn = null;
    /**
     * fires at on save btn pressed.
     * @type {Promise<{[x: string]: string}>?}
     */
    savePromise = new Promise(r => {
        this.resolveFn = r;
    });
};