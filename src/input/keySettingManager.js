export default class KeySettingManager {
    constructor() {
        this.keySetting = {}; // 키 저장
        this.toastManager = null;
    }

    registSettingEdit() {
        const keySettingElm = $('.keyBindSetting');
        keySettingElm.find('#keyButtons .btn').on('click', e => this.#registerKey(e.currentTarget.id));
        keySettingElm.find('#saveButton').on('click', () => this.#saveKeys());
    }

    showRegistedKeys() {
        const keySettingElm = $('.keyBindSetting');
        keySettingElm.find('#keyButtons .btn').each((_, element) => {
            if (this.keySetting[element.id]) {
                $(element).text(`(${this.keySetting[element.id]})`);
            }
        });
    }

    #registerKey(buttonId) {
        this.toastManager.showToast(`${buttonId} 등록을 시작합니다. 원하시는 키를 입력해주세요.`, "키 등록", 0);
        $(document).off('keydown').on('keydown', event => {
            this.keySetting[buttonId] = event.key;
            $('.keyBindSetting').find(`#${buttonId}`).text(`(${event.key})`);
            this.toastManager.showToast(`${buttonId}에 ${event.key}가 등록되었습니다.`, "키 등록", 1);
            $(document).off('keydown');
        });
    }

    #findDuplicates() {
        let duplicates = [];
        let keyCounts = {};

        Object.entries(this.keySetting).forEach(([buttonId, key]) => {
            keyCounts[key] = keyCounts[key] || [];
            keyCounts[key].push(buttonId);
        });

        Object.values(keyCounts).forEach(ids => {
            if (ids.length > 1) duplicates.push(...ids.map(buttonId => ({ buttonId, key: this.keySetting[buttonId] })));
        });

        return duplicates;
    }

    #highlightDuplicates() {
        const duplicates = this.#findDuplicates();
        $('.keyBindSetting').find('#keyButtons .btn').each((_, element) => {
            $(element).toggleClass('btn-warning', duplicates.some(dup => dup.buttonId === element.id));
        });
    }

    #saveKeys() {
        $('.keyBindSetting').find('#keyButtons .btn').removeClass('btn-warning');
        if (!Object.keys(this.keySetting).length) {
            this.toastManager.showToast(`모든 키가 미등록 되어 있습니다.`, "키 등록", -1);
            return;
        }

        const duplicates = this.#findDuplicates();
        if (duplicates.length) {
            this.toastManager.showToast(`중복된 키가 있습니다: ${duplicates.map(dup => `${dup.buttonId}에 ${dup.key}`).join(' ')}`, "키 등록", -1);
            this.#highlightDuplicates();
        } else {
            this.toastManager.showToast(`모든 키가 성공적으로 등록되었습니다: ${Object.entries(this.keySetting).map(([key, val]) => `${key}에 "${val}"`).join(', ')}`, "키 등록", 1);
            if (this.resolveFn) this.resolveFn(this.keySetting);
        }
    }

    resolveFn = null;
    savePromise = new Promise(r => this.resolveFn = r);
};