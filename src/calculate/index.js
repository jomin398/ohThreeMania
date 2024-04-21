import { BeatmapInfo, HitType, Beatmap, ScoreInfo, HitStatistics, HitResult, MathUtils, StrainSkill, Score } from './classes.mjs';
import { StandardDifficultyCalculator, StandardRuleset, StandardDifficultyAttributes } from './standard-stable.mjs';
import { ManiaDifficultyCalculator, ManiaRuleset, ManiaDifficultyAttributes } from './mania-stable.mjs';
import { TaikoDifficultyCalculator, TaikoRuleset, TaikoDifficultyAttributes, Peaks } from './taiko-stable.mjs';
import { Buffer } from 'buffer';
import { BeatmapDecoder } from 'osu-parsers';

function calculateDifficulty(options) {
    const { beatmap, ruleset, mods } = options;

    if (!beatmap || !ruleset) {
        throw new Error('Cannot calculate difficulty attributes');
    }

    const calculator = options.calculator
        ?? ruleset.createDifficultyCalculator(beatmap);

    if (typeof mods !== 'string' && typeof mods !== 'number') {
        return calculator.calculateAt(options.totalHits);
    }

    const combination = ruleset.createModCombination(mods);

    return calculator.calculateWithModsAt(combination, options.totalHits);
}

function calculatePerformance(options) {
    const { difficulty, scoreInfo, ruleset } = options;

    if (!difficulty || !scoreInfo || !ruleset) {
        throw new Error('Cannot calculate performance attributes');
    }

    const castedDifficulty = difficulty;
    const calculator = ruleset.createPerformanceCalculator(castedDifficulty, scoreInfo);

    return calculator.calculateAttributes();
}

let GameMode;

(function (GameMode) {
    GameMode[GameMode['Osu'] = 0] = 'Osu';
    GameMode[GameMode['Taiko'] = 1] = 'Taiko';
    GameMode[GameMode['Fruits'] = 2] = 'Fruits';
    GameMode[GameMode['Mania'] = 3] = 'Mania';
})(GameMode || (GameMode = {}));

class ExtendedStandardDifficultyCalculator extends StandardDifficultyCalculator {
    constructor() {
        super(...arguments);
        this._skills = [];
    }
    getSkills() {
        return this._skills;
    }
    _createDifficultyAttributes(beatmap, mods, skills, clockRate) {
        this._skills = skills;

        return super._createDifficultyAttributes(beatmap, mods, skills, clockRate);
    }
}

class ExtendedManiaDifficultyCalculator extends ManiaDifficultyCalculator {
    constructor() {
        super(...arguments);
        this._skills = [];
    }
    getSkills() {
        return this._skills;
    }
    _createDifficultyAttributes(beatmap, mods, skills, clockRate) {
        this._skills = skills;

        return super._createDifficultyAttributes(beatmap, mods, skills, clockRate);
    }
}

class ExtendedTaikoDifficultyCalculator extends TaikoDifficultyCalculator {
    constructor() {
        super(...arguments);
        this._skills = [];
    }
    getSkills() {
        return this._skills;
    }
    _createDifficultyAttributes(beatmap, mods, skills, clockRate) {
        this._skills = skills;

        return super._createDifficultyAttributes(beatmap, mods, skills, clockRate);
    }
}

function createDifficultyCalculator(beatmap, ruleset) {
    switch (ruleset.id) {
        case GameMode.Osu:
            return new ExtendedStandardDifficultyCalculator(beatmap, ruleset);
        case GameMode.Taiko:
            return new ExtendedTaikoDifficultyCalculator(beatmap, ruleset);
        case GameMode.Mania:
            return new ExtendedManiaDifficultyCalculator(beatmap, ruleset);
    }

    throw new Error('This ruleset does not support strain output!');
}

function createBeatmapInfo(beatmap, hash) {
    return new BeatmapInfo({
        id: beatmap?.metadata.beatmapId,
        beatmapsetId: beatmap?.metadata.beatmapSetId,
        creator: beatmap?.metadata.creator,
        title: beatmap?.metadata.title,
        artist: beatmap?.metadata.artist,
        version: beatmap?.metadata.version,
        hittable: countObjects(HitType.Normal, beatmap),
        slidable: countObjects(HitType.Slider, beatmap),
        spinnable: countObjects(HitType.Spinner, beatmap),
        holdable: countObjects(HitType.Hold, beatmap),
        length: (beatmap?.length ?? 0) / 1000,
        bpmMin: beatmap?.bpmMin,
        bpmMax: beatmap?.bpmMax,
        bpm: beatmap?.bpm,
        circleSize: beatmap?.difficulty.circleSize,
        approachRate: beatmap?.difficulty.approachRate,
        overallDifficulty: beatmap?.difficulty.overallDifficulty,
        drainRate: beatmap?.difficulty.drainRate,
        rulesetId: beatmap?.mode,
        mods: getMods(beatmap),
        maxCombo: getMaxCombo(beatmap),
        isConvert: beatmap?.originalMode !== beatmap?.mode,
        hashMD5: hash ?? '',
    });
}

function createBeatmapAttributes(beatmap) {

    const totalHits = getTotalHits(beatmap);

    return {
        beatmapId: beatmap?.metadata.beatmapId,
        rulesetId: beatmap?.mode,
        mods: getMods(beatmap)?.toString() ?? 'NM',
        maxCombo: getMaxCombo(beatmap),
        clockRate: beatmap?.difficulty.clockRate ?? 1,
        totalHits
    };
}

function countObjects(hitType, beatmap) {
    if (!beatmap) {
        return 0;
    }

    return beatmap.hitObjects.reduce((sum, obj) => {
        return sum + (obj.hitType & hitType ? 1 : 0);
    }, 0);
}

function getTotalHits(beatmap) {
    if (!beatmap) {
        return 0;
    }

    switch (beatmap.mode) {
        case GameMode.Osu: {
            const circles = countObjects(HitType.Normal, beatmap);
            const sliders = countObjects(HitType.Slider, beatmap);
            const spinners = countObjects(HitType.Spinner, beatmap);

            return circles + sliders + spinners;
        }
        case GameMode.Mania: {
            const notes = countObjects(HitType.Normal, beatmap);
            const holds = countObjects(HitType.Hold, beatmap);

            return notes + holds;
        }
    }

    const hittable = countObjects(HitType.Normal, beatmap);
    const slidable = countObjects(HitType.Slider, beatmap);
    const spinnable = countObjects(HitType.Spinner, beatmap);
    const holdable = countObjects(HitType.Hold, beatmap);

    return hittable + slidable + spinnable + holdable;
}

function getMaxCombo(beatmap) {
    return beatmap?.maxCombo ?? 0;
}

function getMods(beatmap) {
    return beatmap?.mods ?? null;
}

function getRulesetIdByName(rulesetName) {
    switch (rulesetName?.toLowerCase()) {
        case 'standard':
        case 'std':
        case 'osu': return GameMode.Osu;
        case 'taiko': return GameMode.Taiko;
        case 'ctb':
        case 'catch':
        case 'fruits': return GameMode.Fruits;
        case 'mania': return GameMode.Mania;
    }

    throw new Error('Unknown ruleset!');
}

function getRulesetById(rulesetId) {
    switch (rulesetId) {
        case GameMode.Osu: return new StandardRuleset();
        case GameMode.Mania: return new ManiaRuleset();
    }

    throw new Error('Unknown ruleset!');
}

function toDifficultyMods(mods, rulesetId) {
    const ruleset = getRulesetById(rulesetId ?? GameMode.Osu);
    const difficultyCalculator = ruleset.createDifficultyCalculator(new Beatmap());
    const difficultyMods = difficultyCalculator.difficultyMods;
    const combination = ruleset.createModCombination(mods);
    const difficultyBitwise = combination.all.reduce((bitwise, mod) => {
        const found = difficultyMods.find((m) => {
            if (m.bitwise === mod.bitwise) {
                return true;
            }

            return m.acronym === 'DT' && mod.acronym === 'NC';
        });

        return bitwise + (found?.bitwise ?? 0);
    }, 0);

    return ruleset.createModCombination(difficultyBitwise);
}

function toCombination(input, rulesetId) {
    const ruleset = getRulesetById(rulesetId ?? GameMode.Osu);

    return ruleset.createModCombination(input);
}

function toDifficultyAttributes(difficulty, rulesetId) {
    const attributes = createAttributes(rulesetId, difficulty?.mods);

    if (typeof difficulty !== 'object') {
        return attributes;
    }

    for (const key in difficulty) {
        if (key in attributes) {
            attributes[key] = difficulty[key];
        }
    }

    return attributes;
}

function toScoreInfo(data) {
    const scoreInfo = new ScoreInfo();

    if (data?.toJSON) {
        return scoreInfo;
    }

    const jsonable = data;

    scoreInfo.id = jsonable?.id;
    scoreInfo.totalScore = jsonable?.totalScore;
    scoreInfo.totalPerformance = jsonable?.totalPerformance;
    scoreInfo.maxCombo = jsonable?.maxCombo;
    scoreInfo.passed = jsonable?.passed;
    scoreInfo.perfect = jsonable?.perfect;
    scoreInfo.rank = jsonable?.rank;
    scoreInfo.accuracy = jsonable?.accuracy;
    scoreInfo.username = jsonable?.username;
    scoreInfo.userId = jsonable?.userId;
    scoreInfo.beatmapId = jsonable?.beatmapId;
    scoreInfo.date = jsonable?.date ? new Date(jsonable?.date) : new Date();
    scoreInfo.beatmapHashMD5 = jsonable?.beatmapHashMD5;
    scoreInfo.rulesetId = jsonable?.rulesetId;
    scoreInfo.mods = toCombination(jsonable.mods, jsonable.rulesetId);
    scoreInfo.countGeki = jsonable?.countGeki;
    scoreInfo.count300 = jsonable?.count300;
    scoreInfo.countKatu = jsonable?.countKatu;
    scoreInfo.count100 = jsonable?.count100;
    scoreInfo.count50 = jsonable?.count50;
    scoreInfo.countMiss = jsonable?.countMiss;

    return scoreInfo;
}

function createAttributes(rulesetId, mods) {
    const ruleset = getRulesetById(rulesetId ?? GameMode.Osu);
    const combination = ruleset.createModCombination(mods);

    switch (ruleset.id) {
        case GameMode.Mania: return new ManiaDifficultyAttributes(combination, 0);
    }

    return new StandardDifficultyAttributes(combination, 0);
}

function generateHitStatistics(options) {
    switch (options.attributes.rulesetId) {
        case GameMode.Mania:
            return generateManiaHitStatistics(options);
    }

    return generateOsuHitStatistics(options);
}

function generateOsuHitStatistics(options) {
    const attributes = options.attributes;
    const accuracy = getAccuracy(options);
    const totalHits = attributes.totalHits ?? 0;
    let count50 = options.count50;
    let count100 = options.count100;
    let countMiss = options.countMiss ?? 0;

    countMiss = MathUtils.clamp(countMiss, 0, totalHits);
    count50 = count50 ? MathUtils.clamp(count50, 0, totalHits - countMiss) : 0;

    if (typeof count100 !== 'number') {
        count100 = Math.round((totalHits - totalHits * accuracy) * 1.5);
    }
    else {
        count100 = MathUtils.clamp(count100, 0, totalHits - count50 - countMiss);
    }

    const count300 = totalHits - count100 - count50 - countMiss;

    return new HitStatistics([
        [HitResult.Great, count300],
        [HitResult.Ok, count100],
        [HitResult.Meh, count50],
        [HitResult.Miss, countMiss],
    ]);
}

function generateManiaHitStatistics(options) {
    const attributes = options.attributes;
    const accuracy = getAccuracy(options);
    const totalHits = attributes.totalHits ?? 0;
    let count300 = options.count300 ?? 0;
    let countKatu = options.countKatu ?? 0;
    let count100 = options.count100 ?? 0;
    let count50 = options.count50;
    let countMiss = options.countMiss ?? 0;

    countMiss = MathUtils.clamp(countMiss, 0, totalHits);
    count50 ?? (count50 = Math.round(1.2 * (totalHits - totalHits * accuracy) - 0.8 * count100 - 0.4 * countKatu - 1.2 * countMiss));

    let currentCounts = countMiss;

    count50 = MathUtils.clamp(count50, 0, totalHits - currentCounts);
    currentCounts += count50;
    count100 = MathUtils.clamp(count100, 0, totalHits - currentCounts);
    currentCounts += count100;
    countKatu = MathUtils.clamp(countKatu, 0, totalHits - currentCounts);
    currentCounts += countKatu;
    count300 = MathUtils.clamp(count300, 0, totalHits - currentCounts);

    const countGeki = totalHits - count300 - countKatu - count100 - count50 - countMiss;

    return new HitStatistics([
        [HitResult.Perfect, countGeki],
        [HitResult.Great, count300],
        [HitResult.Good, countKatu],
        [HitResult.Ok, count100],
        [HitResult.Meh, count50],
        [HitResult.Miss, countMiss],
    ]);
}

function getAccuracy(options) {
    if (typeof options.accuracy !== 'number') {
        return 1;
    }

    let accuracy = options.accuracy;

    while (accuracy > 1) {
        accuracy /= 100;
    }

    return accuracy;
}

function clampStats(value, hasDT = false) {
    const MIN_LIMIT = 0;
    const MAX_LIMIT = hasDT ? 11 : 10;

    return MathUtils.clamp(value, MIN_LIMIT, MAX_LIMIT);
}

function clampRate(value) {
    const MIN_LIMIT = 0.25;
    const MAX_LIMIT = 10;

    return MathUtils.clamp(value, MIN_LIMIT, MAX_LIMIT);
}

function clampBPM(value) {
    const MIN_LIMIT = 1;
    const MAX_LIMIT = 10000;

    return MathUtils.clamp(value, MIN_LIMIT, MAX_LIMIT);
}

function applyCustomCircleSize(beatmap, mods, stats) {
    if (typeof stats.circleSize !== 'number') {
        return;
    }

    const denominator = mods.has('HR') ? 1.3 : (mods.has('EZ') ? 0.5 : 1);
    const shouldLockCS = stats.lockStats || stats.lockCircleSize;

    beatmap.difficulty.circleSize = clampStats(shouldLockCS ? stats.circleSize / denominator : stats.circleSize);
}

function applyCustomStats(beatmap, mods, stats) {
    const { clockRate, bpm } = stats;

    if (typeof clockRate === 'number') {
        beatmap.difficulty.clockRate = clampRate(clockRate);
    }
    else if (beatmap.difficulty.clockRate === 1 && typeof bpm === 'number') {
        beatmap.difficulty.clockRate = clampBPM(bpm) / beatmap.bpm;
    }

    beatmap.difficulty.approachRate = getScaledAR(beatmap, mods, stats);
    beatmap.difficulty.overallDifficulty = getScaledOD(beatmap, mods, stats);
}

function getScaledAR(beatmap, mods, stats) {
    if (typeof stats.approachRate !== 'number') {
        return beatmap.difficulty.approachRate;
    }

    const hasDT = mods.has('DT') || mods.has('NC');

    if (!stats.lockStats && !stats.lockApproachRate) {
        const multiplier = mods.has('HR') ? 1.4 : (mods.has('EZ') ? 0.5 : 1);

        return clampStats(stats.approachRate * multiplier, hasDT);
    }

    const newApproachRate = clampStats(stats.approachRate, hasDT);
    const adjustedRate = beatmap.difficulty.clockRate;

    switch (beatmap.mode) {
        case GameMode.Osu:
        case GameMode.Fruits: {
            const preemptMs = newApproachRate <= 5
                ? 1800 - newApproachRate * 120
                : 1200 - (newApproachRate - 5) * 150;
            const adjustedPreemptMs = preemptMs * adjustedRate;

            return adjustedPreemptMs <= 1200
                ? ((adjustedPreemptMs - 1200) * 5 / (450 - 1200)) + 5
                : 5 - ((adjustedPreemptMs - 1200) * 5 / (1800 - 1200));
        }
    }

    return newApproachRate;
}

function getScaledOD(beatmap, mods, stats) {
    if (typeof stats.overallDifficulty !== 'number') {
        return beatmap.difficulty.overallDifficulty;
    }

    const hasDT = mods.has('DT') || mods.has('NC');

    if (!stats.lockStats && !stats.lockOverallDifficulty) {
        const multiplier = mods.has('HR') ? 1.4 : (mods.has('EZ') ? 0.5 : 1);

        return clampStats(stats.overallDifficulty * multiplier, hasDT);
    }

    const newOverallDifficulty = clampStats(stats.overallDifficulty, hasDT);
    const adjustedRate = beatmap.difficulty.clockRate;

    switch (beatmap.mode) {
        case GameMode.Osu: {
            const hitWindowGreat = (80 - 6 * newOverallDifficulty);
            const adjustedHitWindowGreat = hitWindowGreat * adjustedRate;

            return adjustedHitWindowGreat <= 50
                ? ((adjustedHitWindowGreat - 50) * 5 / (20 - 50)) + 5
                : 5 - ((adjustedHitWindowGreat - 50) * 5 / (80 - 50));
        }
        case GameMode.Taiko: {
            return newOverallDifficulty;
        }
    }

    return newOverallDifficulty;
}

// const DEFAULT_SAVE_PATH = './cache';

async function parseBeatmap(options) {
    let { fileURL, fileData, fileStr } = options;

    if (fileURL || fileData) {
        return await (async (urlOrArrayBuff) => {
            const b = new Buffer(typeof urlOrArrayBuff == 'string' ? await (await fetch(urlOrArrayBuff)).arrayBuffer() : urlOrArrayBuff);
            const data = (data => {
                return new BeatmapDecoder().decodeFromBuffer(data, {
                    parseColours: false,
                    parseEditor: false,
                    parseEvents: false,
                    parseStoryboard: false,
                });
            })(b.buffer);
            return {
                data: data,
                hash: 0,
            };
        })(fileURL ?? fileData);
    } else if (fileStr) {
        return await (async (str) => {
            const data = (data => {
                return new BeatmapDecoder().decodeFromString(data, {
                    parseColours: false,
                    parseEditor: false,
                    parseEvents: false,
                    parseStoryboard: false,
                });
            })(str);
            return {
                data: data,
                hash: 0,
            };
        })(fileStr);
    }

    throw new Error('No beatmap ID or file URL was found!');
}

class ScoreSimulator {
    async completeReplay(score, attributes) {
        const scoreInfo = score.info;
        const beatmapCombo = attributes.maxCombo ?? 0;

        return this._generateScoreInfo({
            ...scoreInfo,
            beatmapId: attributes.beatmapId,
            rulesetId: attributes.rulesetId,
            totalHits: attributes.totalHits,
            mods: toCombination(attributes.mods, attributes.rulesetId),
            perfect: scoreInfo.maxCombo >= beatmapCombo,
        });
    }
    simulate(options) {
        const statistics = generateHitStatistics(options);
        const attributes = options.attributes;
        const beatmapCombo = attributes.maxCombo ?? 0;
        const percentage = options.percentCombo ?? 100;
        const multiplier = MathUtils.clamp(percentage, 0, 100) / 100;
        const scoreCombo = options.maxCombo ?? Math.round(beatmapCombo * multiplier);
        const misses = statistics.get(HitResult.Miss);
        const limitedCombo = Math.min(scoreCombo, beatmapCombo - misses);
        const maxCombo = Math.max(0, limitedCombo);

        return this._generateScoreInfo({
            beatmapId: attributes.beatmapId,
            rulesetId: attributes.rulesetId,
            totalHits: attributes.totalHits,
            mods: toCombination(attributes.mods, attributes.rulesetId),
            totalScore: options.totalScore,
            perfect: maxCombo >= beatmapCombo,
            statistics,
            maxCombo,
        });
    }
    simulateFC(scoreInfo, attributes) {
        if (scoreInfo.rulesetId === GameMode.Mania) {
            return this.simulateMax(attributes);
        }

        const statistics = scoreInfo.statistics;
        const totalHits = attributes.totalHits ?? 0;

        switch (scoreInfo.rulesetId) {
            case GameMode.Fruits: {
                const largeTickHit = statistics.get(HitResult.LargeTickHit);
                const smallTickHit = statistics.get(HitResult.SmallTickHit);
                const smallTickMiss = statistics.get(HitResult.SmallTickMiss);
                const miss = statistics.get(HitResult.Miss);

                statistics.set(HitResult.Great, totalHits - largeTickHit - smallTickHit - smallTickMiss - miss);
                statistics.set(HitResult.LargeTickHit, largeTickHit + miss);
                break;
            }
            case GameMode.Mania: {
                const great = statistics.get(HitResult.Great);
                const good = statistics.get(HitResult.Good);
                const ok = statistics.get(HitResult.Ok);
                const meh = statistics.get(HitResult.Meh);

                statistics.set(HitResult.Perfect, totalHits - great - good - ok - meh);
                break;
            }

            default: {
                const ok = statistics.get(HitResult.Ok);
                const meh = statistics.get(HitResult.Meh);

                statistics.set(HitResult.Great, totalHits - ok - meh);
            }
        }

        statistics.set(HitResult.Miss, 0);

        return this._generateScoreInfo({
            ...scoreInfo,
            mods: scoreInfo.mods ?? toCombination(attributes.mods, attributes.rulesetId),
            beatmapId: attributes.beatmapId,
            rulesetId: attributes.rulesetId,
            maxCombo: attributes.maxCombo,
            perfect: true,
            statistics,
            totalHits,
        });
    }
    simulateMax(attributes) {
        const statistics = generateHitStatistics({ attributes });
        const totalHits = attributes.totalHits ?? 0;
        const score = this._generateScoreInfo({
            beatmapId: attributes.beatmapId,
            rulesetId: attributes.rulesetId,
            maxCombo: attributes.maxCombo,
            mods: toCombination(attributes.mods, attributes.rulesetId),
            perfect: true,
            statistics,
            totalHits,
        });

        return score;
    }
    _generateScoreInfo(options) {
        const scoreInfo = new ScoreInfo({
            id: options?.id ?? 0,
            beatmapId: options?.beatmapId ?? 0,
            userId: options?.userId ?? 0,
            username: options?.username ?? 'osu!',
            maxCombo: options?.maxCombo ?? 0,
            statistics: options?.statistics ?? new HitStatistics(),
            rawMods: options?.rawMods ?? 0,
            rulesetId: options?.rulesetId ?? 0,
            perfect: options?.perfect ?? false,
            beatmapHashMD5: options?.beatmapHashMD5,
            date: options?.date ?? new Date(),
            totalPerformance: options?.totalPerformance ?? null,
        });

        if (options?.mods) {
            scoreInfo.mods = options.mods;
        }

        scoreInfo.passed = scoreInfo.totalHits >= (options?.totalHits ?? 0);

        return scoreInfo;
    }
}

class BeatmapCalculator {
    constructor() {
        this._scoreSimulator = new ScoreSimulator();
    }
    async calculate(options) {
        if (this._checkPrecalculated(options)) {
            return this._processPrecalculated(options);
        }

        const { data: parsed, hash: beatmapMD5 } = await parseBeatmap(options);
        const ruleset = options.ruleset ?? getRulesetById(options.rulesetId ?? parsed.mode);
        const combination = ruleset.createModCombination(options.mods);

        applyCustomCircleSize(parsed, combination, options);

        const beatmap = ruleset.applyToBeatmapWithMods(parsed, combination);

        applyCustomStats(beatmap, combination, options);

        const beatmapInfo = options.beatmapInfo ?? createBeatmapInfo(beatmap, beatmapMD5);
        const attributes = options.attributes ?? createBeatmapAttributes(beatmap);
        const totalHits = options.totalHits;

        attributes.totalHits = totalHits ?? attributes.totalHits;

        const calculator = createDifficultyCalculator(beatmap, ruleset);
        const difficulty = options.difficulty && !options.strains
            ? toDifficultyAttributes(options.difficulty, ruleset.id)
            : calculateDifficulty({ beatmap, ruleset, calculator, totalHits });
        const skills = options.strains ? this._getSkillsOutput(calculator) : null;
        const scores = this._simulateScores(attributes, options.accuracy);
        const performance = scores.map((scoreInfo) => calculatePerformance({
            difficulty,
            ruleset,
            scoreInfo,
        }));

        return {
            beatmapInfo: beatmapInfo?.toJSON() ?? beatmapInfo,
            attributes,
            skills,
            difficulty,
            performance,
        };
    }
    _processPrecalculated(options) {
        const { beatmapInfo, attributes } = options;
        const ruleset = options.ruleset ?? getRulesetById(attributes.rulesetId);
        const difficulty = toDifficultyAttributes(options.difficulty, ruleset.id);
        const scores = this._simulateScores(attributes, options.accuracy);
        const performance = scores.map((scoreInfo) => calculatePerformance({
            difficulty,
            ruleset,
            scoreInfo,
        }));

        return {
            beatmapInfo: beatmapInfo?.toJSON() ?? beatmapInfo,
            skills: null,
            attributes,
            difficulty,
            performance,
        };
    }
    _checkPrecalculated(options) {
        const isValid = !!options.beatmapInfo
            && !!options.attributes
            && !!options.difficulty
            && !options.strains;

        if (options.attributes && typeof options.totalHits === 'number') {
            return isValid && options.attributes.totalHits === options.totalHits;
        }

        return isValid;
    }
    _getSkillsOutput(calculator) {
        const getStrainSkillOutput = (skills) => {
            const strainSkills = skills.filter((s) => s instanceof StrainSkill);

            return strainSkills.map((skill) => {
                return {
                    title: skill.constructor.name,
                    strainPeaks: [...skill.getCurrentStrainPeaks()],
                };
            });
        };

        const mainSkills = calculator.getSkills();

        // if (mainSkills.length > 0 && mainSkills[0] instanceof Peaks) {
        //     const peakSkill = mainSkills[0];

        //     return getStrainSkillOutput([
        //         peakSkill.rhythm,
        //         peakSkill.colour,
        //         peakSkill.stamina,
        //     ]);
        // }

        const skillOutput = getStrainSkillOutput(mainSkills);

        if (skillOutput[0]?.title === 'Aim' && skillOutput[1]?.title === 'Aim') {
            skillOutput[1].title = 'Aim (No Sliders)';
        }

        return skillOutput;
    }
    _simulateScores(attributes, accuracy) {
        accuracy ?? (accuracy = [95, 99, 100]);

        return accuracy.map((accuracy) => this._scoreSimulator.simulate({
            attributes,
            accuracy,
        }));
    }
}

export {
    BeatmapCalculator,
    GameMode,
    applyCustomCircleSize,
    applyCustomStats,
    calculateDifficulty,
    calculatePerformance,
    createBeatmapAttributes,
    createBeatmapInfo,
    createDifficultyCalculator,
    generateHitStatistics,
    getMaxCombo,
    getMods,
    getRulesetById,
    getRulesetIdByName,
    getTotalHits,
    parseBeatmap,
    toCombination,
    toDifficultyAttributes,
    toDifficultyMods,
    toScoreInfo
};