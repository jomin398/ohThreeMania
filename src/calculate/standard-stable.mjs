import { NoMod, NoFail, Easy, ModBitwise, ModType, Hidden, DifficultyRange, HitResult, HitWindows, HitObject, Vector2, BeatmapDifficultySection, EventGenerator, SliderEventType, SliderPath, HardRock, SuddenDeath, DoubleTime, Relax, HalfTime, Nightcore, Flashlight as Flashlight$1, Autoplay, Perfect, Cinema, ModCombination, RulesetBeatmap, BeatmapConverter, BeatmapProcessor, DifficultyAttributes, PerformanceAttributes, DifficultyHitObject, MathUtils, StrainSkill, PerformanceCalculator, DifficultyCalculator, ReplayFrame, ReplayButtonState, LegacyReplayFrame, ReplayConverter, Ruleset } from 'osu-classes';

class StandardNoMod extends NoMod {
}

class StandardNoFail extends NoFail {
}

class StandardEasy extends Easy {
}

class StandardTouchDevice {
  constructor() {
    this.name = 'Touch Device';
    this.acronym = 'TD';
    this.bitwise = ModBitwise.TouchDevice;
    this.type = ModType.System;
    this.multiplier = 1;
    this.isRanked = true;
    this.incompatibles = ModBitwise.None;
  }
}

class StandardHidden extends Hidden {
  applyToBeatmap(beatmap) {
    for (const hitObject of beatmap.hitObjects) {
      this._applyFadeAdjustments(hitObject);
    }
  }
  _applyFadeAdjustments(hitObject) {
    hitObject.timeFadeIn = hitObject.timePreempt * StandardHidden.FADE_IN_DURATION_MULTIPLIER;

    for (const nestedObject of hitObject.nestedHitObjects) {
      this._applyFadeAdjustments(nestedObject);
    }
  }
}
StandardHidden.FADE_IN_DURATION_MULTIPLIER = 0.4;
StandardHidden.FADE_OUT_DURATION_MULTIPLIER = 0.3;

class StandardHitWindows extends HitWindows {
  isHitResultAllowed(result) {
    switch (result) {
      case HitResult.Great:
      case HitResult.Ok:
      case HitResult.Meh:
      case HitResult.Miss:
        return true;
    }

    return false;
  }
  _getRanges() {
    return StandardHitWindows.OSU_RANGES;
  }
}
StandardHitWindows.OSU_RANGES = [
  new DifficultyRange(HitResult.Great, 80, 50, 20),
  new DifficultyRange(HitResult.Ok, 140, 100, 60),
  new DifficultyRange(HitResult.Meh, 200, 150, 100),
  new DifficultyRange(HitResult.Miss, 400, 400, 400),
];

class StandardHitObject extends HitObject {
  constructor() {
    super(...arguments);
    this.timePreempt = 600;
    this.timeFadeIn = 400;
    this._scale = 0.5;
    this._stackHeight = 0;
    this._stackOffset = new Vector2(0, 0);
    this.currentComboIndex = 0;
    this.comboIndex = 0;
    this.comboIndexWithOffsets = 0;
    this.comboOffset = 0;
    this.lastInCombo = false;
    this.isNewCombo = false;
    this.hitWindows = new StandardHitWindows();
  }
  get endPosition() {
    return this.startPosition;
  }
  get endX() {
    return this.endPosition.x;
  }
  set endX(value) {
    this.endPosition.x = value;
  }
  get endY() {
    return this.endPosition.y;
  }
  set endY(value) {
    this.endPosition.y = value;
  }
  get scale() {
    return this._scale;
  }
  set scale(value) {
    this._scale = value;

    const stackOffset = Math.fround(Math.fround(this._stackHeight * this._scale) * Math.fround(-6.4));

    this._stackOffset.x = this._stackOffset.y = stackOffset;
  }
  get radius() {
    return StandardHitObject.OBJECT_RADIUS * this._scale;
  }
  get stackHeight() {
    return this._stackHeight;
  }
  set stackHeight(value) {
    this._stackHeight = value;

    const stackOffset = Math.fround(Math.fround(this._stackHeight * this._scale) * Math.fround(-6.4));

    this._stackOffset.x = this._stackOffset.y = stackOffset;
    this.nestedHitObjects.forEach((n) => {
      n.stackHeight = this._stackHeight;
    });
  }
  get stackedOffset() {
    return this._stackOffset;
  }
  set stackedOffset(value) {
    this._stackOffset = value;
  }
  get stackedStartPosition() {
    return this.startPosition.fadd(this.stackedOffset);
  }
  get stackedEndPosition() {
    return this.endPosition.fadd(this.stackedOffset);
  }
  applyDefaultsToSelf(controlPoints, difficulty) {
    super.applyDefaultsToSelf(controlPoints, difficulty);
    this.timePreempt = Math.fround(BeatmapDifficultySection.range(difficulty.approachRate, 1800, 1200, 450));
    this.timeFadeIn = 400 * Math.min(1, this.timePreempt / StandardHitObject.PREEMPT_MIN);

    const scale = Math.fround(Math.fround(0.7) * Math.fround(difficulty.circleSize - 5));

    this.scale = Math.fround(Math.fround(1 - Math.fround(scale / 5)) / 2);
  }
  clone() {
    const cloned = super.clone();

    cloned.stackHeight = this.stackHeight;
    cloned.scale = this.scale;
    cloned.currentComboIndex = this.currentComboIndex;
    cloned.comboIndex = this.comboIndex;
    cloned.comboIndexWithOffsets = this.comboIndexWithOffsets;
    cloned.comboOffset = this.comboOffset;
    cloned.lastInCombo = this.lastInCombo;

    return cloned;
  }
}
StandardHitObject.OBJECT_RADIUS = 64;
StandardHitObject.BASE_SCORING_DISTANCE = 100;
StandardHitObject.PREEMPT_MIN = 450;

class Circle extends StandardHitObject {
}

class SliderHead extends Circle {
}

class SliderTick extends StandardHitObject {
  constructor() {
    super(...arguments);
    this.spanIndex = 0;
    this.spanStartTime = 0;
    this.hitWindows = StandardHitWindows.empty;
  }
  applyDefaultsToSelf(controlPoints, difficulty) {
    super.applyDefaultsToSelf(controlPoints, difficulty);

    const offset = this.spanIndex > 0 ? 200 : this.timePreempt * Math.fround(0.66);

    this.timePreempt = (this.startTime - this.spanStartTime) / 2 + offset;
  }
  clone() {
    const cloned = super.clone();

    cloned.spanIndex = this.spanIndex;
    cloned.spanStartTime = this.spanStartTime;

    return cloned;
  }
}

class SliderEnd extends Circle {
  constructor(slider) {
    super();
    this.repeatIndex = 0;
    this.hitWindows = StandardHitWindows.empty;
    this._slider = slider;
  }
  get spanDuration() {
    return this._slider.spanDuration;
  }
  applyDefaultsToSelf(controlPoints, difficulty) {
    super.applyDefaultsToSelf(controlPoints, difficulty);

    if (this.repeatIndex > 0) {
      this.timeFadeIn = 0;
      this.timePreempt = this.spanDuration * 2;

      return;
    }

    const FIRST_END_CIRCLE_PREEMPT_ADJUST = Math.fround(2 / 3);

    this.timePreempt = this.startTime - this._slider.startTime
            + this._slider.timePreempt * FIRST_END_CIRCLE_PREEMPT_ADJUST;
  }
}

class SliderRepeat extends SliderEnd {
}

class SliderTail extends SliderEnd {
}

class SpinnerTick extends StandardHitObject {
  constructor() {
    super(...arguments);
    this.hitWindows = StandardHitWindows.empty;
  }
}

class SpinnerBonusTick extends SpinnerTick {
}

class StandardEventGenerator extends EventGenerator {
  static *generateSliderTicks(slider) {
    for (const event of EventGenerator.generate(slider)) {
      const offset = slider.path.positionAt(event.progress);

      switch (event.eventType) {
        case SliderEventType.Head: {
          const head = new SliderHead();

          head.startPosition = slider.startPosition;
          head.startTime = event.startTime;
          yield head;
          break;
        }
        case SliderEventType.Repeat: {
          const repeat = new SliderRepeat(slider);

          repeat.repeatIndex = event.spanIndex;
          repeat.startTime = event.startTime;
          repeat.startPosition = slider.startPosition.fadd(offset);
          repeat.scale = slider.scale;
          yield repeat;
          break;
        }
        case SliderEventType.LegacyLastTick: {
          const tail = new SliderTail(slider);

          tail.repeatIndex = event.spanIndex;
          tail.startTime = event.startTime;
          tail.startPosition = slider.endPosition;
          yield tail;
          break;
        }
        case SliderEventType.Tick: {
          const tick = new SliderTick();

          tick.spanIndex = event.spanIndex;
          tick.spanStartTime = event.spanStartTime;
          tick.startTime = event.startTime;
          tick.startPosition = slider.startPosition.fadd(offset);
          tick.scale = slider.scale;
          yield tick;
        }
      }
    }
  }
  static *generateSpinnerTicks(spinner) {
    const totalSpins = spinner.maximumBonusSpins + spinner.spinsRequired;

    for (let i = 0; i < totalSpins; ++i) {
      const tick = i < spinner.spinsRequired
        ? new SpinnerTick()
        : new SpinnerBonusTick();

      tick.startTime = spinner.startTime + (i + 1 / totalSpins) * spinner.duration;
      yield tick;
    }
  }
}

class Slider extends StandardHitObject {
  constructor() {
    super(...arguments);
    this.tickDistance = 0;
    this.tickRate = 1;
    this.velocity = 1;
    this.lazyTravelDistance = 0;
    this.lazyTravelTime = 0;
    this.hitWindows = StandardHitWindows.empty;
    this.path = new SliderPath();
    this.nodeSamples = [];
    this.repeats = 0;
    this.startPosition = new Vector2(0, 0);
  }
  get startX() {
    this._updateHeadPosition();

    return this.startPosition.floatX;
  }
  set startX(value) {
    this.startPosition.x = value;
    this._updateHeadPosition();
  }
  get startY() {
    this._updateHeadPosition();

    return this.startPosition.floatY;
  }
  set startY(value) {
    this.startPosition.y = value;
    this._updateHeadPosition();
  }
  get endX() {
    this._updateTailPosition();

    return this.endPosition.floatX;
  }
  set endX(value) {
    this.endPosition.x = value;
    this._updateTailPosition();
  }
  get endY() {
    this._updateTailPosition();

    return this.endPosition.floatY;
  }
  set endY(value) {
    this.endPosition.y = value;
    this._updateTailPosition();
  }
  get head() {
    const obj = this.nestedHitObjects.find((n) => n instanceof SliderHead);

    return obj || null;
  }
  get tail() {
    const obj = this.nestedHitObjects.find((n) => n instanceof SliderTail);

    return obj || null;
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
  get duration() {
    return this.endTime - this.startTime;
  }
  get endPosition() {
    const endPoint = this.path.curvePositionAt(1, this.spans);

    if (isFinite(endPoint.x) && isFinite(endPoint.y)) {
      return this.startPosition.fadd(endPoint);
    }

    const controlPoints = this.path.controlPoints;

    if (controlPoints.length) {
      return controlPoints[controlPoints.length - 1].position;
    }

    return this.startPosition;
  }
  get endTime() {
    return this.startTime + this.spans * this.distance / this.velocity;
  }
  applyDefaultsToSelf(controlPoints, difficulty) {
    super.applyDefaultsToSelf(controlPoints, difficulty);

    const timingPoint = controlPoints.timingPointAt(this.startTime);
    const difficultyPoint = controlPoints.difficultyPointAt(this.startTime);
    const scoringDistance = StandardHitObject.BASE_SCORING_DISTANCE
            * difficulty.sliderMultiplier * difficultyPoint.sliderVelocity;
    const generateTicks = difficultyPoint.generateTicks;

    this.velocity = scoringDistance / timingPoint.beatLength;
    this.tickDistance = generateTicks
      ? (scoringDistance / difficulty.sliderTickRate) * this.tickRate
      : Infinity;
  }
  createNestedHitObjects() {
    this.nestedHitObjects = [];

    for (const nested of StandardEventGenerator.generateSliderTicks(this)) {
      this.nestedHitObjects.push(nested);
    }
  }
  _updateHeadPosition() {
    if (this.head !== null) {
      this.head.startPosition = this.startPosition;
    }
  }
  _updateTailPosition() {
    if (this.tail !== null) {
      this.tail.startPosition = this.endPosition;
    }
  }
  clone() {
    const cloned = super.clone();

    cloned.nodeSamples = this.nodeSamples.map((n) => n.map((s) => s.clone()));
    cloned.velocity = this.velocity;
    cloned.repeats = this.repeats;
    cloned.path = this.path.clone();
    cloned.tickDistance = this.tickDistance;
    cloned.tickRate = this.tickRate;
    cloned.legacyLastTickOffset = this.legacyLastTickOffset;

    return cloned;
  }
}

class Spinner extends StandardHitObject {
  constructor() {
    super(...arguments);
    this.spinsRequired = 1;
    this.maximumBonusSpins = 1;
    this.endTime = 0;
    this.hitWindows = StandardHitWindows.empty;
  }
  get duration() {
    return this.endTime - this.startTime;
  }
  applyDefaultsToSelf(controlPoints, difficulty) {
    super.applyDefaultsToSelf(controlPoints, difficulty);

    const secondsDuration = this.duration / 1000;
    const minimumRotations = Spinner.STABLE_MATCHING_FUDGE
            * BeatmapDifficultySection.range(difficulty.overallDifficulty, 3, 5, 7.5);
    const rotationDifference = Spinner.MAXIMUM_ROTATIONS - minimumRotations;

    this.spinsRequired = Math.trunc(secondsDuration * minimumRotations);
    this.maximumBonusSpins = Math.trunc(secondsDuration * rotationDifference);
  }
  createNestedHitObjects() {
    this.nestedHitObjects = [];

    for (const nested of StandardEventGenerator.generateSpinnerTicks(this)) {
      this.nestedHitObjects.push(nested);
    }
  }
  clone() {
    const cloned = super.clone();

    cloned.endTime = this.endTime;
    cloned.spinsRequired = this.spinsRequired;
    cloned.maximumBonusSpins = this.maximumBonusSpins;

    return cloned;
  }
}
Spinner.STABLE_MATCHING_FUDGE = 0.6;
Spinner.MAXIMUM_ROTATIONS = 8;

class StandardHardRock extends HardRock {
  applyToHitObjects(hitObjects) {
    hitObjects.forEach((hitObject) => {
      StandardHardRock._reflectVertically(hitObject);
    });
  }
  static _reflectVertically(hitObject) {
    hitObject.startY = StandardHardRock.BASE_SIZE.y - hitObject.startY;

    if (!(hitObject instanceof Slider)) {
      return;
    }

    const slider = hitObject;
    const nestedHitObjects = slider.nestedHitObjects;

    nestedHitObjects.forEach((nested) => {
      if (nested instanceof SliderTick || nested instanceof SliderRepeat) {
        nested.startY = StandardHardRock.BASE_SIZE.y - nested.startY;
      }
    });

    slider.path.controlPoints.forEach((point) => {
      point.position.y *= -1;
    });

    slider.path.invalidate();
    slider.endY = slider.endPosition.y;
  }
}
StandardHardRock.BASE_SIZE = new Vector2(512, 384);

class StandardSuddenDeath extends SuddenDeath {
}

class StandardDoubleTime extends DoubleTime {
}

class StandardRelax extends Relax {
}

class StandardHalfTime extends HalfTime {
}

class StandardNightcore extends Nightcore {
}

class StandardFlashlight extends Flashlight$1 {
}

class StandardAutoplay extends Autoplay {
}

class StandardSpunOut {
  constructor() {
    this.name = 'Spun Out';
    this.acronym = 'SO';
    this.bitwise = ModBitwise.SpunOut;
    this.type = ModType.Automation;
    this.multiplier = 0.9;
    this.isRanked = true;
    this.incompatibles = ModBitwise.Autoplay |
            ModBitwise.Cinema |
            ModBitwise.Relax2;
  }
}

class StandardAutopilot {
  constructor() {
    this.name = 'Autopilot';
    this.acronym = 'AP';
    this.bitwise = ModBitwise.Relax2;
    this.type = ModType.Automation;
    this.multiplier = 1;
    this.isRanked = false;
    this.incompatibles = ModBitwise.NoFail |
            ModBitwise.SuddenDeath |
            ModBitwise.Perfect |
            ModBitwise.Autoplay |
            ModBitwise.Cinema |
            ModBitwise.Relax |
            ModBitwise.SpunOut;
  }
}

class StandardPerfect extends Perfect {
}

class StandardCinema extends Cinema {
}

class StandardModCombination extends ModCombination {
  get mode() {
    return 0;
  }
  get _availableMods() {
    return [
      new StandardNoMod(),
      new StandardNoFail(),
      new StandardEasy(),
      new StandardTouchDevice(),
      new StandardHidden(),
      new StandardHardRock(),
      new StandardSuddenDeath(),
      new StandardDoubleTime(),
      new StandardRelax(),
      new StandardHalfTime(),
      new StandardNightcore(),
      new StandardFlashlight(),
      new StandardAutoplay(),
      new StandardSpunOut(),
      new StandardAutopilot(),
      new StandardPerfect(),
      new StandardCinema(),
    ];
  }
}

class StandardBeatmap extends RulesetBeatmap {
  constructor() {
    super(...arguments);
    this.mods = new StandardModCombination();
    this.hitObjects = [];
  }
  get mode() {
    return 0;
  }
  get maxCombo() {
    return this.hitObjects.reduce((combo, obj) => {
      if (obj instanceof Circle) {
        return combo + 1;
      }

      if (obj instanceof Slider) {
        return combo + obj.nestedHitObjects.length;
      }

      if (obj instanceof Spinner) {
        return combo + 1;
      }

      return combo;
    }, 0);
  }
  get circles() {
    return this.hitObjects.filter((h) => h instanceof Circle);
  }
  get sliders() {
    return this.hitObjects.filter((h) => h instanceof Slider);
  }
  get spinners() {
    return this.hitObjects.filter((h) => h instanceof Spinner);
  }
}

class StandardBeatmapConverter extends BeatmapConverter {
  canConvert(beatmap) {
    return beatmap.hitObjects.every((h) => {
      return h.startPosition;
    });
  }
  *convertHitObjects(beatmap) {
    const hitObjects = beatmap.hitObjects;

    for (const hitObject of hitObjects) {
      if (hitObject instanceof StandardHitObject) {
        yield hitObject.clone();
        continue;
      }

      yield this._convertHitObject(hitObject, beatmap);
    }
  }
  _convertHitObject(hitObject, beatmap) {
    const slidable = hitObject;
    const spinnable = hitObject;

    if (slidable.path) {
      return this._convertSlider(slidable, beatmap);
    }

    if (typeof spinnable.endTime === 'number') {
      return this._convertSpinner(spinnable);
    }

    return this._convertCircle(hitObject);
  }
  _convertCircle(obj) {
    const converted = new Circle();

    this._copyProperties(converted, obj);

    return converted;
  }
  _convertSlider(obj, beatmap) {
    let _a;
    const converted = new Slider();

    this._copyProperties(converted, obj);
    converted.repeats = obj.repeats;
    converted.nodeSamples = obj.nodeSamples;
    converted.path = obj.path;
    converted.legacyLastTickOffset = (_a = obj === null || obj === void 0 ? void 0 : obj.legacyLastTickOffset) !== null && _a !== void 0 ? _a : 0;
    converted.tickRate = 1;

    if (beatmap.fileFormat < 8) {
      const diffPoint = beatmap.controlPoints.difficultyPointAt(obj.startTime);

      converted.tickRate = Math.fround(1 / diffPoint.sliderVelocity);
    }

    return converted;
  }
  _convertSpinner(obj) {
    const converted = new Spinner();

    this._copyProperties(converted, obj);
    converted.endTime = obj.endTime;

    return converted;
  }
  _copyProperties(converted, obj) {
    let _a, _b, _c;
    const posObj = obj;
    const comboObj = obj;

    converted.startPosition = (_a = posObj === null || posObj === void 0 ? void 0 : posObj.startPosition) !== null && _a !== void 0 ? _a : new Vector2(0, 0);
    converted.startTime = obj.startTime;
    converted.hitType = obj.hitType;
    converted.hitSound = obj.hitSound;
    converted.samples = obj.samples;
    converted.comboOffset = (_b = comboObj === null || comboObj === void 0 ? void 0 : comboObj.comboOffset) !== null && _b !== void 0 ? _b : 0;
    converted.isNewCombo = (_c = comboObj === null || comboObj === void 0 ? void 0 : comboObj.isNewCombo) !== null && _c !== void 0 ? _c : false;
  }
  createBeatmap() {
    return new StandardBeatmap();
  }
}

class StandardBeatmapProcessor extends BeatmapProcessor {
  postProcess(beatmap) {
    super.postProcess(beatmap);
    beatmap.fileFormat >= 6
      ? this._applyStackingNew(beatmap)
      : this._applyStackingOld(beatmap);

    return beatmap;
  }
  _applyStackingNew(beatmap) {
    const hitObjects = beatmap.hitObjects;
    const stackLeniency = beatmap.general.stackLeniency;
    const stackDistance = StandardBeatmapProcessor.STACK_DISTANCE;
    const startIndex = 0;
    const endIndex = hitObjects.length - 1;
    let extendedEndIndex = endIndex;

    if (endIndex < hitObjects.length - 1) {
      for (let i = endIndex; i >= startIndex; --i) {
        let stackBaseIndex = i;

        for (let n = stackBaseIndex + 1; n < hitObjects.length; ++n) {
          const stackBaseObject = hitObjects[stackBaseIndex];

          if (stackBaseObject instanceof Spinner) {
            break;
          }

          const objectN = hitObjects[n];

          if (objectN instanceof Spinner) {
            continue;
          }

          const endTime = stackBaseObject.endTime || stackBaseObject.startTime;
          const stackThreshold = objectN.timePreempt * stackLeniency;

          if (objectN.startTime - endTime > stackThreshold) {
            break;
          }

          const distance1 = stackBaseObject.startPosition.fdistance(objectN.startPosition) < stackDistance;
          const distance2 = (stackBaseObject instanceof Slider)
                        && stackBaseObject.endPosition.fdistance(objectN.startPosition) < stackDistance;

          if (distance1 || distance2) {
            stackBaseIndex = n;
            objectN.stackHeight = 0;
          }
        }

        if (stackBaseIndex > extendedEndIndex) {
          extendedEndIndex = stackBaseIndex;

          if (extendedEndIndex === hitObjects.length - 1) {
            break;
          }
        }
      }
    }

    let extendedStartIndex = startIndex;

    for (let i = extendedEndIndex; i > startIndex; --i) {
      let n = i;
      let objectI = hitObjects[i];

      if (objectI.stackHeight !== 0 || (objectI instanceof Spinner)) {
        continue;
      }

      const stackThreshold = objectI.timePreempt * stackLeniency;

      if (objectI instanceof Circle) {
        while (--n >= 0) {
          const objectN = hitObjects[n];

          if (objectN instanceof Spinner) {
            continue;
          }

          const endTime = objectN.endTime || objectN.startTime;

          if (objectI.startTime - endTime > stackThreshold) {
            break;
          }

          if (n < extendedStartIndex) {
            objectN.stackHeight = 0;
            extendedStartIndex = n;
          }

          const distanceNI = objectN.endPosition.fdistance(objectI.startPosition);

          if ((objectN instanceof Slider) && distanceNI < stackDistance) {
            const offset = objectI.stackHeight - objectN.stackHeight + 1;

            for (let j = n + 1; j <= i; ++j) {
              const objectJ = hitObjects[j];
              const distanceNJ = objectN.endPosition.fdistance(objectJ.startPosition);

              if (distanceNJ < stackDistance) {
                objectJ.stackHeight -= offset;
              }
            }

            break;
          }

          if (objectN.startPosition.fdistance(objectI.startPosition) < stackDistance) {
            objectN.stackHeight = objectI.stackHeight + 1;
            objectI = objectN;
          }
        }
      }
      else if (objectI instanceof Slider) {
        while (--n >= startIndex) {
          const objectN = hitObjects[n];

          if (objectN instanceof Spinner) {
            continue;
          }

          if (objectI.startTime - objectN.startTime > stackThreshold) {
            break;
          }

          const distance = objectN.endPosition.fdistance(objectI.startPosition);

          if (distance < stackDistance) {
            objectN.stackHeight = objectI.stackHeight + 1;
            objectI = objectN;
          }
        }
      }
    }
  }
  _applyStackingOld(beatmap) {
    const hitObjects = beatmap.hitObjects;
    const stackLeniency = beatmap.general.stackLeniency;
    const stackDistance = StandardBeatmapProcessor.STACK_DISTANCE;

    for (let i = 0, len = hitObjects.length; i < len; ++i) {
      const currHitObject = hitObjects[i];

      if (currHitObject.stackHeight !== 0 && !(currHitObject instanceof Slider)) {
        continue;
      }

      let startTime = currHitObject.endTime || currHitObject.startTime;
      let sliderStack = 0;

      for (let j = i + 1; j < len; ++j) {
        const stackThreshold = hitObjects[i].timePreempt * stackLeniency;

        if (hitObjects[j].startTime - stackThreshold > startTime) {
          break;
        }

        const pos2 = currHitObject.endPosition;

        if (hitObjects[j].startPosition.fdistance(currHitObject.startPosition) < stackDistance) {
          ++currHitObject.stackHeight;
          startTime = hitObjects[j].endTime || hitObjects[j].startTime;
        }
        else if (hitObjects[j].startPosition.fdistance(pos2) < stackDistance) {
          hitObjects[j].stackHeight -= ++sliderStack;
          startTime = hitObjects[j].endTime || hitObjects[j].startTime;
        }
      }
    }
  }
}
StandardBeatmapProcessor.STACK_DISTANCE = 3;

class StandardDifficultyAttributes extends DifficultyAttributes {
  constructor() {
    super(...arguments);
    this.aimDifficulty = 0;
    this.speedDifficulty = 0;
    this.speedNoteCount = 0;
    this.flashlightDifficulty = 0;
    this.sliderFactor = 0;
    this.approachRate = 0;
    this.overallDifficulty = 0;
    this.drainRate = 0;
    this.hitCircleCount = 0;
    this.sliderCount = 0;
    this.spinnerCount = 0;
  }
}

class StandardPerformanceAttributes extends PerformanceAttributes {
  constructor(mods, totalPerformance) {
    super(mods, totalPerformance);
    this.aimPerformance = 0;
    this.speedPerformance = 0;
    this.accuracyPerformance = 0;
    this.flashlightPerformance = 0;
    this.effectiveMissCount = 0;
    this.mods = mods;
  }
}

let _a;

class StandardDifficultyHitObject extends DifficultyHitObject {
  constructor(hitObject, lastObject, lastLastObject, clockRate, objects, index) {
    super(hitObject, lastObject, clockRate, objects, index);
    this.lazyJumpDistance = 0;
    this.minimumJumpDistance = 0;
    this.minimumJumpTime = 0;
    this.travelDistance = 0;
    this.travelTime = 0;
    this.angle = null;
    this.hitWindowGreat = 0;
    this.baseObject = hitObject;
    this.lastObject = lastObject;
    this._lastLastObject = lastLastObject;
    this.strainTime = Math.max(this.deltaTime, StandardDifficultyHitObject.MIN_DELTA_TIME);
    this.hitWindowGreat = this.baseObject instanceof Slider && this.baseObject.head
      ? 2 * this.baseObject.head.hitWindows.windowFor(HitResult.Great) / clockRate
      : 2 * this.baseObject.hitWindows.windowFor(HitResult.Great) / clockRate;

    this._setDistances(clockRate);
  }
  opacityAt(time, hidden) {
    if (time > this.baseObject.startTime) {
      return 0;
    }

    const fadeInStartTime = this.baseObject.startTime - this.baseObject.timePreempt;
    const fadeInDuration = this.baseObject.timeFadeIn;

    if (hidden) {
      const fadeOutStartTime = this.baseObject.startTime
                - this.baseObject.timePreempt + this.baseObject.timeFadeIn;
      const fadeOutDuration = this.baseObject.timePreempt
                * StandardHidden.FADE_OUT_DURATION_MULTIPLIER;

      return Math.min(MathUtils.clamp((time - fadeInStartTime) / fadeInDuration, 0, 1), 1.0 - MathUtils.clamp((time - fadeOutStartTime) / fadeOutDuration, 0, 1));
    }

    return MathUtils.clamp((time - fadeInStartTime) / fadeInDuration, 0, 1);
  }
  _setDistances(clockRate) {
    let _b, _c;
    const baseObj = this.baseObject;
    const lastObj = this.lastObject;

    if (baseObj instanceof Slider) {
      this._computeSliderCursorPosition(baseObj);
      this.travelDistance = Math.fround(Math.fround(baseObj.lazyTravelDistance) *
                Math.fround(Math.pow(1 + baseObj.repeats / 2.5, 1 / 2.5)));

      this.travelTime = Math.max(baseObj.lazyTravelTime / clockRate, StandardDifficultyHitObject.MIN_DELTA_TIME);
    }

    if (baseObj instanceof Spinner || lastObj instanceof Spinner) {
      return;
    }

    let scalingFactor = Math.fround(StandardDifficultyHitObject.NORMALIZED_RADIUS / Math.fround(baseObj.radius));

    if (baseObj.radius < 30) {
      const smallCircleBonus = Math.fround(Math.min(Math.fround(30 - Math.fround(baseObj.radius)), 5) / 50);

      scalingFactor = Math.fround(scalingFactor * Math.fround(1 + smallCircleBonus));
    }

    const lastCursorPosition = this._getEndCursorPosition(lastObj);
    const scaledStackPos = baseObj.stackedStartPosition.fscale(scalingFactor);
    const scaledCursorPos = lastCursorPosition.fscale(scalingFactor);

    this.lazyJumpDistance = scaledStackPos.fsubtract(scaledCursorPos).flength();
    this.minimumJumpTime = this.strainTime;
    this.minimumJumpDistance = this.lazyJumpDistance;

    if (lastObj instanceof Slider) {
      const lastTraveTime = Math.max(lastObj.lazyTravelTime / clockRate, StandardDifficultyHitObject.MIN_DELTA_TIME);

      this.minimumJumpTime = Math.max(this.strainTime - lastTraveTime, StandardDifficultyHitObject.MIN_DELTA_TIME);

      const tailStackPos = (_c = (_b = lastObj.tail) === null || _b === void 0 ? void 0 : _b.stackedStartPosition) !== null && _c !== void 0 ? _c : lastObj.stackedStartPosition;
      const baseStackPos = baseObj.stackedStartPosition;
      const tailJumpDistance = Math.fround(tailStackPos.fsubtract(baseStackPos).flength() * scalingFactor);
      const maxSliderRadius = StandardDifficultyHitObject.MAXIMUM_SLIDER_RADIUS;
      const assumedSliderRadius = StandardDifficultyHitObject.ASSUMED_SLIDER_RADIUS;

      this.minimumJumpDistance = MathUtils.clamp(this.lazyJumpDistance - (maxSliderRadius - assumedSliderRadius), 0, Math.fround(tailJumpDistance - maxSliderRadius));
    }

    if (this._lastLastObject !== null && !(this._lastLastObject instanceof Spinner)) {
      const lastLastCursorPosition = this._getEndCursorPosition(this._lastLastObject);
      const v1 = lastLastCursorPosition.fsubtract(lastObj.stackedStartPosition);
      const v2 = baseObj.stackedStartPosition.fsubtract(lastCursorPosition);
      const dot = v1.fdot(v2);
      const det = Math.fround(Math.fround(v1.floatX * v2.floatY) - Math.fround(v1.floatY * v2.floatX));

      this.angle = Math.abs(Math.atan2(det, dot));
    }
  }
  _computeSliderCursorPosition(slider) {
    if (slider.lazyEndPosition) {
      return;
    }

    const lastNested = slider.nestedHitObjects[slider.nestedHitObjects.length - 1];

    slider.lazyTravelTime = lastNested.startTime - slider.startTime;

    let endTimeMin = slider.lazyTravelTime / slider.spanDuration;

    endTimeMin = endTimeMin % 2 >= 1 ? 1 - endTimeMin % 1 : endTimeMin % 1;

    const endPosition = slider.path.positionAt(endTimeMin);

    slider.lazyEndPosition = slider.stackedStartPosition.fadd(endPosition);

    let currCursorPosition = slider.stackedStartPosition;
    const scalingFactor = StandardDifficultyHitObject.NORMALIZED_RADIUS / slider.radius;

    for (let i = 1; i < slider.nestedHitObjects.length; ++i) {
      const currMovementObj = slider.nestedHitObjects[i];
      let currMovement = currMovementObj.stackedStartPosition.fsubtract(currCursorPosition);
      let currMovementLength = scalingFactor * currMovement.flength();
      let requiredMovement = StandardDifficultyHitObject.ASSUMED_SLIDER_RADIUS;

      if (i === slider.nestedHitObjects.length - 1) {
        const lazyMovement = slider.lazyEndPosition.fsubtract(currCursorPosition);

        if (lazyMovement.flength() < currMovement.flength()) {
          currMovement = lazyMovement;
        }

        currMovementLength = scalingFactor * currMovement.flength();
      }
      else if (currMovementObj instanceof SliderRepeat) {
        requiredMovement = StandardDifficultyHitObject.NORMALIZED_RADIUS;
      }

      if (currMovementLength > requiredMovement) {
        const movementScale = Math.fround((currMovementLength - requiredMovement) / currMovementLength);

        currCursorPosition = currCursorPosition.fadd(currMovement.fscale(movementScale));
        currMovementLength *= (currMovementLength - requiredMovement) / currMovementLength;
        slider.lazyTravelDistance = Math.fround(slider.lazyTravelDistance + Math.fround(currMovementLength));
      }

      if (i === slider.nestedHitObjects.length - 1) {
        slider.lazyEndPosition = currCursorPosition;
      }
    }
  }
  _getEndCursorPosition(hitObject) {
    let _b;

    if (hitObject instanceof Slider) {
      this._computeSliderCursorPosition(hitObject);

      return (_b = hitObject.lazyEndPosition) !== null && _b !== void 0 ? _b : hitObject.stackedStartPosition;
    }

    return hitObject.stackedStartPosition;
  }
}
_a = StandardDifficultyHitObject;
StandardDifficultyHitObject.NORMALIZED_RADIUS = 50;
StandardDifficultyHitObject.MIN_DELTA_TIME = 25;
StandardDifficultyHitObject.MAXIMUM_SLIDER_RADIUS = Math.fround(_a.NORMALIZED_RADIUS * Math.fround(2.4));
StandardDifficultyHitObject.ASSUMED_SLIDER_RADIUS = Math.fround(_a.NORMALIZED_RADIUS * Math.fround(1.8));

class StandardStrainSkill extends StrainSkill {
  constructor() {
    super(...arguments);
    this._reducedSectionCount = 10;
    this._reducedStrainBaseline = 0.75;
    this._difficultyMultiplier = StandardStrainSkill.DEFAULT_DIFFICULTY_MULTIPLIER;
  }
  get difficultyValue() {
    let difficulty = 0;
    let weight = 1;
    const strains = [...this.getCurrentStrainPeaks()]
      .filter((p) => p > 0)
      .sort((a, b) => b - a);

    const lerp = (start, final, amount) => {
      return start + (final - start) * amount;
    };

    const length = Math.min(strains.length, this._reducedSectionCount);

    for (let i = 0; i < length; ++i) {
      const value = Math.fround(i / this._reducedSectionCount);
      const clamp = MathUtils.clamp01(value);
      const scale = Math.log10(lerp(1, 10, clamp));

      strains[i] *= lerp(this._reducedStrainBaseline, 1, scale);
    }

    strains.sort((a, b) => b - a);
    strains.forEach((strain) => {
      difficulty += strain * weight;
      weight *= this._decayWeight;
    });

    return difficulty * this._difficultyMultiplier;
  }
}
StandardStrainSkill.DEFAULT_DIFFICULTY_MULTIPLIER = 1.06;

class AimEvaluator {
  static evaluateDifficultyOf(current, withSliders) {
    let _a;

    if (current.baseObject instanceof Spinner) {
      return 0;
    }

    if (current.index <= 1) {
      return 0;
    }

    if (((_a = current.previous(0)) === null || _a === void 0 ? void 0 : _a.baseObject) instanceof Spinner) {
      return 0;
    }

    const osuCurrObj = current;
    const osuLastObj = current.previous(0);
    const osuLastLastObj = current.previous(1);
    let currVelocity = osuCurrObj.lazyJumpDistance / osuCurrObj.strainTime;

    if ((osuLastObj.baseObject instanceof Slider) && withSliders) {
      const travelVelocity = osuLastObj.travelDistance / osuLastObj.travelTime;
      const movementVelocity = osuCurrObj.minimumJumpDistance / osuCurrObj.minimumJumpTime;

      currVelocity = Math.max(currVelocity, movementVelocity + travelVelocity);
    }

    let prevVelocity = osuLastObj.lazyJumpDistance / osuLastObj.strainTime;

    if ((osuLastLastObj.baseObject instanceof Slider) && withSliders) {
      const travelVelocity = osuLastLastObj.travelDistance / osuLastLastObj.travelTime;
      const movementVelocity = osuLastObj.minimumJumpDistance / osuLastObj.minimumJumpTime;

      prevVelocity = Math.max(prevVelocity, movementVelocity + travelVelocity);
    }

    let wideAngleBonus = 0;
    let acuteAngleBonus = 0;
    let sliderBonus = 0;
    let velocityChangeBonus = 0;
    let aimStrain = currVelocity;
    const strainTime1 = Math.max(osuCurrObj.strainTime, osuLastObj.strainTime);
    const strainTime2 = Math.min(osuCurrObj.strainTime, osuLastObj.strainTime);

    if (strainTime1 < 1.25 * strainTime2) {
      if (osuCurrObj.angle !== null && osuLastObj.angle !== null && osuLastLastObj.angle !== null) {
        const currAngle = osuCurrObj.angle;
        const lastAngle = osuLastObj.angle;
        const lastLastAngle = osuLastLastObj.angle;
        const angleBonus = Math.min(currVelocity, prevVelocity);

        wideAngleBonus = this._calcWideAngleBonus(currAngle);
        acuteAngleBonus = this._calcAcuteAngleBonus(currAngle);

        if (osuCurrObj.strainTime > 100) {
          acuteAngleBonus = 0;
        }
        else {
          acuteAngleBonus *= this._calcAcuteAngleBonus(lastAngle);
          acuteAngleBonus *= Math.min(angleBonus, 125 / osuCurrObj.strainTime);

          const x1 = Math.PI / 2 * Math.min(1, (100 - osuCurrObj.strainTime) / 25);

          acuteAngleBonus *= Math.pow(Math.sin(x1), 2);

          const clamp = Math.min(Math.max(osuCurrObj.lazyJumpDistance, 50), 100);
          const x2 = Math.PI / 2 * (clamp - 50) / 50;

          acuteAngleBonus *= Math.pow(Math.sin(x2), 2);
        }

        const pow1 = Math.pow(this._calcWideAngleBonus(lastAngle), 3);

        wideAngleBonus *= angleBonus * (1 - Math.min(wideAngleBonus, pow1));

        const pow2 = Math.pow(this._calcAcuteAngleBonus(lastLastAngle), 3);

        acuteAngleBonus *= 0.5 + 0.5 * (1 - Math.min(acuteAngleBonus, pow2));
      }
    }

    if (Math.max(prevVelocity, currVelocity) !== 0) {
      prevVelocity = (osuLastObj.lazyJumpDistance + osuLastLastObj.travelDistance) / osuLastObj.strainTime;
      currVelocity = (osuCurrObj.lazyJumpDistance + osuLastObj.travelDistance) / osuCurrObj.strainTime;

      const abs1 = Math.abs(prevVelocity - currVelocity);
      const max1 = Math.max(prevVelocity, currVelocity);
      const distRatio = Math.pow(Math.sin(Math.PI / 2 * abs1 / max1), 2);
      const min2 = Math.min(osuCurrObj.strainTime, osuLastObj.strainTime);
      const abs2 = Math.abs(prevVelocity - currVelocity);
      const overlapVelocityBuff = Math.min(125 / min2, abs2);

      velocityChangeBonus = overlapVelocityBuff * distRatio;

      const min4 = Math.min(osuCurrObj.strainTime, osuLastObj.strainTime);
      const max4 = Math.max(osuCurrObj.strainTime, osuLastObj.strainTime);

      velocityChangeBonus *= Math.pow(min4 / max4, 2);
    }

    if (osuLastObj.baseObject instanceof Slider) {
      sliderBonus = osuLastObj.travelDistance / osuLastObj.travelTime;
    }

    const acuteBonus = acuteAngleBonus * this.ACUTE_ANGLE_MULTIPLIER;
    const wideBonus = wideAngleBonus * this.WIDE_ANGLE_MULTIPLIER;
    const velocityBonus = velocityChangeBonus * this.VELOCITY_CHANGE_MULTIPLIER;

    aimStrain += Math.max(acuteBonus, wideBonus + velocityBonus);

    if (withSliders) {
      aimStrain += sliderBonus * this.SLIDER_MULTIPLIER;
    }

    return aimStrain;
  }
  static _calcWideAngleBonus(angle) {
    const clamp = Math.min(5 / 6 * Math.PI, Math.max(Math.PI / 6, angle));
    const x = 3 / 4 * (clamp - Math.PI / 6);

    return Math.pow(Math.sin(x), 2);
  }
  static _calcAcuteAngleBonus(angle) {
    return 1 - this._calcWideAngleBonus(angle);
  }
}
AimEvaluator.WIDE_ANGLE_MULTIPLIER = 1.5;
AimEvaluator.ACUTE_ANGLE_MULTIPLIER = 1.95;
AimEvaluator.SLIDER_MULTIPLIER = 1.35;
AimEvaluator.VELOCITY_CHANGE_MULTIPLIER = 0.75;

class FlashlightEvaluator {
  static evaluateDifficultyOf(current, hidden) {
    if (current.baseObject instanceof Spinner) {
      return 0;
    }

    const osuCurrent = current;
    const osuHitObject = osuCurrent.baseObject;
    const scalingFactor = 52 / osuHitObject.radius;
    let smallDistNerf = 1;
    let cumulativeStrainTime = 0;
    let result = 0;
    let angleRepeatCount = 0;
    let lastObj = osuCurrent;

    for (let i = 0; i < Math.min(current.index, 10); i++) {
      const currentObj = current.previous(i);
      const currentHitObject = currentObj.baseObject;

      if (!(currentObj.baseObject instanceof Spinner)) {
        const jumpDistance = osuHitObject.stackedStartPosition
          .fsubtract(currentHitObject.stackedEndPosition)
          .flength();

        cumulativeStrainTime += lastObj.strainTime;

        if (i === 0) {
          smallDistNerf = Math.min(1, jumpDistance / 75);
        }

        const stackNerf = Math.min(1, (currentObj.lazyJumpDistance / scalingFactor) / 25);
        const opacity = osuCurrent.opacityAt(currentHitObject.startTime, hidden);
        const opacityBonus = 1 + this.MAX_OPACITY_BONUS * (1 - opacity);

        result += stackNerf * opacityBonus * scalingFactor * jumpDistance / cumulativeStrainTime;

        if (currentObj.angle !== null && osuCurrent.angle !== null) {
          if (Math.abs(currentObj.angle - osuCurrent.angle) < 0.02) {
            angleRepeatCount += Math.max(1 - 0.1 * i, 0);
          }
        }
      }

      lastObj = currentObj;
    }

    result = Math.pow(smallDistNerf * result, 2.0);

    if (hidden) {
      result *= 1 + this.HIDDEN_BONUS;
    }

    result *= this.MIN_ANGLE_MULTIPLIER
            + (1 - this.MIN_ANGLE_MULTIPLIER) / (angleRepeatCount + 1);

    let sliderBonus = 0;

    if (osuCurrent.baseObject instanceof Slider) {
      const slider = osuCurrent.baseObject;
      const pixelTravelDistance = slider.lazyTravelDistance / scalingFactor;
      const max1 = Math.max(0, pixelTravelDistance / osuCurrent.travelTime - this.MIN_VELOCITY);

      sliderBonus = Math.pow(max1, 0.5);
      sliderBonus *= pixelTravelDistance;

      if (slider.repeats > 0) {
        sliderBonus /= (slider.repeats + 1);
      }
    }

    result += sliderBonus * this.SLIDER_MULTIPLIER;

    return result;
  }
}
FlashlightEvaluator.MAX_OPACITY_BONUS = 0.4;
FlashlightEvaluator.HIDDEN_BONUS = 0.2;
FlashlightEvaluator.MIN_VELOCITY = 0.5;
FlashlightEvaluator.SLIDER_MULTIPLIER = 1.3;
FlashlightEvaluator.MIN_ANGLE_MULTIPLIER = 0.2;

class RhythmEvaluator {
  static evaluateDifficultyOf(current) {
    let _a, _b, _c, _d;

    if (current.baseObject instanceof Spinner) {
      return 0;
    }

    let startRatio = 0;
    let firstDeltaSwitch = false;
    let rhythmStart = 0;
    let previousIslandSize = 0;
    let rhythmComplexitySum = 0;
    let islandSize = 1;
    const historicalNoteCount = Math.min(current.index, 32);

    while (rhythmStart < historicalNoteCount - 2 &&
            current.startTime - ((_b = (_a = current.previous(rhythmStart)) === null || _a === void 0 ? void 0 : _a.startTime) !== null && _b !== void 0 ? _b : 0) < this.HISTORY_TIME_MAX) {
      rhythmStart++;
    }

    for (let i = rhythmStart; i > 0; --i) {
      const currObj = current.previous(i - 1);
      const prevObj = current.previous(i);
      const lastObj = current.previous(i + 1);
      let currHistoricalDecay = (this.HISTORY_TIME_MAX - (current.startTime - currObj.startTime)) / this.HISTORY_TIME_MAX;

      currHistoricalDecay = Math.min((historicalNoteCount - i) / historicalNoteCount, currHistoricalDecay);

      const currDelta = currObj.strainTime;
      const prevDelta = prevObj.strainTime;
      const lastDelta = lastObj.strainTime;
      const x1 = Math.min(prevDelta, currDelta) / Math.max(prevDelta, currDelta);
      const currRatio = 1 + 6 * Math.min(0.5, Math.pow(Math.sin(Math.PI / x1), 2));
      const x2 = Math.max(0, Math.abs(prevDelta - currDelta) - currObj.hitWindowGreat * 0.3);
      let windowPenalty = Math.min(1, x2 / (currObj.hitWindowGreat * 0.3));

      windowPenalty = Math.min(1, windowPenalty);

      let effectiveRatio = windowPenalty * currRatio;

      if (firstDeltaSwitch) {
        if (!(prevDelta > 1.25 * currDelta || prevDelta * 1.25 < currDelta)) {
          if (islandSize < 7) {
            islandSize++;
          }
        }
        else {
          if (((_c = current.previous(i - 1)) === null || _c === void 0 ? void 0 : _c.baseObject) instanceof Slider) {
            effectiveRatio *= 0.125;
          }

          if (((_d = current.previous(i)) === null || _d === void 0 ? void 0 : _d.baseObject) instanceof Slider) {
            effectiveRatio *= 0.25;
          }

          if (previousIslandSize === islandSize) {
            effectiveRatio *= 0.25;
          }

          if (previousIslandSize % 2 === islandSize % 2) {
            effectiveRatio *= 0.50;
          }

          if (lastDelta > prevDelta + 10 && prevDelta > currDelta + 10) {
            effectiveRatio *= 0.125;
          }

          const sqrt1 = Math.sqrt(effectiveRatio * startRatio);
          const sqrt2 = Math.sqrt(4 + islandSize);
          const sqrt3 = Math.sqrt(4 + previousIslandSize);

          rhythmComplexitySum += sqrt1 * currHistoricalDecay * sqrt2 / 2 * sqrt3 / 2;
          startRatio = effectiveRatio;
          previousIslandSize = islandSize;

          if (prevDelta * 1.25 < currDelta) {
            firstDeltaSwitch = false;
          }

          islandSize = 1;
        }
      }
      else if (prevDelta > 1.25 * currDelta) {
        firstDeltaSwitch = true;
        startRatio = effectiveRatio;
        islandSize = 1;
      }
    }

    return Math.sqrt(4 + rhythmComplexitySum * this.RHYTHM_MULTIPLIER) / 2;
  }
}
RhythmEvaluator.HISTORY_TIME_MAX = 5000;
RhythmEvaluator.RHYTHM_MULTIPLIER = 0.75;

class SpeedEvaluator {
  static evaluateDifficultyOf(current) {
    let _a;

    if (current.baseObject instanceof Spinner) {
      return 0;
    }

    const osuCurrObj = current;
    const osuPrevObj = current.index > 0 ? current.previous(0) : null;
    const osuNextObj = current.next(0);
    let strainTime = osuCurrObj.strainTime;
    let doubletapness = 1;

    if (osuNextObj !== null) {
      const currDeltaTime = Math.max(1, osuCurrObj.deltaTime);
      const nextDeltaTime = Math.max(1, osuNextObj.deltaTime);
      const deltaDifference = Math.abs(nextDeltaTime - currDeltaTime);
      const speedRatio = currDeltaTime / Math.max(currDeltaTime, deltaDifference);
      const windowRatio = Math.pow(Math.min(1, currDeltaTime / osuCurrObj.hitWindowGreat), 2);

      doubletapness = Math.pow(speedRatio, 1 - windowRatio);
    }

    strainTime /= MathUtils.clamp((strainTime / osuCurrObj.hitWindowGreat) / 0.93, 0.92, 1);

    let speedBonus = 1;

    if (strainTime < this.MIN_SPEED_BONUS) {
      speedBonus = 1 + 0.75 * Math.pow((this.MIN_SPEED_BONUS - strainTime) / this.SPEED_BALANCING_FACTOR, 2);
    }

    const travelDistance = (_a = osuPrevObj === null || osuPrevObj === void 0 ? void 0 : osuPrevObj.travelDistance) !== null && _a !== void 0 ? _a : 0;
    const distance = Math.min(this.SINGLE_SPACING_THRESHOLD, travelDistance + osuCurrObj.minimumJumpDistance);
    const pow = Math.pow(distance / this.SINGLE_SPACING_THRESHOLD, 3.5);

    return (speedBonus + speedBonus * pow) * doubletapness / strainTime;
  }
}
SpeedEvaluator.SINGLE_SPACING_THRESHOLD = 125;
SpeedEvaluator.MIN_SPEED_BONUS = 75;
SpeedEvaluator.SPEED_BALANCING_FACTOR = 40;

class Aim extends StandardStrainSkill {
  constructor(mods, withSliders) {
    super(mods);
    this._currentStrain = 0;
    this._withSliders = withSliders;
  }
  _strainDecay(ms) {
    return Math.pow(Aim.STRAIN_DECAY_BASE, ms / 1000);
  }
  _calculateInitialStrain(time, current) {
    let _a, _b;

    return this._currentStrain * this._strainDecay(time - ((_b = (_a = current.previous(0)) === null || _a === void 0 ? void 0 : _a.startTime) !== null && _b !== void 0 ? _b : 0));
  }
  _strainValueAt(current) {
    this._currentStrain *= this._strainDecay(current.deltaTime);

    const aimValue = AimEvaluator.evaluateDifficultyOf(current, this._withSliders);

    this._currentStrain += aimValue * Aim.SKILL_MULTIPLIER;

    return this._currentStrain;
  }
}
Aim.SKILL_MULTIPLIER = 23.55;
Aim.STRAIN_DECAY_BASE = 0.15;

class Flashlight extends StrainSkill {
  constructor(mods) {
    super(mods);
    this._currentStrain = 0;
    this._hasHiddenMod = mods.any(StandardHidden);
  }
  _strainDecay(ms) {
    return Math.pow(Flashlight.STRAIN_DECAY_BASE, ms / 1000);
  }
  _calculateInitialStrain(time, current) {
    let _a, _b;

    return this._currentStrain * this._strainDecay(time - ((_b = (_a = current.previous(0)) === null || _a === void 0 ? void 0 : _a.startTime) !== null && _b !== void 0 ? _b : 0));
  }
  _strainValueAt(current) {
    this._currentStrain *= this._strainDecay(current.deltaTime);

    const flashlightValue = FlashlightEvaluator
      .evaluateDifficultyOf(current, this._hasHiddenMod);

    this._currentStrain += flashlightValue * Flashlight.SKILL_MULTIPLIER;

    return this._currentStrain;
  }
  get difficultyValue() {
    const strainSum = [...this.getCurrentStrainPeaks()].reduce((p, c) => p + c);

    return strainSum * StandardStrainSkill.DEFAULT_DIFFICULTY_MULTIPLIER;
  }
}
Flashlight.SKILL_MULTIPLIER = 0.052;
Flashlight.STRAIN_DECAY_BASE = 0.15;

class Speed extends StandardStrainSkill {
  constructor() {
    super(...arguments);
    this._currentStrain = 0;
    this._currentRhythm = 0;
    this._reducedSectionCount = 5;
    this._difficultyMultiplier = 1.04;
    this._objectStrains = [];
  }
  _strainDecay(ms) {
    return Math.pow(Speed.STRAIN_DECAY_BASE, ms / 1000);
  }
  _calculateInitialStrain(time, current) {
    let _a, _b;
    const strainDecay = this._strainDecay(time - ((_b = (_a = current.previous(0)) === null || _a === void 0 ? void 0 : _a.startTime) !== null && _b !== void 0 ? _b : 0));

    return (this._currentStrain * this._currentRhythm) * strainDecay;
  }
  _strainValueAt(current) {
    const standardCurrent = current;

    this._currentStrain *= this._strainDecay(standardCurrent.strainTime);

    const speedValue = SpeedEvaluator.evaluateDifficultyOf(current);

    this._currentStrain += speedValue * Speed.SKILL_MULTIPLIER;
    this._currentRhythm = RhythmEvaluator.evaluateDifficultyOf(current);

    const totalStrain = this._currentStrain * this._currentRhythm;

    this._objectStrains.push(totalStrain);

    return totalStrain;
  }
  relevantNoteCount() {
    if (this._objectStrains.length === 0) {
      return 0;
    }

    const maxStrain = Math.max(...this._objectStrains);

    if (maxStrain === 0) {
      return 0;
    }

    return this._objectStrains.reduce((sum, strain) => {
      return sum + 1 / (1 + Math.exp(6 - strain / maxStrain * 12));
    }, 0);
  }
}
Speed.SKILL_MULTIPLIER = 1375;
Speed.STRAIN_DECAY_BASE = 0.3;

class StandardPerformanceCalculator extends PerformanceCalculator {
  constructor(ruleset, attributes, score) {
    super(ruleset, attributes, score);
    this._mods = new StandardModCombination();
    this._scoreMaxCombo = 0;
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
      return new StandardPerformanceAttributes(this._mods, 0);
    }

    let multiplier = StandardPerformanceCalculator.PERFORMANCE_BASE_MULTIPLIER;

    if (this._mods.any(StandardNoFail)) {
      multiplier *= Math.max(0.9, 1 - 0.02 * this._effectiveMissCount);
    }

    if (this._mods.any(StandardSpunOut) && this._totalHits > 0) {
      multiplier *= 1 - Math.pow(this.attributes.spinnerCount / this._totalHits, 0.85);
    }

    if (this._mods.any(StandardRelax)) {
      const okMultiplier = Math.max(0, this.attributes.overallDifficulty > 0
        ? 1 - Math.pow(this.attributes.overallDifficulty / 13.33, 1.8)
        : 1);
      const mehMultiplier = Math.max(0, this.attributes.overallDifficulty > 0
        ? 1 - Math.pow(this.attributes.overallDifficulty / 13.33, 5)
        : 1);
      const okValue = this._countOk * okMultiplier;
      const mehValue = this._countMeh * mehMultiplier;

      this._effectiveMissCount = Math.min(this._effectiveMissCount + okValue + mehValue, this._totalHits);
    }

    const aimValue = this._computeAimValue(this.attributes);
    const speedValue = this._computeSpeedValue(this.attributes);
    const accuracyValue = this._computeAccuracyValue(this.attributes);
    const flashlightValue = this._computeFlashlightValue(this.attributes);
    const totalValue = Math.pow(Math.pow(aimValue, 1.1) +
            Math.pow(speedValue, 1.1) +
            Math.pow(accuracyValue, 1.1) +
            Math.pow(flashlightValue, 1.1), 1.0 / 1.1) * multiplier;
    const performance = new StandardPerformanceAttributes(this._mods, totalValue);

    performance.aimPerformance = aimValue;
    performance.speedPerformance = speedValue;
    performance.accuracyPerformance = accuracyValue;
    performance.flashlightPerformance = flashlightValue;
    performance.effectiveMissCount = this._effectiveMissCount;

    return performance;
  }
  _computeAimValue(attributes) {
    const max1 = Math.max(1, attributes.aimDifficulty / 0.0675);
    let aimValue = Math.pow(5 * max1 - 4, 3) / 100000;
    const lengthBonus = 0.95 + 0.4 * Math.min(1, this._totalHits / 2000)
            + (this._totalHits > 2000 ? Math.log10(this._totalHits / 2000) * 0.5 : 0);

    aimValue *= lengthBonus;

    if (this._effectiveMissCount > 0) {
      const pow = Math.pow(this._effectiveMissCount / this._totalHits, 0.775);

      aimValue *= 0.97 * Math.pow(1 - pow, this._effectiveMissCount);
    }

    aimValue *= this._getComboScalingFactor(attributes);

    let approachRateFactor = 0;

    if (attributes.approachRate > 10.33) {
      approachRateFactor = 0.3 * (attributes.approachRate - 10.33);
    }
    else if (attributes.approachRate < 8) {
      approachRateFactor = 0.05 * (8 - attributes.approachRate);
    }

    if (this._mods.any(StandardRelax)) {
      approachRateFactor = 0;
    }

    aimValue *= 1 + approachRateFactor * lengthBonus;

    if (this._mods.any(StandardHidden)) {
      aimValue *= 1 + 0.04 * (12 - attributes.approachRate);
    }

    const estimateDifficultSliders = attributes.sliderCount * 0.15;

    if (attributes.sliderCount > 0) {
      const counts = this._countOk + this._countMeh + this._countMiss;
      const maxCombo = attributes.maxCombo - this._scoreMaxCombo;
      const min = Math.min(counts, maxCombo);
      const estimateSliderEndsDropped = MathUtils.clamp(min, 0, estimateDifficultSliders);
      const pow = Math.pow(1 - estimateSliderEndsDropped / estimateDifficultSliders, 3);
      const sliderNerfFactor = (1 - attributes.sliderFactor) * pow + attributes.sliderFactor;

      aimValue *= sliderNerfFactor;
    }

    aimValue *= this._accuracy;
    aimValue *= 0.98 + Math.pow(attributes.overallDifficulty, 2) / 2500;

    return aimValue;
  }
  _computeSpeedValue(attributes) {
    if (this._mods.any(StandardRelax)) {
      return 0;
    }

    const max = Math.max(1, attributes.speedDifficulty / 0.0675);
    let speedValue = Math.pow(5 * max - 4, 3) / 100000;
    const lengthBonus = 0.95 + 0.4 * Math.min(1.0, this._totalHits / 2000)
            + (this._totalHits > 2000 ? Math.log10(this._totalHits / 2000) * 0.5 : 0);

    speedValue *= lengthBonus;

    if (this._effectiveMissCount > 0) {
      const pow = Math.pow(this._effectiveMissCount / this._totalHits, 0.775);

      speedValue *= 0.97 * Math.pow(1 - pow, Math.pow(this._effectiveMissCount, 0.875));
    }

    speedValue *= this._getComboScalingFactor(attributes);

    let approachRateFactor = 0;

    if (attributes.approachRate > 10.33) {
      approachRateFactor = 0.3 * (attributes.approachRate - 10.33);
    }

    speedValue *= 1 + approachRateFactor * lengthBonus;

    if (this._mods.any(StandardHidden)) {
      speedValue *= 1 + 0.04 * (12 - attributes.approachRate);
    }

    const relevantTotalDiff = this._totalHits - attributes.speedNoteCount;
    const relevantCountGreat = Math.max(0, this._countGreat - relevantTotalDiff);
    const relevantCountOk = Math.max(0, this._countOk - Math.max(0, relevantTotalDiff - this._countGreat));
    const relevantCountMeh = Math.max(0, this._countMeh - Math.max(0, relevantTotalDiff - this._countGreat - this._countOk));
    const relevantAccuracy = attributes.speedNoteCount !== 0
      ? (relevantCountGreat * 6 + relevantCountOk * 2 + relevantCountMeh) / (attributes.speedNoteCount * 6)
      : 0;
    const x1 = 0.95 + Math.pow(attributes.overallDifficulty, 2) / 750;
    const x = (this._accuracy + relevantAccuracy) / 2;
    const y = (14.5 - Math.max(attributes.overallDifficulty, 8)) / 2;

    speedValue *= x1 * Math.pow(x, y);

    const doubletapFactor = this._countMeh < this._totalHits / 500
      ? 0 : this._countMeh - this._totalHits / 500;

    speedValue *= Math.pow(0.99, doubletapFactor);

    return speedValue;
  }
  _computeAccuracyValue(attributes) {
    if (this._mods.any(StandardRelax)) {
      return 0;
    }

    let betterAccuracyPercentage = 0;
    const amountHitObjectsWithAccuracy = attributes.hitCircleCount;

    if (amountHitObjectsWithAccuracy > 0) {
      const greats = this._countGreat - (this._totalHits - amountHitObjectsWithAccuracy);

      betterAccuracyPercentage = greats * 6 + this._countOk * 2 + this._countMeh;
      betterAccuracyPercentage /= amountHitObjectsWithAccuracy * 6;
    }

    betterAccuracyPercentage = Math.max(0, betterAccuracyPercentage);

    let accuracyValue = Math.pow(1.52163, attributes.overallDifficulty)
            * Math.pow(betterAccuracyPercentage, 24) * 2.83;

    accuracyValue *= Math.min(1.15, Math.pow(amountHitObjectsWithAccuracy / 1000, 0.3));

    if (this._mods.any(StandardHidden)) {
      accuracyValue *= 1.08;
    }

    if (this._mods.any(StandardFlashlight)) {
      accuracyValue *= 1.02;
    }

    return accuracyValue;
  }
  _computeFlashlightValue(attributes) {
    if (!this._mods.any(StandardFlashlight)) {
      return 0;
    }

    let flashlightValue = Math.pow(attributes.flashlightDifficulty, 2) * 25;

    if (this._effectiveMissCount > 0) {
      const pow1 = Math.pow(this._effectiveMissCount / this._totalHits, 0.775);
      const pow2 = Math.pow(this._effectiveMissCount, 0.875);

      flashlightValue *= 0.97 * Math.pow(1 - pow1, pow2);
    }

    flashlightValue *= this._getComboScalingFactor(attributes);
    flashlightValue *= 0.7 + 0.1 * Math.min(1, this._totalHits / 200)
            + (this._totalHits > 200 ? 0.2 * Math.min(1, (this._totalHits - 200) / 200) : 0);

    flashlightValue *= 0.5 + this._accuracy / 2;
    flashlightValue *= 0.98 + Math.pow(attributes.overallDifficulty, 2) / 2500;

    return flashlightValue;
  }
  _calculateEffectiveMissCount(attributes) {
    let comboBasedMissCount = 0;

    if (attributes.sliderCount > 0) {
      const fullComboThreshold = attributes.maxCombo - 0.1 * attributes.sliderCount;

      if (this._scoreMaxCombo < fullComboThreshold) {
        comboBasedMissCount = fullComboThreshold / Math.max(1, this._scoreMaxCombo);
      }
    }

    comboBasedMissCount = Math.min(comboBasedMissCount, this._countOk + this._countMeh + this._countMiss);

    return Math.max(this._countMiss, comboBasedMissCount);
  }
  _addParams(attributes, score) {
    let _a, _b, _c, _d, _e, _f, _g;

    if (score) {
      this._mods = (_a = score === null || score === void 0 ? void 0 : score.mods) !== null && _a !== void 0 ? _a : new StandardModCombination();
      this._scoreMaxCombo = (_b = score.maxCombo) !== null && _b !== void 0 ? _b : this._scoreMaxCombo;
      this._countGreat = (_c = score.statistics.get(HitResult.Great)) !== null && _c !== void 0 ? _c : this._countGreat;
      this._countOk = (_d = score.statistics.get(HitResult.Ok)) !== null && _d !== void 0 ? _d : this._countOk;
      this._countMeh = (_e = score.statistics.get(HitResult.Meh)) !== null && _e !== void 0 ? _e : this._countMeh;
      this._countMiss = (_f = score.statistics.get(HitResult.Miss)) !== null && _f !== void 0 ? _f : this._countMiss;
      this._accuracy = (_g = score.accuracy) !== null && _g !== void 0 ? _g : this._accuracy;
    }

    if (attributes) {
      this.attributes = attributes;
      this._effectiveMissCount = this._calculateEffectiveMissCount(this.attributes);
    }
  }
  _getComboScalingFactor(attributes) {
    return attributes.maxCombo <= 0
      ? 1
      : Math.min(Math.pow(this._scoreMaxCombo, 0.8) / Math.pow(attributes.maxCombo, 0.8), 1);
  }
  get _totalHits() {
    return this._countGreat + this._countOk + this._countMeh + this._countMiss;
  }
}
StandardPerformanceCalculator.PERFORMANCE_BASE_MULTIPLIER = 1.14;

class StandardDifficultyCalculator extends DifficultyCalculator {
  constructor() {
    super(...arguments);
    this._DIFFICULTY_MULTIPLIER = 0.0675;
  }
  _createDifficultyAttributes(beatmap, mods, skills, clockRate) {
    if (beatmap.hitObjects.length === 0) {
      return new StandardDifficultyAttributes(mods, 0);
    }

    let aimRating = Math.sqrt(skills[0].difficultyValue) * this._DIFFICULTY_MULTIPLIER;
    let speedRating = Math.sqrt(skills[2].difficultyValue) * this._DIFFICULTY_MULTIPLIER;
    let flashlightRating = Math.sqrt(skills[3].difficultyValue) * this._DIFFICULTY_MULTIPLIER;
    const aimRatingNoSliders = Math.sqrt(skills[1].difficultyValue) * this._DIFFICULTY_MULTIPLIER;
    const speedNoteCount = skills[2].relevantNoteCount();
    const sliderFactor = aimRating > 0 ? aimRatingNoSliders / aimRating : 1;

    if (mods.any(StandardTouchDevice)) {
      aimRating = Math.pow(aimRating, 0.8);
      flashlightRating = Math.pow(flashlightRating, 0.8);
    }

    if (mods.any(StandardRelax)) {
      aimRating *= 0.9;
      speedRating = 0;
      flashlightRating *= 0.7;
    }

    const baseAimPerformance = Math.pow(5 * Math.max(1, aimRating / 0.0675) - 4, 3) / 100000;
    const baseSpeedPerformance = Math.pow(5 * Math.max(1, speedRating / 0.0675) - 4, 3) / 100000;
    let baseFlashlightPerformance = 0;

    if (mods.any(StandardFlashlight)) {
      baseFlashlightPerformance = Math.pow(flashlightRating, 2) * 25;
    }

    const basePerformance = Math.pow(Math.pow(baseAimPerformance, 1.1) +
            Math.pow(baseSpeedPerformance, 1.1) +
            Math.pow(baseFlashlightPerformance, 1.1), 1 / 1.1);
    const baseMultiplier = StandardPerformanceCalculator.PERFORMANCE_BASE_MULTIPLIER;
    const starRating = basePerformance > 0.00001
      ? Math.cbrt(baseMultiplier) * 0.027 * (Math.cbrt(100000 / Math.pow(2, 1 / 1.1) * basePerformance) + 4)
      : 0;
    const approachRate = beatmap.difficulty.approachRate;
    const preempt = DifficultyRange.map(approachRate, 1800, 1200, 450) / clockRate;
    const circles = beatmap.hitObjects.filter((h) => h instanceof Circle);
    const sliders = beatmap.hitObjects.filter((h) => h instanceof Slider);
    const spinners = beatmap.hitObjects.filter((h) => h instanceof Spinner);
    const nested = sliders.reduce((sum, slider) => sum + slider.nestedHitObjects.length, 0);
    const hitWindows = new StandardHitWindows();

    hitWindows.setDifficulty(beatmap.difficulty.overallDifficulty);

    const hitWindowGreat = hitWindows.windowFor(HitResult.Great) / clockRate;
    const attributes = new StandardDifficultyAttributes(mods, starRating);

    attributes.aimDifficulty = aimRating;
    attributes.speedDifficulty = speedRating;
    attributes.speedNoteCount = speedNoteCount;
    attributes.flashlightDifficulty = flashlightRating;
    attributes.sliderFactor = sliderFactor;
    attributes.hitCircleCount = circles.length;
    attributes.sliderCount = sliders.length;
    attributes.spinnerCount = spinners.length;
    attributes.maxCombo = circles.length + spinners.length + nested;
    attributes.drainRate = beatmap.difficulty.drainRate;
    attributes.overallDifficulty = (80 - hitWindowGreat) / 6;
    attributes.approachRate = preempt > 1200
      ? (1800 - preempt) / 120
      : (1200 - preempt) / 150 + 5;

    return attributes;
  }
  _createDifficultyHitObjects(beatmap, clockRate) {
    const difficultyObjects = [];

    for (let i = 1; i < beatmap.hitObjects.length; ++i) {
      const lastLast = i > 1 ? beatmap.hitObjects[i - 2] : null;
      const last = beatmap.hitObjects[i - 1];
      const current = beatmap.hitObjects[i];
      const object = new StandardDifficultyHitObject(current, last, lastLast, clockRate, difficultyObjects, difficultyObjects.length);

      difficultyObjects.push(object);
    }

    return difficultyObjects;
  }
  _createSkills(_, mods) {
    return [
      new Aim(mods, true),
      new Aim(mods, false),
      new Speed(mods),
      new Flashlight(mods),
    ];
  }
  get difficultyMods() {
    return [
      new StandardDoubleTime(),
      new StandardHalfTime(),
      new StandardEasy(),
      new StandardHardRock(),
      new StandardFlashlight(),
    ];
  }
}

let StandardAction;

(function(StandardAction) {
  StandardAction[StandardAction['LeftButton'] = 0] = 'LeftButton';
  StandardAction[StandardAction['RightButton'] = 1] = 'RightButton';
  StandardAction[StandardAction['Smoke'] = 2] = 'Smoke';
})(StandardAction || (StandardAction = {}));

class StandardReplayFrame extends ReplayFrame {
  constructor() {
    super(...arguments);
    this.position = new Vector2(0, 0);
    this.actions = new Set();
  }
  fromLegacy(currentFrame) {
    this.startTime = currentFrame.startTime;
    this.interval = currentFrame.interval;
    this.position = currentFrame.position;

    if (currentFrame.mouseLeft) {
      this.actions.add(StandardAction.LeftButton);
    }

    if (currentFrame.mouseRight) {
      this.actions.add(StandardAction.RightButton);
    }

    if (currentFrame.smoke) {
      this.actions.add(StandardAction.Smoke);
    }

    return this;
  }
  toLegacy() {
    let state = ReplayButtonState.None;

    if (this.actions.has(StandardAction.LeftButton)) {
      state |= ReplayButtonState.Left1;
    }

    if (this.actions.has(StandardAction.RightButton)) {
      state |= ReplayButtonState.Right1;
    }

    if (this.actions.has(StandardAction.Smoke)) {
      state |= ReplayButtonState.Smoke;
    }

    return new LegacyReplayFrame(this.startTime, this.interval, this.position, state);
  }
}

class StandardReplayConverter extends ReplayConverter {
  _createConvertibleReplayFrame() {
    return new StandardReplayFrame();
  }
  _isConvertedReplayFrame(frame) {
    return frame instanceof StandardReplayFrame;
  }
}

class StandardRuleset extends Ruleset {
  get id() {
    return 0;
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
    return new StandardModCombination(input);
  }
  _createBeatmapProcessor() {
    return new StandardBeatmapProcessor();
  }
  _createBeatmapConverter() {
    return new StandardBeatmapConverter();
  }
  _createReplayConverter() {
    return new StandardReplayConverter();
  }
  createDifficultyCalculator(beatmap) {
    return new StandardDifficultyCalculator(beatmap, this);
  }
  createPerformanceCalculator(attributes, score) {
    return new StandardPerformanceCalculator(this, attributes, score);
  }
}

export { Aim, Circle, Flashlight, Slider, SliderEnd, SliderHead, SliderRepeat, SliderTail, SliderTick, Speed, Spinner, SpinnerBonusTick, SpinnerTick, StandardAction, StandardAutopilot, StandardAutoplay, StandardBeatmap, StandardBeatmapConverter, StandardBeatmapProcessor, StandardCinema, StandardDifficultyAttributes, StandardDifficultyCalculator, StandardDifficultyHitObject, StandardDoubleTime, StandardEasy, StandardEventGenerator, StandardFlashlight, StandardHalfTime, StandardHardRock, StandardHidden, StandardHitObject, StandardHitWindows, StandardModCombination, StandardNightcore, StandardNoFail, StandardNoMod, StandardPerfect, StandardPerformanceAttributes, StandardPerformanceCalculator, StandardRelax, StandardReplayConverter, StandardReplayFrame, StandardRuleset, StandardSpunOut, StandardStrainSkill, StandardSuddenDeath, StandardTouchDevice };
