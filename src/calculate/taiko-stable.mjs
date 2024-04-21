import { NoMod, NoFail, Easy, Hidden, HardRock, SuddenDeath, DoubleTime, Relax, HalfTime, Nightcore, Flashlight, Autoplay, Perfect, Cinema, ModCombination, DifficultyRange, HitResult, HitWindows, HitObject, HitSound, EventGenerator, SliderPath, RulesetBeatmap, BeatmapConverter, HitType, BeatmapDifficultySection, BeatmapProcessor, DifficultyAttributes, PerformanceAttributes, DifficultyHitObject, StrainDecaySkill, LimitedCapacityQueue, MathUtils, Skill, DifficultyCalculator, PerformanceCalculator, ReplayFrame, ReplayButtonState, LegacyReplayFrame, Vector2, ReplayConverter, Ruleset } from 'osu-classes';

class TaikoNoMod extends NoMod {
}

class TaikoNoFail extends NoFail {
}

class TaikoEasy extends Easy {
  applyToDifficulty(difficulty) {
    super.applyToDifficulty(difficulty);
    difficulty.sliderMultiplier *= 0.8;
  }
}

class TaikoHidden extends Hidden {
}

class TaikoHardRock extends HardRock {
  applyToDifficulty(difficulty) {
    super.applyToDifficulty(difficulty);

    const sliderMultiplier = 1.4 * 4 / 3;

    difficulty.sliderMultiplier *= sliderMultiplier;
  }
}

class TaikoSuddenDeath extends SuddenDeath {
}

class TaikoDoubleTime extends DoubleTime {
}

class TaikoRelax extends Relax {
}

class TaikoHalfTime extends HalfTime {
}

class TaikoNightcore extends Nightcore {
}

class TaikoFlashlight extends Flashlight {
}

class TaikoAutoplay extends Autoplay {
}

class TaikoPerfect extends Perfect {
}

class TaikoCinema extends Cinema {
}

class TaikoModCombination extends ModCombination {
  get mode() {
    return 1;
  }
  get _availableMods() {
    return [
      new TaikoNoMod(),
      new TaikoNoFail(),
      new TaikoEasy(),
      new TaikoHidden(),
      new TaikoHardRock(),
      new TaikoSuddenDeath(),
      new TaikoDoubleTime(),
      new TaikoRelax(),
      new TaikoHalfTime(),
      new TaikoNightcore(),
      new TaikoFlashlight(),
      new TaikoAutoplay(),
      new TaikoPerfect(),
      new TaikoCinema(),
    ];
  }
}

class TaikoHitWindows extends HitWindows {
  isHitResultAllowed(result) {
    switch (result) {
      case HitResult.Great:
      case HitResult.Ok:
      case HitResult.Miss:
        return true;
    }

    return false;
  }
  _getRanges() {
    return TaikoHitWindows.TAIKO_RANGES;
  }
}
TaikoHitWindows.TAIKO_RANGES = [
  new DifficultyRange(HitResult.Great, 50, 35, 20),
  new DifficultyRange(HitResult.Ok, 120, 80, 50),
  new DifficultyRange(HitResult.Miss, 135, 95, 70),
];

class TaikoHitObject extends HitObject {
  constructor() {
    super(...arguments);
    this.hitWindows = new TaikoHitWindows();
  }
}
TaikoHitObject.DEFAULT_SIZE = Math.fround(0.475);

class TaikoStrongHitObject extends TaikoHitObject {
  get isStrong() {
    return !!this.samples.find((s) => {
      return s.hitSound === HitSound[HitSound.Finish];
    });
  }
  set isStrong(value) {
    if (this.samples.length > 0) {
      this.samples[0].hitSound = HitSound[value ? HitSound.Finish : HitSound.Normal];
    }
  }
}
TaikoStrongHitObject.STRONG_SCALE = Math.fround(1 / Math.fround(0.65));
TaikoStrongHitObject.DEFAULT_STRONG_SIZE = Math.fround(TaikoHitObject.DEFAULT_SIZE * TaikoStrongHitObject.STRONG_SCALE);

class DrumRollTick extends TaikoHitObject {
  constructor() {
    super(...arguments);
    this.firstTick = false;
    this.tickInterval = 0;
    this.hitWindows = TaikoHitWindows.empty;
  }
  get hitWindow() {
    return this.tickInterval / 2;
  }
  clone() {
    const cloned = super.clone();

    cloned.firstTick = this.firstTick;
    cloned.tickInterval = this.tickInterval;

    return cloned;
  }
}

class SwellTick extends TaikoHitObject {
  constructor() {
    super(...arguments);
    this.hitWindows = TaikoHitWindows.empty;
  }
}

class TaikoEventGenerator extends EventGenerator {
  static *generateDrumRollTicks(drumRoll) {
    if (drumRoll.tickInterval === 0) {
      return;
    }

    let firstTick = true;
    const tickInterval = drumRoll.tickInterval;
    let time = drumRoll.startTime;
    const endTime = drumRoll.endTime + tickInterval / 2;

    while (time < endTime) {
      const tick = new DrumRollTick();

      tick.startTime = time;
      tick.tickInterval = tickInterval;
      tick.firstTick = firstTick;
      tick.hitType = drumRoll.hitType;
      tick.hitSound = drumRoll.hitSound;
      tick.samples = drumRoll.samples;
      firstTick = false;
      yield tick;
      time += tickInterval;
    }
  }
  static *generateSwellTicks(swell) {
    const requiredHits = swell.requiredHits;

    for (let hit = 0; hit < requiredHits; ++hit) {
      const tick = new SwellTick();

      tick.startTime = swell.startTime;
      tick.hitType = swell.hitType;
      tick.hitSound = swell.hitSound;
      tick.samples = swell.samples;
      yield tick;
    }
  }
}

class DrumRoll extends TaikoStrongHitObject {
  constructor() {
    super(...arguments);
    this.tickInterval = 100;
    this.tickRate = 1;
    this.velocity = 1;
    this.duration = 0;
    this.path = new SliderPath();
    this.nodeSamples = [];
    this.repeats = 0;
    this.hitWindows = TaikoHitWindows.empty;
  }
  get distance() {
    return this.path.distance;
  }
  set distance(value) {
    this.path.distance = value;
  }
  get spans() {
    return this.repeats + 1;
  }
  get spanDuration() {
    return this.duration / this.spans;
  }
  get endTime() {
    return this.startTime + this.duration;
  }
  set endTime(value) {
    this.duration = value - this.startTime;
  }
  applyDefaultsToSelf(controlPoints, difficulty) {
    super.applyDefaultsToSelf(controlPoints, difficulty);

    const timingPoint = controlPoints.timingPointAt(this.startTime);
    const difficultyPoint = controlPoints.difficultyPointAt(this.startTime);
    const scoringDistance = DrumRoll.BASE_DISTANCE
            * difficulty.sliderMultiplier * difficultyPoint.sliderVelocity;

    this.velocity = scoringDistance / timingPoint.beatLength;
    this.tickInterval = timingPoint.beatLength / this.tickRate;
  }
  createNestedHitObjects() {
    this.nestedHitObjects = [];

    for (const nested of TaikoEventGenerator.generateDrumRollTicks(this)) {
      this.nestedHitObjects.push(nested);
    }
  }
  clone() {
    const cloned = super.clone();

    cloned.nodeSamples = this.nodeSamples.map((n) => n.map((s) => s.clone()));
    cloned.velocity = this.velocity;
    cloned.repeats = this.repeats;
    cloned.path = this.path.clone();
    cloned.tickRate = this.tickRate;
    cloned.tickInterval = this.tickInterval;
    cloned.duration = this.duration;

    return cloned;
  }
}
DrumRoll.BASE_DISTANCE = 100;

class Hit extends TaikoStrongHitObject {
  get isRim() {
    return !!this.samples.find((s) => {
      return s.hitSound === HitSound[HitSound.Clap]
                || s.hitSound === HitSound[HitSound.Whistle];
    });
  }
}

class Swell extends TaikoHitObject {
  constructor() {
    super(...arguments);
    this.requiredHits = 10;
    this.endTime = 0;
    this.hitWindows = TaikoHitWindows.empty;
  }
  get duration() {
    return this.endTime - this.startTime;
  }
  set duration(value) {
    this.endTime = this.startTime + value;
  }
  createNestedHitObjects() {
    this.nestedHitObjects = [];

    for (const nested of TaikoEventGenerator.generateSwellTicks(this)) {
      this.nestedHitObjects.push(nested);
    }
  }
  clone() {
    const cloned = super.clone();

    cloned.endTime = this.endTime;
    cloned.requiredHits = this.requiredHits;

    return cloned;
  }
}

class TaikoBeatmap extends RulesetBeatmap {
  constructor() {
    super(...arguments);
    this.mods = new TaikoModCombination();
    this.hitObjects = [];
  }
  get mode() {
    return 1;
  }
  get maxCombo() {
    return this.hitObjects.reduce((combo, obj) => {
      return obj instanceof Hit ? combo + 1 : combo;
    }, 0);
  }
  get hits() {
    return this.hitObjects.filter((h) => h instanceof Hit);
  }
  get drumRolls() {
    return this.hitObjects.filter((h) => h instanceof DrumRoll);
  }
  get swells() {
    return this.hitObjects.filter((h) => h instanceof Swell);
  }
}

class TaikoBeatmapConverter extends BeatmapConverter {
  constructor() {
    super(...arguments);
    this.isForCurrentRuleset = true;
    this.isForManiaRuleset = false;
    this.taikoDistance = 0;
    this.taikoDuration = 0;
    this.tickDistance = 0;
    this.tickInterval = 0;
  }
  canConvert(_) {
    return true;
  }
  convertBeatmap(original) {
    this.isForCurrentRuleset = original.originalMode === 1;
    this.isForManiaRuleset = original.originalMode === 3;

    const converted = super.convertBeatmap(original);

    converted.difficulty.sliderMultiplier *= TaikoBeatmapConverter.VELOCITY_MULTIPLIER;

    if (this.isForManiaRuleset) {
      const groups = {};

      converted.hitObjects.forEach((hitObject) => {
        const key = hitObject.startTime;

        if (!groups[key]) {
          groups[key] = [];
        }

        groups[key].push(hitObject);
      });

      const grouped = Object.values(groups);

      converted.hitObjects = grouped.map((hitObjects) => {
        const first = hitObjects[0];

        if (hitObjects.length > 1 && first instanceof TaikoStrongHitObject) {
          first.isStrong = true;
        }

        return first;
      });
    }

    return converted;
  }
  *convertHitObjects(beatmap) {
    const hitObjects = beatmap.hitObjects;

    for (const hitObject of hitObjects) {
      if (hitObject instanceof TaikoHitObject) {
        yield hitObject;
        continue;
      }

      for (const converted of this._convertHitObject(hitObject, beatmap)) {
        yield converted;
      }
    }
  }
  _convertHitObject(hitObject, beatmap) {
    const slidable = hitObject;
    const spinnable = hitObject;

    if (slidable.path) {
      return this._convertSlidableObject(slidable, beatmap);
    }

    if (typeof spinnable.endTime === 'number') {
      return this._convertSpinnableObject(spinnable, beatmap);
    }

    return this._convertHittableObject(hitObject);
  }
  *_convertHittableObject(hittable) {
    const converted = new Hit();

    converted.startTime = hittable.startTime;
    converted.hitType = HitType.Normal | (hittable.hitType & HitType.NewCombo);
    converted.hitSound = hittable.hitSound;
    converted.samples = hittable.samples;
    yield converted;
  }
  *_convertSlidableObject(slidable, beatmap) {
    if (this._shouldConvertToHits(slidable, beatmap)) {
      const allSamples = slidable.nodeSamples;
      let sampleIndex = 0;
      let time = slidable.startTime;
      const endTime = time + this.taikoDuration + this.tickInterval / 8;

      while (time <= endTime) {
        const hit = new Hit();

        hit.startTime = time;
        hit.samples = allSamples[sampleIndex];
        hit.hitType = HitType.Normal;
        hit.hitSound = hit.samples.reduce((s, h) => {
          return s + HitSound[h.hitSound];
        }, 0);

        yield hit;
        sampleIndex = (sampleIndex + 1) % allSamples.length;

        if (this.tickInterval < 1e-7) {
          break;
        }

        time += this.tickInterval;
      }
    }
    else {
      const sliderTickRate = beatmap.difficulty.sliderTickRate;
      const drumRoll = new DrumRoll();

      drumRoll.duration = this.taikoDuration;
      drumRoll.tickRate = sliderTickRate === 3 ? 3 : 4;
      drumRoll.startTime = slidable.startTime;
      drumRoll.hitType = HitType.Slider | (slidable.hitType & HitType.NewCombo);
      drumRoll.hitSound = slidable.hitSound;
      drumRoll.samples = slidable.samples;
      yield drumRoll;
    }
  }
  *_convertSpinnableObject(spinnable, beatmap) {
    const baseOD = beatmap.difficulty.overallDifficulty;
    const difficultyRange = BeatmapDifficultySection.range(baseOD, 3, 5, 7.5);
    const hitMultiplier = TaikoBeatmapConverter.SWELL_HIT_MULTIPLIER * difficultyRange;
    const swell = new Swell();

    swell.startTime = spinnable.startTime;
    swell.hitType = HitType.Spinner | (spinnable.hitType & HitType.NewCombo);
    swell.hitSound = spinnable.hitSound;
    swell.samples = spinnable.samples;
    swell.requiredHits = Math.trunc(Math.max(1, (swell.duration / 1000) * hitMultiplier));
    yield swell;
  }
  _shouldConvertToHits(slidable, beatmap) {
    const timingPoint = beatmap.controlPoints.timingPointAt(slidable.startTime);
    const difficultyPoint = beatmap.controlPoints.difficultyPointAt(slidable.startTime);
    let beatLength = difficultyPoint.isLegacy
      ? timingPoint.beatLength * difficultyPoint.bpmMultiplier
      : timingPoint.beatLength / difficultyPoint.sliderVelocity;
    const sliderMultiplier = beatmap.difficulty.sliderMultiplier *
            TaikoBeatmapConverter.VELOCITY_MULTIPLIER;
    const sliderTickRate = beatmap.difficulty.sliderTickRate;
    const sliderScoringPointDistance = (sliderMultiplier / sliderTickRate) *
            TaikoBeatmapConverter.BASE_SCORING_DISTANCE;
    const spans = slidable.repeats + 1 || 1;

    this.taikoDistance = slidable.distance * spans
            * TaikoBeatmapConverter.VELOCITY_MULTIPLIER;

    const taikoVelocity = sliderScoringPointDistance * sliderTickRate;

    this.taikoDuration = Math.trunc((this.taikoDistance / taikoVelocity) * beatLength);

    if (this.isForCurrentRuleset) {
      this.tickInterval = 0;

      return false;
    }

    const osuVelocity = taikoVelocity * 1000 / beatLength;
    let tickMultiplier = 1;

    if (beatmap.fileFormat >= 8) {
      beatLength = timingPoint.beatLength;
      tickMultiplier = 1 / difficultyPoint.sliderVelocity;
    }

    this.tickDistance = (sliderScoringPointDistance / sliderTickRate) * tickMultiplier;
    this.tickInterval = Math.min(beatLength / sliderTickRate, this.taikoDuration / spans);

    return (this.tickInterval > 0 && (this.taikoDistance / osuVelocity) * 1000 < 2 * beatLength);
  }
  createBeatmap() {
    return new TaikoBeatmap();
  }
}
TaikoBeatmapConverter.VELOCITY_MULTIPLIER = Math.fround(1.4);
TaikoBeatmapConverter.BASE_SCORING_DISTANCE = 100;
TaikoBeatmapConverter.SWELL_HIT_MULTIPLIER = Math.fround(1.65);

class TaikoBeatmapProcessor extends BeatmapProcessor {
}

class TaikoDifficultyAttributes extends DifficultyAttributes {
  constructor() {
    super(...arguments);
    this.staminaDifficulty = 0;
    this.rhythmDifficulty = 0;
    this.colourDifficulty = 0;
    this.peakDifficulty = 0;
    this.greatHitWindow = 0;
  }
}

class TaikoPerformanceAttributes extends PerformanceAttributes {
  constructor(mods, totalPerformance) {
    super(mods, totalPerformance);
    this.difficultyPerformance = 0;
    this.accuracyPerformance = 0;
    this.effectiveMissCount = 0;
    this.mods = mods;
  }
}

class AlternatingMonoPattern {
  constructor() {
    this.monoStreaks = [];
    this.index = 0;
  }
  get firstHitObject() {
    return this.monoStreaks[0].firstHitObject;
  }
  isRepetitionOf(other) {
    return this.hasIdenticalMonoLength(other) &&
            other.monoStreaks.length === this.monoStreaks.length &&
            other.monoStreaks[0].isRim === this.monoStreaks[0].isRim;
  }
  hasIdenticalMonoLength(other) {
    return other.monoStreaks[0].runLength === this.monoStreaks[0].runLength;
  }
}

class MonoStreak {
  constructor() {
    this.hitObjects = [];
    this.index = 0;
  }
  get firstHitObject() {
    return this.hitObjects[0];
  }
  get isRim() {
    let _a;

    return (_a = this.hitObjects[0].baseObject) === null || _a === void 0 ? void 0 : _a.isRim;
  }
  get runLength() {
    return this.hitObjects.length;
  }
}

class RepeatingHitPatterns {
  constructor(previous) {
    this.alternatingMonoPatterns = [];
    this.previous = null;
    this._repetitionInterval = RepeatingHitPatterns.MAX_REPETITION_INTERVAL + 1;
    this.previous = previous;
  }
  get firstHitObject() {
    return this.alternatingMonoPatterns[0].firstHitObject;
  }
  get repetitionInterval() {
    return this._repetitionInterval;
  }
  set repetitionInterval(value) {
    this._repetitionInterval = value;
  }
  _isRepetitionOf(other) {
    if (this.alternatingMonoPatterns.length !== other.alternatingMonoPatterns.length) {
      return false;
    }

    const length = Math.min(this.alternatingMonoPatterns.length, 2);

    for (let i = 0; i < length; ++i) {
      if (!this.alternatingMonoPatterns[i].hasIdenticalMonoLength(other.alternatingMonoPatterns[i])) {
        return false;
      }
    }

    return true;
  }
  findRepetitionInterval() {
    const MAX_REPETITION_INTERVAL = RepeatingHitPatterns.MAX_REPETITION_INTERVAL;

    if (this.previous === null) {
      this.repetitionInterval = MAX_REPETITION_INTERVAL + 1;

      return;
    }

    let other = this.previous;
    let interval = 1;

    while (interval < MAX_REPETITION_INTERVAL) {
      if (this._isRepetitionOf(other)) {
        this.repetitionInterval = Math.min(interval, MAX_REPETITION_INTERVAL);

        return;
      }

      other = other.previous;

      if (other === null) {
        break;
      }

      ++interval;
    }

    this.repetitionInterval = MAX_REPETITION_INTERVAL + 1;
  }
}
RepeatingHitPatterns.MAX_REPETITION_INTERVAL = 16;

class TaikoColourDifficultyPreprocessor {
  static processAndAssign(hitObjects) {
    const hitPatterns = this._encode(hitObjects);

    for (const repeatingHitPattern of hitPatterns) {
      repeatingHitPattern.firstHitObject.colour.repeatingHitPattern = repeatingHitPattern;

      const length = repeatingHitPattern.alternatingMonoPatterns.length;

      for (let i = 0; i < length; ++i) {
        const monoPattern = repeatingHitPattern.alternatingMonoPatterns[i];

        monoPattern.parent = repeatingHitPattern;
        monoPattern.index = i;
        monoPattern.firstHitObject.colour.alternatingMonoPattern = monoPattern;

        for (let j = 0; j < monoPattern.monoStreaks.length; ++j) {
          const monoStreak = monoPattern.monoStreaks[j];

          monoStreak.parent = monoPattern;
          monoStreak.index = j;
          monoStreak.firstHitObject.colour.monoStreak = monoStreak;
        }
      }
    }
  }
  static _encode(data) {
    const monoStreaks = this._encodeMonoStreak(data);
    const alternatingMonoPatterns = this._encodeAlternatingMonoPattern(monoStreaks);
    const repeatingHitPatterns = this._encodeRepeatingHitPattern(alternatingMonoPatterns);

    return repeatingHitPatterns;
  }
  static _encodeMonoStreak(data) {
    const monoStreaks = [];
    let currentMonoStreak = null;

    for (let i = 0; i < data.length; ++i) {
      const taikoObject = data[i];
      const previousObject = taikoObject.previousNote(0);
      const baseHit = taikoObject.baseObject;
      const previousHit = previousObject === null || previousObject === void 0 ? void 0 : previousObject.baseObject;

      if (currentMonoStreak === null ||
                previousObject === null ||
                (baseHit === null || baseHit === void 0 ? void 0 : baseHit.isRim) !== (previousHit === null || previousHit === void 0 ? void 0 : previousHit.isRim)) {
        currentMonoStreak = new MonoStreak();
        monoStreaks.push(currentMonoStreak);
      }

      currentMonoStreak.hitObjects.push(taikoObject);
    }

    return monoStreaks;
  }
  static _encodeAlternatingMonoPattern(data) {
    const monoPatterns = [];
    let currentMonoPattern = null;

    for (let i = 0; i < data.length; ++i) {
      if (currentMonoPattern === null || data[i].runLength !== data[i - 1].runLength) {
        currentMonoPattern = new AlternatingMonoPattern();
        monoPatterns.push(currentMonoPattern);
      }

      currentMonoPattern.monoStreaks.push(data[i]);
    }

    return monoPatterns;
  }
  static _encodeRepeatingHitPattern(data) {
    const hitPatterns = [];
    let currentHitPattern = null;

    for (let i = 0; i < data.length; ++i) {
      currentHitPattern = new RepeatingHitPatterns(currentHitPattern);

      let isCoupled = i < data.length - 2 && data[i].isRepetitionOf(data[i + 2]);

      if (!isCoupled) {
        currentHitPattern.alternatingMonoPatterns.push(data[i]);
      }
      else {
        while (isCoupled) {
          currentHitPattern.alternatingMonoPatterns.push(data[i]);
          i++;
          isCoupled = i < data.length - 2 && data[i].isRepetitionOf(data[i + 2]);
        }

        currentHitPattern.alternatingMonoPatterns.push(data[i]);
        currentHitPattern.alternatingMonoPatterns.push(data[i + 1]);
        i++;
      }

      hitPatterns.push(currentHitPattern);
    }

    for (let i = 0; i < hitPatterns.length; ++i) {
      hitPatterns[i].findRepetitionInterval();
    }

    return hitPatterns;
  }
}

class TaikoDifficultyHitObjectColour {
  constructor() {
    this.monoStreak = null;
    this.alternatingMonoPattern = null;
    this.repeatingHitPattern = null;
  }
}

class TaikoDifficultyHitObjectRhythm {
  constructor(numerator, denominator, difficulty) {
    this.ratio = numerator / denominator;
    this.difficulty = difficulty;
  }
}

class TaikoDifficultyHitObject extends DifficultyHitObject {
  constructor(hitObject, lastObject, lastLastObject, clockRate, objects, centreHitObjects, rimHitObjects, noteObjects, index) {
    super(hitObject, lastObject, clockRate, objects, index);
    this._noteDifficultyHitObjects = noteObjects;
    this.colour = new TaikoDifficultyHitObjectColour();
    this.rhythm = this._getClosestRhythm(lastObject, lastLastObject, clockRate);

    const taikoHit = hitObject;

    if ((taikoHit === null || taikoHit === void 0 ? void 0 : taikoHit.isRim) === true) {
      this.monoIndex = rimHitObjects.length;
      rimHitObjects.push(this);
      this._monoDifficultyHitObjects = rimHitObjects;
    }
    else if ((taikoHit === null || taikoHit === void 0 ? void 0 : taikoHit.isRim) === false) {
      this.monoIndex = centreHitObjects.length;
      centreHitObjects.push(this);
      this._monoDifficultyHitObjects = centreHitObjects;
    }
    else {
      this.monoIndex = 0;
      this._monoDifficultyHitObjects = [];
    }

    if (hitObject instanceof Hit) {
      this.noteIndex = noteObjects.length;
      noteObjects.push(this);
    }
    else {
      this.noteIndex = 0;
    }
  }
  _getClosestRhythm(lastObject, lastLastObject, clockRate) {
    const prevLength = (lastObject.startTime - lastLastObject.startTime) / clockRate;
    const ratio = this.deltaTime / prevLength;

    return TaikoDifficultyHitObject.COMMON_RHYTHMS.slice()
      .sort((a, b) => Math.abs(a.ratio - ratio) - Math.abs(b.ratio - ratio))[0];
  }
  previousMono(backwardsIndex) {
    let _a, _b;
    const index = this.monoIndex - (backwardsIndex + 1);

    return (_b = (_a = this._monoDifficultyHitObjects) === null || _a === void 0 ? void 0 : _a[index]) !== null && _b !== void 0 ? _b : null;
  }
  nextMono(forwardsIndex) {
    let _a, _b;
    const index = this.monoIndex + (forwardsIndex + 1);

    return (_b = (_a = this._monoDifficultyHitObjects) === null || _a === void 0 ? void 0 : _a[index]) !== null && _b !== void 0 ? _b : null;
  }
  previousNote(backwardsIndex) {
    let _a;
    const index = this.noteIndex - (backwardsIndex + 1);

    return (_a = this._noteDifficultyHitObjects[index]) !== null && _a !== void 0 ? _a : null;
  }
  nextNote(forwardsIndex) {
    let _a;
    const index = this.noteIndex + (forwardsIndex + 1);

    return (_a = this._noteDifficultyHitObjects[index]) !== null && _a !== void 0 ? _a : null;
  }
}
TaikoDifficultyHitObject.COMMON_RHYTHMS = [
  new TaikoDifficultyHitObjectRhythm(1, 1, 0.0),
  new TaikoDifficultyHitObjectRhythm(2, 1, 0.3),
  new TaikoDifficultyHitObjectRhythm(1, 2, 0.5),
  new TaikoDifficultyHitObjectRhythm(3, 1, 0.3),
  new TaikoDifficultyHitObjectRhythm(1, 3, 0.35),
  new TaikoDifficultyHitObjectRhythm(3, 2, 0.6),
  new TaikoDifficultyHitObjectRhythm(2, 3, 0.4),
  new TaikoDifficultyHitObjectRhythm(5, 4, 0.5),
  new TaikoDifficultyHitObjectRhythm(4, 5, 0.7),
];

class ColourEvaluator {
  static _sigmoid(val, center, width, middle, height) {
    const sigmoid = Math.tanh(Math.E * -(val - center) / width);

    return sigmoid * (height / 2) + middle;
  }
  static evaluateDifficultyOfMono(monoStreak) {
    return this._sigmoid(monoStreak.index, 2, 2, 0.5, 1)
            * this.evaluateDifficultyOfAlternate(monoStreak.parent) * 0.5;
  }
  static evaluateDifficultyOfAlternate(alternatingMonoPattern) {
    return this._sigmoid(alternatingMonoPattern.index, 2, 2, 0.5, 1)
            * this.evaluateDifficultyOfRepeat(alternatingMonoPattern.parent);
  }
  static evaluateDifficultyOfRepeat(repeatingHitPattern) {
    return 2 * (1 - this._sigmoid(repeatingHitPattern.repetitionInterval, 2, 2, 0.5, 1));
  }
  static evaluateDifficultyOf(hitObject) {
    const colour = hitObject.colour;
    let difficulty = 0;

    if ((colour === null || colour === void 0 ? void 0 : colour.monoStreak) !== null) {
      difficulty += this.evaluateDifficultyOfMono(colour.monoStreak);
    }

    if ((colour === null || colour === void 0 ? void 0 : colour.alternatingMonoPattern) !== null) {
      difficulty += this.evaluateDifficultyOfAlternate(colour.alternatingMonoPattern);
    }

    if ((colour === null || colour === void 0 ? void 0 : colour.repeatingHitPattern) !== null) {
      difficulty += this.evaluateDifficultyOfRepeat(colour.repeatingHitPattern);
    }

    return difficulty;
  }
}

class StaminaEvaluator {
  static _speedBonus(interval) {
    interval = Math.max(interval, 50);

    return 30 / interval;
  }
  static evaluateDifficultyOf(current) {
    if (!(current.baseObject instanceof Hit)) {
      return 0;
    }

    const taikoCurrent = current;
    const keyPrevious = taikoCurrent.previousMono(1);

    if (keyPrevious === null) {
      return 0;
    }

    let objectStrain = 0.5;

    objectStrain += this._speedBonus(taikoCurrent.startTime - keyPrevious.startTime);

    return objectStrain;
  }
}

class Colour extends StrainDecaySkill {
  constructor() {
    super(...arguments);
    this._skillMultiplier = 0.12;
    this._strainDecayBase = 0.8;
  }
  _strainValueOf(current) {
    return ColourEvaluator.evaluateDifficultyOf(current);
  }
}

class Rhythm extends StrainDecaySkill {
  constructor() {
    super(...arguments);
    this._skillMultiplier = 10;
    this._strainDecayBase = 0;
    this._rhythmHistory = new LimitedCapacityQueue(Rhythm.RHYTHM_HISTORY_MAX_LENGTH);
    this._currentRhythmStrain = 0;
    this._notesSinceRhythmChange = 0;
  }
  _strainValueOf(current) {
    if (!(current.baseObject instanceof Hit)) {
      this._resetRhythmAndStrain();

      return 0;
    }

    this._currentRhythmStrain *= Rhythm.STRAIN_DECAY;

    const hitObject = current;

    this._notesSinceRhythmChange += 1;

    if (hitObject.rhythm.difficulty === 0) {
      return 0;
    }

    let objectStrain = hitObject.rhythm.difficulty;

    objectStrain *= this._repetitionPenalties(hitObject);
    objectStrain *= Rhythm._patternLengthPenalty(this._notesSinceRhythmChange);
    objectStrain *= this._speedPenalty(hitObject.deltaTime);
    this._notesSinceRhythmChange = 0;
    this._currentRhythmStrain += objectStrain;

    return this._currentRhythmStrain;
  }
  _repetitionPenalties(hitObject) {
    let penalty = 1;

    this._rhythmHistory.enqueue(hitObject);

    for (let mostRecentPatternsToCompare = 2; mostRecentPatternsToCompare <= Rhythm.RHYTHM_HISTORY_MAX_LENGTH / 2; mostRecentPatternsToCompare++) {
      const startIndex = this._rhythmHistory.count - mostRecentPatternsToCompare - 1;

      for (let start = startIndex; start >= 0; start--) {
        if (!this._samePattern(start, mostRecentPatternsToCompare)) {
          continue;
        }

        const notesSince = hitObject.index - this._rhythmHistory.get(start).index;

        penalty *= Rhythm._repetitionPenalty(notesSince);
        break;
      }
    }

    return penalty;
  }
  _samePattern(start, mostRecentPatternsToCompare) {
    for (let i = 0; i < mostRecentPatternsToCompare; i++) {
      const firstRhythm = this._rhythmHistory.get(start + i).rhythm;
      const secondRhythm = this._rhythmHistory.get(this._rhythmHistory.count - mostRecentPatternsToCompare + i).rhythm;

      if (firstRhythm !== secondRhythm) {
        return false;
      }
    }

    return true;
  }
  static _repetitionPenalty(notesSince) {
    return Math.min(1.0, 0.032 * notesSince);
  }
  static _patternLengthPenalty(patternLength) {
    const shortPatternPenalty = Math.min(0.15 * patternLength, 1.0);
    const longPatternPenalty = MathUtils.clamp01(2.5 - 0.15 * patternLength);

    return Math.min(shortPatternPenalty, longPatternPenalty);
  }
  _speedPenalty(deltaTime) {
    if (deltaTime < 80) {
      return 1;
    }

    if (deltaTime < 210) {
      return Math.max(0, 1.4 - 0.005 * deltaTime);
    }

    this._resetRhythmAndStrain();

    return 0;
  }
  _resetRhythmAndStrain() {
    this._currentRhythmStrain = 0.0;
    this._notesSinceRhythmChange = 0;
  }
}
Rhythm.STRAIN_DECAY = 0.96;
Rhythm.RHYTHM_HISTORY_MAX_LENGTH = 8;

class Stamina extends StrainDecaySkill {
  constructor() {
    super(...arguments);
    this._skillMultiplier = 1.1;
    this._strainDecayBase = 0.4;
  }
  _strainValueOf(current) {
    return StaminaEvaluator.evaluateDifficultyOf(current);
  }
}

let _a;

class Peaks extends Skill {
  constructor(mods) {
    super(mods);
    this.rhythm = new Rhythm(mods);
    this.colour = new Colour(mods);
    this.stamina = new Stamina(mods);
  }
  get colourDifficultyValue() {
    return this.colour.difficultyValue * Peaks.COLOUR_SKILL_MULTIPLIER;
  }
  get rhythmDifficultyValue() {
    return this.rhythm.difficultyValue * Peaks.RHYTHM_SKILL_MULTIPLIER;
  }
  get staminaDifficultyValue() {
    return this.stamina.difficultyValue * Peaks.STAMINA_SKILL_MULTIPLIER;
  }
  _norm(p, ...values) {
    const sum = values.reduce((sum, x) => sum + Math.pow(x, p), 0);

    return Math.pow(sum, 1 / p);
  }
  process(current) {
    this.rhythm.process(current);
    this.colour.process(current);
    this.stamina.process(current);
  }
  get difficultyValue() {
    const peaks = [];
    const colourPeaks = [...this.colour.getCurrentStrainPeaks()];
    const rhythmPeaks = [...this.rhythm.getCurrentStrainPeaks()];
    const staminaPeaks = [...this.stamina.getCurrentStrainPeaks()];

    for (let i = 0; i < colourPeaks.length; ++i) {
      const colourPeak = colourPeaks[i] * Peaks.COLOUR_SKILL_MULTIPLIER;
      const rhythmPeak = rhythmPeaks[i] * Peaks.RHYTHM_SKILL_MULTIPLIER;
      const staminaPeak = staminaPeaks[i] * Peaks.STAMINA_SKILL_MULTIPLIER;
      let peak = this._norm(1.5, colourPeak, staminaPeak);

      peak = this._norm(2, peak, rhythmPeak);

      if (peak > 0) {
        peaks.push(peak);
      }
    }

    let difficulty = 0;
    let weight = 1;

    for (const strain of peaks.sort((a, b) => b - a)) {
      difficulty += strain * weight;
      weight *= 0.9;
    }

    return difficulty;
  }
}
_a = Peaks;
Peaks.FINAL_MULTIPLIER = 0.0625;
Peaks.RHYTHM_SKILL_MULTIPLIER = 0.2 * _a.FINAL_MULTIPLIER;
Peaks.COLOUR_SKILL_MULTIPLIER = 0.375 * _a.FINAL_MULTIPLIER;
Peaks.STAMINA_SKILL_MULTIPLIER = 0.375 * _a.FINAL_MULTIPLIER;

class TaikoDifficultyCalculator extends DifficultyCalculator {
  _createSkills(_, mods) {
    return [
      new Peaks(mods),
    ];
  }
  get difficultyMods() {
    return [
      new TaikoDoubleTime(),
      new TaikoHalfTime(),
      new TaikoEasy(),
      new TaikoHardRock(),
    ];
  }
  _createDifficultyHitObjects(beatmap, clockRate) {
    const difficultyObjects = [];
    const centreObjects = [];
    const rimObjects = [];
    const noteObjects = [];

    for (let i = 2; i < beatmap.hitObjects.length; ++i) {
      const hitObject = beatmap.hitObjects[i];
      const lastObject = beatmap.hitObjects[i - 1];
      const lastLastObject = beatmap.hitObjects[i - 2];
      const difficultyObject = new TaikoDifficultyHitObject(hitObject, lastObject, lastLastObject, clockRate, difficultyObjects, centreObjects, rimObjects, noteObjects, difficultyObjects.length);

      difficultyObjects.push(difficultyObject);
    }

    TaikoColourDifficultyPreprocessor.processAndAssign(difficultyObjects);

    return difficultyObjects;
  }
  _createDifficultyAttributes(beatmap, mods, skills, clockRate) {
    if (beatmap.hitObjects.length === 0) {
      return new TaikoDifficultyAttributes(mods, 0);
    }

    const combined = skills[0];
    const multiplier = TaikoDifficultyCalculator.DIFFICULTY_MULTIPLIER;
    const colourRating = combined.colourDifficultyValue * multiplier;
    const rhythmRating = combined.rhythmDifficultyValue * multiplier;
    const staminaRating = combined.staminaDifficultyValue * multiplier;
    const combinedRating = combined.difficultyValue * multiplier;
    let starRating = this._rescale(combinedRating * 1.4);

    if (beatmap.originalMode === 0) {
      starRating *= 0.925;

      if (colourRating < 2 && staminaRating > 8) {
        starRating *= 0.8;
      }
    }

    const hitWindows = new TaikoHitWindows();

    hitWindows.setDifficulty(beatmap.difficulty.overallDifficulty);

    const attributes = new TaikoDifficultyAttributes(mods, starRating);

    attributes.staminaDifficulty = staminaRating;
    attributes.rhythmDifficulty = rhythmRating;
    attributes.colourDifficulty = colourRating;
    attributes.peakDifficulty = combinedRating;
    attributes.greatHitWindow = hitWindows.windowFor(HitResult.Great) / clockRate;
    attributes.maxCombo = beatmap.hitObjects.reduce((s, c) => s + (c instanceof Hit ? 1 : 0), 0);

    return attributes;
  }
  static _simpleColourPenalty(staminaDifficulty, colorDifficulty) {
    if (colorDifficulty <= 0) {
      return 0.79 - 0.25;
    }

    return 0.79 - Math.atan(staminaDifficulty / colorDifficulty - 12) / Math.PI / 2;
  }
  _rescale(sr) {
    if (sr < 0) {
      return sr;
    }

    return 10.43 * Math.log(sr / 8 + 1);
  }
}
TaikoDifficultyCalculator.DIFFICULTY_MULTIPLIER = 1.35;

class TaikoPerformanceCalculator extends PerformanceCalculator {
  constructor(ruleset, attributes, score) {
    super(ruleset, attributes, score);
    this._mods = new TaikoModCombination();
    this._countGreat = 0;
    this._countOk = 0;
    this._countMeh = 0;
    this._countMiss = 0;
    this._accuracy = 1;
    this._effectiveMissCount = 0;
    this.attributes = attributes;
    this._addParams(attributes, score);
  }
  calculateAttributes(attributes, score) {
    this._addParams(attributes, score);

    if (!this.attributes) {
      return new TaikoPerformanceAttributes(this._mods, 0);
    }

    let multiplier = 1.13;

    if (this._mods.any(TaikoHidden)) {
      multiplier *= 1.075;
    }

    if (this._mods.any(TaikoEasy)) {
      multiplier *= 0.975;
    }

    const difficultyValue = this._computeDifficultyValue();
    const accuracyValue = this._computeAccuracyValue();
    const totalValue = Math.pow(Math.pow(difficultyValue, 1.1) +
            Math.pow(accuracyValue, 1.1), 1 / 1.1) * multiplier;
    const performance = new TaikoPerformanceAttributes(this._mods, totalValue);

    performance.difficultyPerformance = difficultyValue;
    performance.accuracyPerformance = accuracyValue;

    return performance;
  }
  _computeDifficultyValue() {
    const max = Math.max(1, this.attributes.starRating / 0.115);
    let difficultyValue = Math.pow(5 * max - 4, 2.25) / 1150;
    const lengthBonus = 1 + 0.1 * Math.min(1, this._totalHits / 1500);

    difficultyValue *= lengthBonus;
    difficultyValue *= Math.pow(0.986, this._effectiveMissCount);

    if (this._mods.any(TaikoEasy)) {
      difficultyValue *= 0.985;
    }

    if (this._mods.any(TaikoHidden)) {
      difficultyValue *= 1.025;
    }

    if (this._mods.any(TaikoHardRock)) {
      difficultyValue *= 1.05;
    }

    if (this._mods.any(TaikoFlashlight)) {
      difficultyValue *= 1.05 * lengthBonus;
    }

    return difficultyValue * Math.pow(this._accuracy, 2);
  }
  _computeAccuracyValue() {
    if (this.attributes.greatHitWindow <= 0) {
      return 0;
    }

    let accuracyValue = Math.pow(60 / this.attributes.greatHitWindow, 1.1)
            * Math.pow(this._accuracy, 8)
            * Math.pow(this.attributes.starRating, 0.4) * 27;
    const lengthBonus = Math.min(1.15, Math.pow(this._totalHits / 1500, 0.3));

    accuracyValue *= lengthBonus;

    if (this._mods.any(TaikoFlashlight) && this._mods.any(TaikoHidden)) {
      accuracyValue *= Math.max(1.05, 1.075 * lengthBonus);
    }

    return accuracyValue;
  }
  _addParams(attributes, score) {
    let _a, _b, _c, _d, _e, _f;

    if (score) {
      this._mods = (_a = score === null || score === void 0 ? void 0 : score.mods) !== null && _a !== void 0 ? _a : new TaikoModCombination();
      this._countGreat = (_b = score.statistics.get(HitResult.Great)) !== null && _b !== void 0 ? _b : this._countGreat;
      this._countOk = (_c = score.statistics.get(HitResult.Ok)) !== null && _c !== void 0 ? _c : this._countOk;
      this._countMeh = (_d = score.statistics.get(HitResult.Meh)) !== null && _d !== void 0 ? _d : this._countMeh;
      this._countMiss = (_e = score.statistics.get(HitResult.Miss)) !== null && _e !== void 0 ? _e : this._countMiss;
      this._accuracy = (_f = score.accuracy) !== null && _f !== void 0 ? _f : this._accuracy;
    }

    if (this._totalSuccessfulHits > 0) {
      this._effectiveMissCount = Math.max(1, 1000 / this._totalSuccessfulHits) * this._countMiss;
    }

    if (attributes) {
      this.attributes = attributes;
    }
  }
  get _totalHits() {
    return this._countGreat + this._countOk + this._countMeh + this._countMiss;
  }
  get _totalSuccessfulHits() {
    return this._countGreat + this._countOk + this._countMeh;
  }
}

let TaikoAction;

(function(TaikoAction) {
  TaikoAction[TaikoAction['LeftRim'] = 0] = 'LeftRim';
  TaikoAction[TaikoAction['LeftCentre'] = 1] = 'LeftCentre';
  TaikoAction[TaikoAction['RightCentre'] = 2] = 'RightCentre';
  TaikoAction[TaikoAction['RightRim'] = 3] = 'RightRim';
})(TaikoAction || (TaikoAction = {}));

class TaikoReplayFrame extends ReplayFrame {
  constructor() {
    super(...arguments);
    this.actions = new Set();
  }
  fromLegacy(currentFrame) {
    this.startTime = currentFrame.startTime;
    this.interval = currentFrame.interval;

    if (currentFrame.mouseRight1) {
      this.actions.add(TaikoAction.LeftRim);
    }

    if (currentFrame.mouseRight2) {
      this.actions.add(TaikoAction.RightRim);
    }

    if (currentFrame.mouseLeft1) {
      this.actions.add(TaikoAction.LeftCentre);
    }

    if (currentFrame.mouseLeft2) {
      this.actions.add(TaikoAction.RightCentre);
    }

    return this;
  }
  toLegacy() {
    let state = ReplayButtonState.None;

    if (this.actions.has(TaikoAction.LeftRim)) {
      state |= ReplayButtonState.Right1;
    }

    if (this.actions.has(TaikoAction.RightRim)) {
      state |= ReplayButtonState.Right2;
    }

    if (this.actions.has(TaikoAction.LeftCentre)) {
      state |= ReplayButtonState.Left1;
    }

    if (this.actions.has(TaikoAction.RightCentre)) {
      state |= ReplayButtonState.Left2;
    }

    return new LegacyReplayFrame(this.startTime, this.interval, new Vector2(0, 0), state);
  }
}

class TaikoReplayConverter extends ReplayConverter {
  _createConvertibleReplayFrame() {
    return new TaikoReplayFrame();
  }
  _isConvertedReplayFrame(frame) {
    return frame instanceof TaikoReplayFrame;
  }
}

class TaikoRuleset extends Ruleset {
  get id() {
    return 1;
  }
  applyToBeatmap(beatmap) {
    return super.applyToBeatmap(beatmap);
  }
  applyToBeatmapWithMods(beatmap, mods) {
    return super.applyToBeatmapWithMods(beatmap, mods);
  }
  resetMods(beatmap) {
    return super.resetMods(beatmap);
  }
  createModCombination(input) {
    return new TaikoModCombination(input);
  }
  _createBeatmapProcessor() {
    return new TaikoBeatmapProcessor();
  }
  _createBeatmapConverter() {
    return new TaikoBeatmapConverter();
  }
  _createReplayConverter() {
    return new TaikoReplayConverter();
  }
  createDifficultyCalculator(beatmap) {
    return new TaikoDifficultyCalculator(beatmap, this);
  }
  createPerformanceCalculator(attributes, score) {
    return new TaikoPerformanceCalculator(this, attributes, score);
  }
}

export { AlternatingMonoPattern, Colour, DrumRoll, DrumRollTick, Hit, MonoStreak, Peaks, RepeatingHitPatterns, Rhythm, Stamina, Swell, SwellTick, TaikoAction, TaikoAutoplay, TaikoBeatmap, TaikoBeatmapConverter, TaikoBeatmapProcessor, TaikoCinema, TaikoColourDifficultyPreprocessor, TaikoDifficultyAttributes, TaikoDifficultyCalculator, TaikoDifficultyHitObject, TaikoDifficultyHitObjectColour, TaikoDifficultyHitObjectRhythm, TaikoDoubleTime, TaikoEasy, TaikoEventGenerator, TaikoFlashlight, TaikoHalfTime, TaikoHardRock, TaikoHidden, TaikoHitObject, TaikoHitWindows, TaikoModCombination, TaikoNightcore, TaikoNoFail, TaikoNoMod, TaikoPerfect, TaikoPerformanceAttributes, TaikoPerformanceCalculator, TaikoRelax, TaikoReplayConverter, TaikoReplayFrame, TaikoRuleset, TaikoStrongHitObject, TaikoSuddenDeath };