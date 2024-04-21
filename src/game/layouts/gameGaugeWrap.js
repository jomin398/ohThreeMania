import { pgnBarUpdate } from "../../utils.js";

export const gameGaugeWrap = `<div class="gameGaugeWrap" style="--pgHeight:400px; --pgWidth:25px;">
    <div class="gameGauge">
        <div class="effRate progress progress-bar-vertical">
            <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"
                style="height: 0%;">
            </div>
            <span id="text">0%</span>
        </div>
        <span id="minClearLine"></span>
    </div>
</div>`;
export const update = p => pgnBarUpdate({
    selector: ".gameGauge .progress-bar", ps: p,
    isVertical: true,
    test: p => p >= 70,
    onTrue: (setText) => setText('clear'),
    onFalse: (setText, p) => setText(`${p}%`)
});