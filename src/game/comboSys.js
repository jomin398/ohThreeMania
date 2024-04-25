export default class ComboSys {
    constructor(wrapperElement, opt) {
        this.comboList = [];
        this.comboCount = 0;
        this.comboWrap = wrapperElement;
        if (opt) {
            let { side, maxLength } = opt;
            this.maxLength = maxLength;
            this.#side = side ? side : 0;
            if (side) this.comboWrap.classList.add(side);
        }
        return this;
    }
    maxLength = 5;
    #side = 0;
    add() {
        this.comboCount++;
        this.update(this.comboCount);
    }

    remove() {
        if (this.comboList.length > 0) {
            this.comboList.shift();
            this.comboWrap.removeChild(this.comboWrap.firstChild);
        }
    }
    SIDES = {
        only: 0,
        bottomUP: 1,
        left: 2
    }
    #getKeyByIndex(targetObj, index) {
        const keys = Object.keys(targetObj);
        return keys[index];
    }
    update(combo) {
        if (this.comboList.length >= this.maxLength) {
            this.remove();
        }
        this.comboList.push(combo);
        let comboElement = document.createElement('p');
        const s = this.#getKeyByIndex(this.SIDES, this.#side);
        comboElement.className = `combo ${s} fade`;
        const classSuffix = Math.floor((combo - 1) / 100) * 100;
        comboElement.classList.add(`c${classSuffix}`);
        comboElement.innerText = combo;
        this.comboWrap.appendChild(comboElement);
    }

    reset() {
        this.comboCount = 0;
        this.comboList = [];
        while (this.comboWrap.firstChild) {
            this.comboWrap.removeChild(this.comboWrap.firstChild);
        }
    }
}