import { findDifficultyCol } from "../../calculate/findDifficultyCol.js";
import { msToTime, padNumber } from "../../utils.js";
import { BSProgress } from "../PgMgr.js";
import { GameEngine } from "../engine.js";
import DrawScoreGFX from "../judge/drawScoreGFX.js";
import { getPlayRank } from "../judge/playRank.js";


export class ResultScreen {
    constructor() {
        this.$resultInfo = $(".resultInfo"); // DOM 캐싱
        if (!this.isExistElm) {
            $('body').append(layout);
            this.$resultInfo = $(".resultInfo");
        }
        this.accuracyPg = new BSProgress('.resultInfo .accuracy.progress');
        this.hpPg = new BSProgress('.resultInfo .helthPoint.progress');
    }
    get isExistElm() {
        return this.$resultInfo.length != 0; // 캐싱된 요소 사용
    }
    /**
     * 
     * @param {GameEngine} engine 
     */
    update(engine) {
        const { chart, imgLoader, scores: scoreboardMgr } = engine.agent;
        const { combo, maxCombo, score, accuracy, noteAcc, fast, late, miss, good, great, perfect } = scoreboardMgr.result;
        const jarketURL = imgLoader.getImage({ data: chart });
        const { starRate } = chart.difficulty;

        const { originalMode, originalModeStr } = chart;
        const playRank = getPlayRank(score, engine.agent.scoreRanges);
        const clearMsg = noteAcc >= 70 ? "Track Complete!" : "Track Crashed!";
        const [difficulty, diffColor] = findDifficultyCol(starRate);

        // DOM 업데이트를 위한 정보 캐싱 및 업데이트
        const updateInfo = {
            "#songtitle": chart.metadata.titleUnicode,
            "#vocalList": chart.metadata.artistUnicode,
            "#bpm": Math.trunc(chart.bpm),
            "#chartMaker": chart.metadata.creator ?? 'unknown',
            ".starRate": starRate,
            ".diffText": difficulty,
            ".chartDur": msToTime(engine.chartDur),
            "#chain": combo,
            "#maxchain": maxCombo,
            "#score": padNumber(Math.trunc(score), 3),
            "#playRank": playRank,
            "#clearMsg": clearMsg,
            "#total_fast": fast,
            "#total_late": late,
            "#miss": miss,
            "#good": good,
            "#great": great,
            "#perfect": perfect,
        };

        for (const [selector, text] of Object.entries(updateInfo)) {
            this.$resultInfo.find(selector).text(text);
        }
        if (originalMode != 3)
            $(".resultInfo .beatmapConvertedWarn .beatmap-icon i").get(0).className = `fa-extra-mode-${originalModeStr}`;


        this.$resultInfo.find(".diffWrap").attr('style', `background-color: ${diffColor};`);
        this.$resultInfo.find(".albumCover").attr('src', jarketURL);

        this.accuracyPg.update(noteAcc);
        this.hpPg.update(accuracy);

        const jArray = scoreboardMgr.judgeList.map(item => item.j);
        const gfx = new DrawScoreGFX(".resultInfo .chartGFXWrap canvas");
        gfx.init(jArray);
        gfx.drawGraph();
        this.$resultInfo.one('hidden.bs.modal', () => {
            engine.client.gotoSongMenu();
        })
    }
    show() {
        this.$resultInfo.modal('show'); // 캐싱된 요소 사용
    }
}

const layout = `<section class="resultInfo modal fade" id="resultInfo" aria-hidden="true"
aria-labelledby="resultInfoLabel" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-fullscreen">
        <div class="modal-content">
            <div class="modal-header d-flex p-1">
                <div class="albumWrap">
                    <img class="albumCover" alt="coverImage">
                </div>
                <div class="headerInfoWrap">
                    <div id="songtitle">undefined!</div>
                    <div class="d-flex flex-column flex-grow-1">
                        <div class="d-flex">
                            <div class="vocalInfoWrap">
                                <span id="label_vocal">VOCAL</span>
                                <div class="flex-grow-1" id="vocalList"></div>
                            </div>
                            <div class="bpmInfoWrap">
                                <span id="label_bpm">BPM</span>
                                <div class="flex-grow-1" id="bpm">120</div>
                            </div>
                        </div>
                        <div class="extraInfoWrap d-flex flex-column flex-grow-1">
                            <div class="d-flex col gap-1">
                                <span id="label_chartMaker">Chart by</span>
                                <div id="chartMaker">Unknown</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-body d-flex flex-column">
                <div class="diffWrap mt-1" style="background-color: #000;">
                    <span class="diffText">undefined!</span>
                    <div>
                        <i class="bi bi-hourglass-split"></i>
                        <span class="chartDur">-1</span>
                    </div>
                    <div>
                        <i class="bi bi-star-fill"></i>
                        <span class="starRate">-1</span>
                    </div>
                    <div class="beatmapConvertedWarn d-flex align-items-center">
                        <span class="beatmap-icon beatmap-icon--beatmapset">
                            <i class="fa-extra-mode-standard"></i>
                        </span>
                        <span id="icon_TransFrom">⇆</span>
                        <span class="beatmap-icon beatmap-icon--beatmapset">
                            <i class="fa-extra-mode-mania"></i>
                        </span>
                    </div>
                </div>
                <div class="tab-content d-flex flex-grow-1" id="nav-tabContent">
                    <div class="tab-pane fade flex-grow-1 show active" id="nav-resultMain" role="tabpanel"
                        aria-labelledby="nav-resultMain-tab">
                        <div class="rankWrap d-flex p-2">
                            <span id="playRank">F</span>
                            <span id="clearMsg">Track Crashed!</span>
                        </div>
                        <div class="card scoreWrap">
                            <div class="card-body d-flex justify-content-center p-0">
                                <span id="scoreLabel">HI ☆ Score</span>
                                <span id="score">9999999</span>
                            </div>
                        </div>
                        <div class="card resultJudgeWrap">
                            <div class="card-body d-flex flex-column gap-1">
                                <div class="levelItem" style="--levelcolor:#dee2e6;">
                                    <div class="inner">MAX CHAIN</div>
                                    <span id="maxchain">0</span>
                                </div>
                                <div class="levelItem" style="--levelcolor:gray;">
                                    <div class="inner">
                                        CHAIN
                                    </div>
                                    <span id="chain">0</span>
                                </div>
                                <div class="levelItem" style="--levelcolor:gold;">
                                    <div class="inner">
                                        Perfect
                                    </div>
                                    <span id="perfect">0</span>
                                </div>
                                <div class="levelItem" style="--levelcolor:#0dcaf0;">
                                    <div class="inner">
                                        Great
                                    </div>
                                    <span id="great">0</span>
                                </div>
                                <div class="levelItem" style="--levelcolor:#00f1e4;">
                                    <div class="inner">
                                        Good
                                    </div>
                                    <span id="good">0</span>
                                </div>
                                <div class="levelItem" style="--levelcolor:#ff83e3;">
                                    <div class="inner">
                                        Miss
                                    </div>
                                    <span id="miss">0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="tab-pane fade flex-grow-1 justify-content-start" id="nav-resultDetails" role="tabpanel"
                        aria-labelledby="nav-resultDetails-tab">
                        <div class="card accuracyWrap overflow-hidden">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">HP</h5>
                                <div class="helthPoint progress progressWrap">
                                    <div class="progress-bar" id="accuracy" role="progressbar" style="width: 0%;"
                                        aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                                </div>
                            </div>
                            <div class="card-body d-flex flex-column pt-0">
                                <h5 class="card-title">Accuracy</h5>
                                <div class="accuracy progress progressWrap">
                                    <div class="progress-bar" id="accuracy" role="progressbar" style="width: 0%;"
                                        aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                                </div>
                            </div>
                            <div class="card-body p-0 flex-grow-1">
                                <div class="chartGFXWrap">
                                    <canvas style="background-color: transparent;"></canvas>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <h5 class="card-title">Timing</h5>
                            <h6>Total</h6>
                            <div class="card-body d-flex justify-content-between gap-2">
                                <div class="fastWrap d-flex">
                                    <div class="label_fast" translate="no">Fast</div>
                                    <div id="total_fast">0</div>
                                </div>
                                <div class="lateWrap d-flex">
                                    <div class="label_late" translate="no">Late</div>
                                    <div id="total_late">0</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <div class="modal-footer justify-content-between p-2">
                <div class="flex-grow-1">
                    <nav>
                        <div class="nav nav-tabs justify-content-center" id="nav-tab" role="tablist">
                            <button class="nav-link active" id="nav-resultMain-tab" data-bs-toggle="tab"
                                data-bs-target="#nav-resultMain" type="button" role="tab" aria-controls="nav-resultMain"
                                aria-selected="true">기본</button>
                            <button class="nav-link" id="nav-resultDetails-tab" data-bs-toggle="tab"
                                data-bs-target="#nav-resultDetails" type="button" role="tab" aria-controls="nav-resultDetails"
                                aria-selected="false">상새</button>
                        </div>
                    </nav>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
        </div>
    </div>
</section>`;