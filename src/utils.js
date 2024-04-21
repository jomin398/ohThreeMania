export const getFileExt = (str) => {
    let e = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/ig;
    return str.match(e)[0] ? str.match(e)[0].replace(/^\./g, '') : null;
}

export function getFileName(str) {
    let e = /(.*?[\/:])?(([^\/:]*?)(\.[^\/.]+?)?)(?:[?#].*)?$/gi;
    let m = e.exec(str);
    return m ? m[3] ? m[3] : null : null;
}

export const erf = x => {
    const p = 0.3275911;
    const coefficients = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429];

    const s = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1 / (1 + p * x);
    const y = 1 - coefficients.reduceRight((acc, a) => acc * t + a) * t * Math.exp(-x * x);

    return s * y;
};

export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 
 * @param {Number} num 숫자
 * @param {Number} digits 맞추려는 자릿수 
 * @returns {String}
 * @example
 * const paddedNum = padNumber(1, 3);
 * console.log(paddedNum); // "001"
 */
export function padNumber(num, digits) {
    let numStr = num.toString();
    while (numStr.length < digits) {
        numStr = "0" + numStr;
    }
    return numStr;
}

export const getIsMobile = () => navigator.userAgentData.mobile;

export function findLatestArtistElm(optn, selectedLevel, chartList) {
    return Array.from($($('.songDiffList .carousel-inner').children()[optn])
        .find('.vocalList').children())
        .find(e => e.innerText == chartList[optn][selectedLevel].artist);
}
/**
 * @class 드롭다운 선택 상자를 관리합니다.
 * @param {string} wrapperSelector - 선택 상자가 포함된 컨테이너의 선택자.
 * @param {string} selector - 선택 상자 선택자.
 * @param {function(jQuery,Number):void} onChange - 선택 상자의 옵션이 변경될 때 호출될 콜백 함수.
 * @example
 * const mySelectBox = new SelectBox('#wrapper', '#mySelectBox', (selectedElement, index) => {
 *   console.log(`선택된 옵션: ${selectedElement.text()}, 인덱스: ${index}`);
 * });
 */

export class SelectBox {
    constructor(wrapperSelector, selector, onChange) {
        this.wrapper = wrapperSelector ? $(wrapperSelector) : $(document);
        this.element = $(selector);
        this.onChange = onChange;
        this.init();
    }

    init() {
        this.element.each((index, selectBox) => {
            $(selectBox).click((e) => {
                const target = $(e.target);
                const isOption = target.hasClass('option');

                if (isOption) {
                    this.#selectOption(target, selectBox);
                }

                $(selectBox).toggleClass('active');
            });
        });

        this.wrapper.click((e) => {
            const target = $(e.target);
            const isSelect = target.hasClass('select') || target.closest('.select').length;

            if (!isSelect) {
                $('.select').removeClass('active');
            }
        });
    }

    #selectOption(selectedElement, selectBox) {
        $(selectBox).find('.selected-value').html(selectedElement.html());
        const index = $(selectBox).find('.option').index(selectedElement);

        if (typeof this.onChange === 'function') {
            this.onChange(selectedElement, index);
        }
    }
}
/**
 * progressBar update handler
 * @param {Object} option
 * @param {String} option.selector element Selector
 * @param {Number} option.ps percent to display
 * @param {Boolean} option.isVertical toggles Vertical Mode.
 * @param {CallableFunction} option.test testing function
 * @returns {object} jqueryObject for Element Chaining.
 */
export function pgnBarUpdate(option) {
    let { selector, ps = 0, isVertical = false, test, onTrue, onFalse } = option;
    let textElem = $(selector).parent().parent().find('#text');
    $(selector).attr("aria-valuenow", ps);
    if (!isVertical) {
        $(selector)[0].style.width = `${ps}%`;
    } else {
        $(selector)[0].style.height = `${ps}%`;
    }

    if (textElem.length != 0) {
        //$(selector).parent().parent().find('#text').text(test ? test(ps) : `${ps}%`);
        let bool = test ? test(ps) : false;
        if (bool && onTrue) {
            onTrue(t => textElem.text(t), ps);
        } else if (test && onFalse && !bool) {
            onFalse(t => textElem.text(t), ps);
        }
    };
    return $(selector);
}
export function captureStackTrace(target, error) {
    const container = error;//new Error(); // eslint-disable-line unicorn/error-message

    Object.defineProperty(error, 'stack', {
        configurable: true,
        get() {
            const { stack } = container;
            Object.defineProperty(target, 'stack', { value: stack });
            return stack;
        },
    });
}
/**
 * msc2TimeStamp
 * @param {number} duration milliseconds 
 * @param {object?} opt
 * @param {boolean?} opt.hour enable display hour
 * @param {boolean?} opt.msc enable display milliseconds
 * @returns {string}
 */
export function msToTime(duration, opt) {
    var milliseconds = parseInt((duration % 1000) / 100)
        , seconds = parseInt((duration / 1000) % 60)
        , minutes = parseInt((duration / (1000 * 60)) % 60)
        , hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    let str = `${opt?.hour ? `${hours}:` : ''}${minutes}:${seconds}${opt?.msc ? `.${milliseconds}` : ''}`;
    return str;
}