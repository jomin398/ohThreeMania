import { HitObject, EventGenerator, HitType, Autoplay, Cinema, DoubleTime, ModBitwise, ModType, Easy, Flashlight, HalfTime, HardRock, Hidden, NoMod, NoFail, SuddenDeath, Nightcore, Perfect, ModCombination, RulesetBeatmap, RoundHelper, HitSound, Vector2, BeatmapConverter, FastRandom, BeatmapProcessor, DifficultyAttributes, PerformanceAttributes, DifficultyHitObject, StrainDecaySkill, DifficultyCalculator, SortHelper, PerformanceCalculator, HitResult, ReplayFrame, LegacyReplayFrame, ReplayButtonState, ReplayConverter, HitWindows, Ruleset } from 'osu-classes';

class ManiaHitObject extends HitObject {
  constructor() {
    super(...arguments);
    this._originalColumn = 0;
    this._column = 0;
  }
  get originalColumn() {
    return this._originalColumn;
  }
  set originalColumn(value) {
    this._originalColumn = value;
    this._column = value;
  }
  get column() {
    return this._column;
  }
  set column(value) {
    this._column = value;
  }
  get startX() {
    return this._column;
  }
  get endX() {
    return this.startX;
  }
  clone() {
    const cloned = super.clone();

    cloned.originalColumn = this.originalColumn;
    cloned.column = this.column;

    return cloned;
  }
}

class Note extends ManiaHitObject {
}

class HoldHead extends Note {
}

class HoldTail extends Note {
}

class HoldTick extends ManiaHitObject {
}

class ManiaEventGenerator extends EventGenerator {
  static *generateHoldTicks(hold) {
    if (hold.tickInterval === 0) {
      return;
    }

    const head = new HoldHead();

    head.startTime = hold.startTime;
    head.column = hold.column;
    yield head;

    const tickInterval = hold.tickInterval;
    let time = hold.startTime + tickInterval;
    const endTime = hold.endTime - tickInterval;

    while (time <= endTime) {
      const tick = new HoldTick();

      tick.startTime = time;
      yield tick;
      time += tickInterval;
    }

    const tail = new HoldTail();

    tail.startTime = hold.endTime;
    tail.column = hold.column;
    yield tail;
  }
}

class Hold extends ManiaHitObject {
  constructor() {
    super(...arguments);
    this.tickInterval = 50;
    this.nodeSamples = [];
    this.endTime = 0;
    this.hitType = HitType.Hold;
  }
  get duration() {
    return this.endTime - this.startTime;
  }
  get head() {
    const head = this.nestedHitObjects.find((n) => n instanceof HoldHead);

    if (head) {
      head.startTime = this.startTime;
    }

    return head || null;
  }
  get tail() {
    const tail = this.nestedHitObjects.find((n) => n instanceof HoldTail);

    if (tail) {
      tail.startTime = this.endTime;
    }

    return tail || null;
  }
  get column() {
    return this._column;
  }
  set column(value) {
    this._column = value;

    if (this.head) {
      this.head.column = value;
    }

    if (this.tail) {
      this.tail.column = value;
    }
  }
  applyDefaultsToSelf(controlPoints, difficulty) {
    super.applyDefaultsToSelf(controlPoints, difficulty);

    const timingPoint = controlPoints.timingPointAt(this.startTime);

    this.tickInterval = timingPoint.beatLength / difficulty.sliderTickRate;
  }
  createNestedHitObjects() {
    this.nestedHitObjects = [];

    for (const nested of ManiaEventGenerator.generateHoldTicks(this)) {
      this.nestedHitObjects.push(nested);
    }
  }
  clone() {
    const cloned = super.clone();

    cloned.endTime = this.endTime;
    cloned.nodeSamples = this.nodeSamples.map((n) => n.map((s) => s.clone()));
    cloned.tickInterval = this.tickInterval;

    return cloned;
  }
}

class ManiaAutoplay extends Autoplay {
}

class ManiaCinema extends Cinema {
}

class ManiaDoubleTime extends DoubleTime {
  constructor() {
    super(...arguments);
    this.multiplier = 1;
  }
}

class ManiaDualStages {
  constructor() {
    this.name = 'Dual Stages';
    this.acronym = 'DS';
    this.bitwise = ModBitwise.KeyCoop;
    this.type = ModType.Conversion;
    this.multiplier = 1;
    this.isRanked = false;
    this.incompatibles = ModBitwise.None;
  }
  applyToConverter(converter) {
    converter.isDual = true;
  }
}

class ManiaEasy extends Easy {
}

class ManiaFadeIn {
  constructor() {
    this.name = 'Fade In';
    this.acronym = 'FI';
    this.bitwise = ModBitwise.FadeIn;
    this.type = ModType.DifficultyIncrease;
    this.multiplier = 1;
    this.isRanked = true;
    this.incompatibles = ModBitwise.Hidden | ModBitwise.Flashlight;
  }
}

class ManiaFlashlight extends Flashlight {
  constructor() {
    super(...arguments);
    this.multiplier = 1;
    this.incompatibles = ModBitwise.Hidden | ModBitwise.FadeIn;
  }
}

class ManiaHalfTime extends HalfTime {
  constructor() {
    super(...arguments);
    this.multiplier = 0.5;
  }
}

class ManiaHardRock extends HardRock {
  constructor() {
    super(...arguments);
    this.multiplier = 1;
  }
}

class ManiaHidden extends Hidden {
  constructor() {
    super(...arguments);
    this.multiplier = 1;
    this.incompatibles = ModBitwise.FadeIn | ModBitwise.Flashlight;
  }
}

class ManiaKeyMod {
  constructor() {
    this.type = ModType.Conversion;
    this.multiplier = 1;
    this.isRanked = true;
    this.incompatibles = ModBitwise.KeyMod;
  }
  applyToConverter(converter) {
    converter.targetColumns = this.keyCount;
  }
}

class ManiaKey1 extends ManiaKeyMod {
  constructor() {
    super(...arguments);
    this.name = 'One Key';
    this.acronym = '1K';
    this.bitwise = ModBitwise.Key1;
    this.keyCount = 1;
    this.incompatibles = ModBitwise.KeyMod ^ ModBitwise.Key1;
  }
}

class ManiaKey2 extends ManiaKeyMod {
  constructor() {
    super(...arguments);
    this.name = 'Two Keys';
    this.acronym = '2K';
    this.bitwise = ModBitwise.Key2;
    this.keyCount = 2;
    this.incompatibles = ModBitwise.KeyMod ^ ModBitwise.Key2;
  }
}

class ManiaKey3 extends ManiaKeyMod {
  constructor() {
    super(...arguments);
    this.name = 'Three Keys';
    this.acronym = '3K';
    this.bitwise = ModBitwise.Key3;
    this.keyCount = 3;
    this.incompatibles = ModBitwise.KeyMod ^ ModBitwise.Key3;
  }
}

class ManiaKey4 extends ManiaKeyMod {
  constructor() {
    super(...arguments);
    this.name = 'Four Keys';
    this.acronym = '4K';
    this.bitwise = ModBitwise.Key4;
    this.keyCount = 4;
    this.incompatibles = ModBitwise.KeyMod ^ ModBitwise.Key4;
  }
}

class ManiaKey5 extends ManiaKeyMod {
  constructor() {
    super(...arguments);
    this.name = 'Five Keys';
    this.acronym = '5K';
    this.bitwise = ModBitwise.Key5;
    this.keyCount = 5;
    this.incompatibles = ModBitwise.KeyMod ^ ModBitwise.Key5;
  }
}

class ManiaKey6 extends ManiaKeyMod {
  constructor() {
    super(...arguments);
    this.name = 'Six Keys';
    this.acronym = '6K';
    this.bitwise = ModBitwise.Key6;
    this.keyCount = 6;
    this.incompatibles = ModBitwise.KeyMod ^ ModBitwise.Key6;
  }
}

class ManiaKey7 extends ManiaKeyMod {
  constructor() {
    super(...arguments);
    this.name = 'Seven Keys';
    this.acronym = '7K';
    this.bitwise = ModBitwise.Key7;
    this.keyCount = 7;
    this.incompatibles = ModBitwise.KeyMod ^ ModBitwise.Key7;
  }
}

class ManiaKey8 extends ManiaKeyMod {
  constructor() {
    super(...arguments);
    this.name = 'Eight Keys';
    this.acronym = '8K';
    this.bitwise = ModBitwise.Key8;
    this.keyCount = 8;
    this.incompatibles = ModBitwise.KeyMod ^ ModBitwise.Key8;
  }
}

class ManiaKey9 extends ManiaKeyMod {
  constructor() {
    super(...arguments);
    this.name = 'Nine Keys';
    this.acronym = '9K';
    this.bitwise = ModBitwise.Key9;
    this.keyCount = 9;
    this.incompatibles = ModBitwise.KeyMod ^ ModBitwise.Key9;
  }
}

class ManiaMirror {
  constructor() {
    this.name = 'Mirror';
    this.acronym = 'MR';
    this.bitwise = ModBitwise.Mirror;
    this.type = ModType.Conversion;
    this.multiplier = 1;
    this.isRanked = true;
    this.incompatibles = ModBitwise.None;
  }
  applyToBeatmap(beatmap) {
    beatmap.hitObjects.forEach((h) => {
      h.column = beatmap.totalColumns - 1 - h.column;
    });
  }
}

class ManiaNoMod extends NoMod {
}

class ManiaNoFail extends NoFail {
}

class ManiaSuddenDeath extends SuddenDeath {
}

class ManiaNightcore extends Nightcore {
}

class ManiaPerfect extends Perfect {
}

class ManiaRandom {
  constructor() {
    this.name = 'Random';
    this.acronym = 'RD';
    this.bitwise = ModBitwise.Random;
    this.type = ModType.Conversion;
    this.multiplier = 1;
    this.isRanked = false;
    this.incompatibles = ModBitwise.None;
  }
  applyToBeatmap(beatmap) {
    const random = [];
    const shuffled = [];

    for (let i = 0; i < beatmap.totalColumns; ++i) {
      random.push(Math.random());
      shuffled.push(i);
    }

    shuffled.sort((a, b) => random[shuffled.indexOf(a)] - random[shuffled.indexOf(b)]);
    beatmap.hitObjects.forEach((h) => (h.column = shuffled[h.column]));
  }
}

class ManiaModCombination extends ModCombination {
  get mode() {
    return 3;
  }
  get _availableMods() {
    return [
      new ManiaNoMod(),
      new ManiaNoFail(),
      new ManiaEasy(),
      new ManiaHidden(),
      new ManiaFadeIn(),
      new ManiaHardRock(),
      new ManiaSuddenDeath(),
      new ManiaDoubleTime(),
      new ManiaHalfTime(),
      new ManiaNightcore(),
      new ManiaFlashlight(),
      new ManiaAutoplay(),
      new ManiaPerfect(),
      new ManiaCinema(),
      new ManiaKey1(),
      new ManiaKey2(),
      new ManiaKey3(),
      new ManiaKey4(),
      new ManiaKey5(),
      new ManiaKey6(),
      new ManiaKey7(),
      new ManiaKey8(),
      new ManiaKey9(),
      new ManiaRandom(),
      new ManiaDualStages(),
      new ManiaMirror(),
    ];
  }
}

class ManiaBeatmap extends RulesetBeatmap {
  constructor(stage, columns) {
    super();
    this.mods = new ManiaModCombination();
    this.stages = [];
    this.originalTotalColumns = 0;
    this.hitObjects = [];
    this.stages.push(stage);
    this.originalTotalColumns = columns || stage.columns;
  }
  get mode() {
    return 3;
  }
  get totalColumns() {
    return this.stages.reduce((c, s) => c + s.columns, 0);
  }
  get maxCombo() {
    return this.hitObjects.reduce((combo, obj) => {
      if (obj instanceof Note) {
        return combo + 1;
      }

      if (obj instanceof Hold) {
        return combo + 1 + Math.trunc((obj.endTime - obj.startTime) / 100);
      }

      return combo;
    }, 0);
  }
  get notes() {
    return this.hitObjects.filter((h) => h instanceof Note);
  }
  get holds() {
    return this.hitObjects.filter((h) => h instanceof Hold);
  }
}

class PatternGenerator {
  constructor(hitObject, beatmap, originalBeatmap, previousPattern, rng) {
    this._conversionDiff = null;
    this.hitObject = hitObject;
    this.beatmap = beatmap;
    this.originalBeatmap = originalBeatmap;
    this.previousPattern = previousPattern;
    this.totalColumns = beatmap.totalColumns;
    this.randomStart = beatmap.totalColumns === 8 ? 1 : 0;
    this.rng = rng;
  }
  getColumn(position, allowSpecial = false) {
    if (allowSpecial && this.totalColumns === 8) {
      const divisor = Math.round(512 / 7 * 100000) / 100000;
      const x = Math.floor(position / divisor);

      return Math.max(0, Math.min(x, 6)) + 1;
    }

    const divisor = Math.round(512 / this.totalColumns * 100000) / 100000;
    const x = Math.floor(position / divisor);

    return Math.max(0, Math.min(x, this.totalColumns - 1));
  }
  getRandomNoteCount(p2, p3, p4 = 0, p5 = 0, p6 = 0) {
    if (p2 < 0 || p2 > 1) {
      throw new Error('p2 is not in range 0-1');
    }

    if (p3 < 0 || p3 > 1) {
      throw new Error('p3 is not in range 0-1');
    }

    if (p4 < 0 || p4 > 1) {
      throw new Error('p4 is not in range 0-1');
    }

    if (p5 < 0 || p5 > 1) {
      throw new Error('p5 is not in range 0-1');
    }

    if (p6 < 0 || p6 > 1) {
      throw new Error('p6 is not in range 0-1');
    }

    const value = this.rng.nextDouble();

    if (value >= 1 - p6) {
      return 6;
    }

    if (value >= 1 - p5) {
      return 5;
    }

    if (value >= 1 - p4) {
      return 4;
    }

    if (value >= 1 - p3) {
      return 3;
    }

    return value >= 1 - p2 ? 2 : 1;
  }
  get conversionDifficulty() {
    if (this._conversionDiff !== null) {
      return this._conversionDiff;
    }

    const hitObjects = this.originalBeatmap.hitObjects;
    const firstObject = hitObjects[0];
    const lastObject = hitObjects[hitObjects.length - 1];
    const firstStartTime = firstObject.startTime || 0;
    const lastStartTime = lastObject.startTime || 0;
    const drain = lastStartTime - firstStartTime - this.originalBeatmap.totalBreakTime;
    let drainTime = Math.trunc(drain / 1000);

    if (drainTime === 0) {
      drainTime = 10000;
    }

    const difficulty = this.originalBeatmap.difficulty;

    this._conversionDiff = Math.max(4, Math.min(difficulty.approachRate, 7));
    this._conversionDiff += difficulty.drainRate;
    this._conversionDiff /= 1.5;
    this._conversionDiff += (hitObjects.length / drainTime) * Math.fround(9);
    this._conversionDiff = Math.fround((this._conversionDiff / 38) * 5) / 1.15;
    this._conversionDiff = Math.min(this._conversionDiff, 12);

    return this._conversionDiff;
  }
  findAvailableColumn(column, options) {
    const patterns = options.patterns || [];
    const lowerBound = options.lowerBound || this.randomStart;
    const upperBound = options.upperBound || this.totalColumns;
    const nextColumn = options.nextColumn || (() => {
      return this.getRandomColumn(lowerBound, upperBound);
    });
    const validate = options.validate || (() => true);

    const isValid = (c) => {
      return validate(c) !== false
                && !patterns.find((p) => p.columnHasObject(c));
    };

    if (isValid(column)) {
      return column;
    }

    let hasValidColumns = false;

    for (let i = lowerBound; i < upperBound; ++i) {
      hasValidColumns = isValid(i);

      if (hasValidColumns) {
        break;
      }
    }

    if (!hasValidColumns) {
      throw new Error('There were not enough columns to complete conversion.');
    }

    do {
      column = nextColumn(column);
    } while (!isValid(column));

    return column;
  }
  getRandomColumn(lowerBound, upperBound) {
    lowerBound = lowerBound || this.randomStart;
    upperBound = upperBound || this.totalColumns;

    return this.rng.nextInt(lowerBound, upperBound);
  }
}

let PatternType;

(function(PatternType) {
  PatternType[PatternType['None'] = 0] = 'None';
  PatternType[PatternType['ForceStack'] = 1] = 'ForceStack';
  PatternType[PatternType['ForceNotStack'] = 2] = 'ForceNotStack';
  PatternType[PatternType['KeepSingle'] = 4] = 'KeepSingle';
  PatternType[PatternType['LowProbability'] = 8] = 'LowProbability';
  PatternType[PatternType['Alternate'] = 16] = 'Alternate';
  PatternType[PatternType['ForceSigSlider'] = 32] = 'ForceSigSlider';
  PatternType[PatternType['ForceNotSlider'] = 64] = 'ForceNotSlider';
  PatternType[PatternType['Gathered'] = 128] = 'Gathered';
  PatternType[PatternType['Mirror'] = 256] = 'Mirror';
  PatternType[PatternType['Reverse'] = 512] = 'Reverse';
  PatternType[PatternType['Cycle'] = 1024] = 'Cycle';
  PatternType[PatternType['Stair'] = 2048] = 'Stair';
  PatternType[PatternType['ReverseStair'] = 4096] = 'ReverseStair';
})(PatternType || (PatternType = {}));

class Pattern {
  constructor() {
    this.hitObjects = [];
    this.containedColumns = new Set();
  }
  columnHasObject(column) {
    return this.containedColumns.has(column);
  }
  get columnsWithObjects() {
    return this.containedColumns.size;
  }
  addHitObject(hitObject) {
    this.hitObjects.push(hitObject);
    this.containedColumns.add(hitObject.column);
  }
  addPatternHitObjects(other) {
    this.hitObjects.push(...other.hitObjects);
    other.hitObjects.forEach((h) => {
      this.containedColumns.add(h.column);
    });
  }
  clear() {
    this.hitObjects.length = 0;
    this.containedColumns.clear();
  }
}

class DistanceObjectPatternGenerator extends PatternGenerator {
  constructor(hitObject, beatmap, originalBeatmap, previousPattern, rng) {
    super(hitObject, beatmap, originalBeatmap, previousPattern, rng);
    this.convertType = PatternType.None;

    if (!beatmap.controlPoints.effectPointAt(hitObject.startTime).kiai) {
      this.convertType = PatternType.LowProbability;
    }

    const slider = hitObject;
    const timingPoint = beatmap.controlPoints
      .timingPointAt(hitObject.startTime);
    const difficultyPoint = beatmap.controlPoints.difficultyPointAt(hitObject.startTime);
    const beatLength = timingPoint.beatLength * difficultyPoint.bpmMultiplier;

    this.spanCount = slider.repeats + 1 || 1;
    this.startTime = RoundHelper.round(hitObject.startTime);

    const sliderMultiplier = beatmap.difficulty.sliderMultiplier;

    this.endTime = ((slider.path.distance || 0)
            * beatLength * this.spanCount * 0.01) / sliderMultiplier;

    this.endTime = Math.trunc(Math.floor(this.startTime + this.endTime));

    const duration = this.endTime - this.startTime;

    this.segmentDuration = (duration / this.spanCount) >> 0;
  }
  *generate() {
    const originalPattern = this.generatePattern();

    if (originalPattern.hitObjects.length === 1) {
      return yield originalPattern;
    }

    const intermediatePattern = new Pattern();
    const endTimePattern = new Pattern();

    for (const hitObject of originalPattern.hitObjects) {
      let endTime = hitObject.endTime;

      endTime = endTime || hitObject.startTime;

      if (this.endTime !== RoundHelper.round(endTime)) {
        intermediatePattern.addHitObject(hitObject);
      }
      else {
        endTimePattern.addHitObject(hitObject);
      }
    }

    yield intermediatePattern;
    yield endTimePattern;
  }
  generatePattern() {
    if (this.totalColumns === 1) {
      const pattern = new Pattern();

      this.addToPattern(pattern, 0, this.startTime, this.endTime);

      return pattern;
    }

    if (this.spanCount > 1) {
      if (this.segmentDuration <= 90) {
        return this.generateRandomHoldNotes(this.startTime, 1);
      }

      if (this.segmentDuration <= 120) {
        this.convertType |= PatternType.ForceNotStack;

        return this.generateRandomNotes(this.startTime, this.spanCount + 1);
      }

      if (this.segmentDuration <= 160) {
        return this.generateStair(this.startTime);
      }

      if (this.segmentDuration <= 200 && this.conversionDifficulty > 3) {
        return this.generateRandomMultipleNotes(this.startTime);
      }

      if (this.endTime - this.startTime >= 4000) {
        return this.generateNRandomNotes(this.startTime, 0.23, 0, 0);
      }

      const columns = this.totalColumns - 1 - this.randomStart;

      if (this.segmentDuration > 400 && this.spanCount < columns) {
        return this.generateTiledHoldNotes(this.startTime);
      }

      return this.generateHoldAndNormalNotes(this.startTime);
    }

    if (this.segmentDuration <= 110) {
      if (this.previousPattern.columnsWithObjects < this.totalColumns) {
        this.convertType |= PatternType.ForceNotStack;
      }
      else {
        this.convertType &= ~PatternType.ForceNotStack;
      }

      const noteCount = this.segmentDuration < 80 ? 1 : 2;

      return this.generateRandomNotes(this.startTime, noteCount);
    }

    if (this.conversionDifficulty > 6.5) {
      if (this.convertType & PatternType.LowProbability) {
        return this.generateNRandomNotes(this.startTime, 0.78, 0.3, 0);
      }

      return this.generateNRandomNotes(this.startTime, 0.85, 0.36, 0.03);
    }

    if (this.conversionDifficulty > 4) {
      if (this.convertType & PatternType.LowProbability) {
        return this.generateNRandomNotes(this.startTime, 0.43, 0.08, 0);
      }

      return this.generateNRandomNotes(this.startTime, 0.56, 0.18, 0);
    }

    if (this.conversionDifficulty > 2.5) {
      if (this.convertType & PatternType.LowProbability) {
        return this.generateNRandomNotes(this.startTime, 0.3, 0, 0);
      }

      return this.generateNRandomNotes(this.startTime, 0.37, 0.08, 0);
    }

    if (this.convertType & PatternType.LowProbability) {
      return this.generateNRandomNotes(this.startTime, 0.17, 0, 0);
    }

    return this.generateNRandomNotes(this.startTime, 0.27, 0, 0);
  }
  generateRandomHoldNotes(startTime, noteCount) {
    const pattern = new Pattern();
    const usableColumns = this.totalColumns -
            this.randomStart -
            this.previousPattern.columnsWithObjects;
    let column = this.getRandomColumn();

    for (let i = 0, len = Math.min(usableColumns, noteCount); i < len; ++i) {
      const options = {
        patterns: [pattern, this.previousPattern],
      };

      column = this.findAvailableColumn(column, options);
      this.addToPattern(pattern, column, startTime, this.endTime);
    }

    for (let i = 0, len = noteCount - usableColumns; i < len; ++i) {
      const options = {
        patterns: [pattern],
      };

      column = this.findAvailableColumn(column, options);
      this.addToPattern(pattern, column, startTime, this.endTime);
    }

    return pattern;
  }
  generateRandomNotes(startTime, noteCount) {
    const pattern = new Pattern();
    const startX = this.hitObject.startX;
    let column = this.getColumn(startX || 0, true);
    const isForceNotStack = !!(this.convertType & PatternType.ForceNotStack);
    const lessThanTotalColumns = this.previousPattern.columnsWithObjects < this.totalColumns;

    if (isForceNotStack && lessThanTotalColumns) {
      const options = {
        patterns: [this.previousPattern],
      };

      column = this.findAvailableColumn(column, options);
    }

    let lastColumn = column;

    for (let i = 0; i < noteCount; ++i) {
      this.addToPattern(pattern, column, startTime, startTime);

      const options = {
        validate: (c) => c !== lastColumn,
      };

      startTime += this.segmentDuration;
      column = this.findAvailableColumn(column, options);
      lastColumn = column;
    }

    return pattern;
  }
  generateStair(startTime) {
    const pattern = new Pattern();
    const startX = this.hitObject.startX;
    let column = this.getColumn(startX || 0, true);
    let increasing = this.rng.nextDouble() > 0.5;

    for (let i = 0; i <= this.spanCount; ++i) {
      this.addToPattern(pattern, column, startTime, startTime);
      startTime += this.segmentDuration;

      if (increasing) {
        if (column >= this.totalColumns - 1) {
          increasing = false;
          --column;
        }
        else {
          ++column;
        }
      }
      else {
        if (column <= this.randomStart) {
          increasing = true;
          ++column;
        }
        else {
          --column;
        }
      }
    }

    return pattern;
  }
  generateRandomMultipleNotes(startTime) {
    const pattern = new Pattern();
    const legacy = this.totalColumns >= 4 && this.totalColumns <= 8;
    const interval = this.rng.nextInt(1, this.totalColumns - (legacy ? 1 : 0));
    const startX = this.hitObject.startX;
    let column = this.getColumn(startX || 0, true);

    for (let i = 0; i <= this.spanCount; ++i) {
      this.addToPattern(pattern, column, startTime, startTime);
      column += interval;

      if (column >= this.totalColumns - this.randomStart) {
        column =
                    column - this.totalColumns - this.randomStart + (legacy ? 1 : 0);
      }

      column += this.randomStart;

      if (this.totalColumns > 2) {
        this.addToPattern(pattern, column, startTime, startTime);
      }

      column = this.getRandomColumn();
      startTime += this.segmentDuration;
    }

    return pattern;
  }
  generateNRandomNotes(startTime, p2, p3, p4) {
    switch (this.totalColumns) {
      case 2:
        p2 = 0;
        p3 = 0;
        p4 = 0;
        break;
      case 3:
        p2 = Math.min(p2, 0.1);
        p3 = 0;
        p4 = 0;
        break;
      case 4:
        p2 = Math.min(p2, 0.3);
        p3 = Math.min(p3, 0.04);
        p4 = 0;
        break;
      case 5:
        p2 = Math.min(p2, 0.34);
        p3 = Math.min(p3, 0.1);
        p4 = Math.min(p4, 0.03);
        break;
    }

    const isDoubleAtObject = !!this.hitObject.samples.find(findDoubleSample);
    const isDoubleAtTime = !!this.hitSamplesAt(this.startTime).find(findDoubleSample);
    const isLowProbability = this.convertType & PatternType.LowProbability;
    const canGenerateTwoNotes = !isLowProbability && (isDoubleAtObject || isDoubleAtTime);

    if (canGenerateTwoNotes) {
      p2 = 1;
    }

    const notes = this.getRandomNoteCount(p2, p3, p4);

    return this.generateRandomHoldNotes(startTime, notes);

    function findDoubleSample(sample) {
      return (sample.hitSound === HitSound[HitSound.Clap] ||
                sample.hitSound === HitSound[HitSound.Finish]);
    }
  }
  generateTiledHoldNotes(startTime) {
    const pattern = new Pattern();
    const columnRepeat = Math.min(this.spanCount, this.totalColumns);
    const endTime = startTime + this.segmentDuration * this.spanCount;
    const startX = this.hitObject.startX;
    let column = this.getColumn(startX || 0, true);
    const isForceNotStack = !!(this.convertType & PatternType.ForceNotStack);
    const lessThanTotalColumns = this.previousPattern.columnsWithObjects < this.totalColumns;

    if (isForceNotStack && lessThanTotalColumns) {
      const options = {
        patterns: [this.previousPattern],
      };

      column = this.findAvailableColumn(column, options);
    }

    for (let i = 0; i < columnRepeat; ++i) {
      const options = {
        patterns: [pattern],
      };

      column = this.findAvailableColumn(column, options);
      this.addToPattern(pattern, column, startTime, endTime);
      startTime += this.segmentDuration;
    }

    return pattern;
  }
  generateHoldAndNormalNotes(startTime) {
    const pattern = new Pattern();
    const startX = this.hitObject.startX;
    let holdColumn = this.getColumn(startX || 0, true);
    const isForceNotStack = !!(this.convertType & PatternType.ForceNotStack);
    const lessThanTotalColumns = this.previousPattern.columnsWithObjects < this.totalColumns;

    if (isForceNotStack && lessThanTotalColumns) {
      const options = {
        patterns: [this.previousPattern],
      };

      holdColumn = this.findAvailableColumn(holdColumn, options);
    }

    this.addToPattern(pattern, holdColumn, startTime, this.endTime);

    let column = this.getRandomColumn();
    let noteCount = 0;

    if (this.conversionDifficulty > 6.5) {
      noteCount = this.getRandomNoteCount(0.63, 0);
    }
    else if (this.conversionDifficulty > 4) {
      const p2 = this.totalColumns < 6 ? 0.12 : 0.45;

      noteCount = this.getRandomNoteCount(p2, 0);
    }
    else if (this.conversionDifficulty > 2.5) {
      const p2 = this.totalColumns < 6 ? 0 : 0.24;

      noteCount = this.getRandomNoteCount(p2, 0);
    }

    noteCount = Math.min(this.totalColumns - 1, noteCount);

    const ignoreHead = !this.hitSamplesAt(startTime).find((sample) => {
      return (sample.hitSound === HitSound[HitSound.Whistle] ||
                sample.hitSound === HitSound[HitSound.Finish] ||
                sample.hitSound === HitSound[HitSound.Clap]);
    });
    const rowPattern = new Pattern();

    for (let i = 0; i <= this.spanCount; ++i) {
      if (!(ignoreHead && startTime === this.startTime)) {
        for (let j = 0; j < noteCount; ++j) {
          const options = {
            validate: (c) => c !== holdColumn,
            patterns: [rowPattern],
          };

          column = this.findAvailableColumn(column, options);
          this.addToPattern(rowPattern, column, startTime, startTime);
        }
      }

      pattern.addPatternHitObjects(rowPattern);
      rowPattern.clear();
      startTime += this.segmentDuration;
    }

    return pattern;
  }
  hitSamplesAt(time) {
    const nodeSamples = this.nodeSamplesAt(time);

    return nodeSamples[0] || this.hitObject.samples;
  }
  nodeSamplesAt(time) {
    if (!(this.hitObject.hitType & HitType.Slider)) {
      return [];
    }

    const slider = this.hitObject;
    let index = 0;

    if (this.segmentDuration) {
      index = (time - this.startTime) / this.segmentDuration;
    }

    return index ? slider.nodeSamples.slice(index) : slider.nodeSamples;
  }
  addToPattern(pattern, column, startTime, endTime) {
    let _a, _b;

    if (startTime === endTime) {
      const note = new Note();
      const posData = this.hitObject;

      note.startTime = startTime;
      note.originalColumn = column;
      note.hitType = HitType.Normal | (this.hitObject.hitType & HitType.NewCombo);
      note.samples = this.hitSamplesAt(startTime);
      note.startPosition = (_a = posData === null || posData === void 0 ? void 0 : posData.startPosition) !== null && _a !== void 0 ? _a : new Vector2(256, 192);
      pattern.addHitObject(note);
    }
    else {
      const hold = new Hold();
      const posData = this.hitObject;

      hold.startTime = startTime;
      hold.endTime = endTime;
      hold.originalColumn = column;
      hold.hitType = HitType.Hold | (this.hitObject.hitType & HitType.NewCombo);
      hold.samples = this.hitSamplesAt(startTime);
      hold.nodeSamples = this.nodeSamplesAt(startTime);
      hold.startPosition = (_b = posData === null || posData === void 0 ? void 0 : posData.startPosition) !== null && _b !== void 0 ? _b : new Vector2(256, 192);
      pattern.addHitObject(hold);
    }
  }
}
DistanceObjectPatternGenerator.BASE_SCORING_DISTANCE = 100;

class EndTimeObjectPatternGenerator extends PatternGenerator {
  constructor(hitObject, beatmap, originalBeatmap, previousPattern, rng) {
    super(hitObject, beatmap, originalBeatmap, previousPattern, rng);
    this.endTime = Math.trunc(hitObject.endTime || 0);
    this.convertType =
            previousPattern.columnsWithObjects === this.totalColumns
              ? PatternType.None
              : PatternType.ForceNotStack;
  }
  *generate() {
    const pattern = new Pattern();
    const shouldGenerateHold = this.endTime - this.hitObject.startTime >= 100;

    switch (this.totalColumns) {
      case 8: {
        const findFinish = (sample) => {
          return sample.hitSound === HitSound[HitSound.Finish];
        };

        const hasFinish = !!this.hitObject.samples.find(findFinish);

        if (hasFinish && this.endTime - this.hitObject.startTime < 1000) {
          this.addToPattern(pattern, 0, shouldGenerateHold);
          break;
        }

        this.addToPattern(pattern, this.getRandomColumn(), shouldGenerateHold);
        break;
      }

      default:
        this.addToPattern(pattern, this.getRandomColumn(0), shouldGenerateHold);
        break;
    }

    yield pattern;
  }
  getRandomColumn(lowerBound) {
    const column = super.getRandomColumn(lowerBound);

    if (this.convertType & PatternType.ForceNotStack) {
      const options = {
        lowerBound,
        patterns: [this.previousPattern],
      };

      return this.findAvailableColumn(column, options);
    }

    return this.findAvailableColumn(column, { lowerBound });
  }
  addToPattern(pattern, column, isHoldNote) {
    let _a, _b, _c;

    if (isHoldNote) {
      const hold = new Hold();
      const posData = this.hitObject;

      hold.startTime = this.hitObject.startTime;
      hold.endTime = this.endTime;
      hold.originalColumn = column;
      hold.hitType = HitType.Hold | (this.hitObject.hitType & HitType.NewCombo);
      hold.samples = this.hitObject.samples;
      hold.nodeSamples = (_a = this.hitObject.nodeSamples) !== null && _a !== void 0 ? _a : [];
      hold.startPosition = (_b = posData === null || posData === void 0 ? void 0 : posData.startPosition) !== null && _b !== void 0 ? _b : new Vector2(256, 192);
      pattern.addHitObject(hold);
    }
    else {
      const note = new Note();
      const posData = this.hitObject;

      note.startTime = this.hitObject.startTime;
      note.originalColumn = column;
      note.hitType = HitType.Normal | (this.hitObject.hitType & HitType.NewCombo);
      note.samples = this.hitObject.samples;
      note.startPosition = (_c = posData === null || posData === void 0 ? void 0 : posData.startPosition) !== null && _c !== void 0 ? _c : new Vector2(256, 192);
      pattern.addHitObject(note);
    }
  }
}

class HitObjectPatternGenerator extends PatternGenerator {
  constructor(hitObject, beatmap, originalBeatmap, previousPattern, rng, previousTime, previousPosition, density, lastStair) {
    super(hitObject, beatmap, originalBeatmap, previousPattern, rng);
    this.stairType = PatternType.None;
    this.convertType = PatternType.None;
    this.stairType = lastStair;

    const timingPoint = beatmap.controlPoints
      .timingPointAt(hitObject.startTime);
    const effectPoint = beatmap.controlPoints
      .effectPointAt(hitObject.startTime);
    const startPosition = hitObject.startPosition;
    const posSeparation = (startPosition || new Vector2(0, 0))
      .fsubtract(previousPosition)
      .flength();
    const timeSeparation = hitObject.startTime - previousTime;

    if (timeSeparation <= 80) {
      this.convertType |= PatternType.ForceNotStack | PatternType.KeepSingle;
    }
    else if (timeSeparation <= 95) {
      this.convertType |= PatternType.ForceNotStack | PatternType.KeepSingle | lastStair;
    }
    else if (timeSeparation <= 105) {
      this.convertType |=
                PatternType.ForceNotStack | PatternType.LowProbability;
    }
    else if (timeSeparation <= 125) {
      this.convertType |= PatternType.ForceNotStack;
    }
    else if (timeSeparation <= 135 && posSeparation < 20) {
      this.convertType |= PatternType.Cycle | PatternType.KeepSingle;
    }
    else if (timeSeparation <= 150 && posSeparation < 20) {
      this.convertType |= PatternType.ForceStack | PatternType.LowProbability;
    }
    else if (posSeparation < 20 && density >= timingPoint.beatLength / 2.5) {
      this.convertType |= PatternType.Reverse | PatternType.LowProbability;
    }
    else if (density < timingPoint.beatLength / 2.5 || effectPoint.kiai) ;
    else {
      this.convertType |= PatternType.LowProbability;
    }

    if (!(this.convertType & PatternType.KeepSingle)) {
      const isFinish = !!hitObject.samples.find((sample) => {
        return sample.hitSound === HitSound[HitSound.Finish];
      });
      const isClap = !!hitObject.samples.find((sample) => {
        return sample.hitSound === HitSound[HitSound.Clap];
      });

      if (isFinish && this.totalColumns !== 8) {
        this.convertType |= PatternType.Mirror;
      }
      else if (isClap) {
        this.convertType |= PatternType.Gathered;
      }
    }
  }
  *generate() {
    const p = this._generateCore();
    const isStair = !!(this.convertType & PatternType.Stair);
    const isReverseStair = !!(this.convertType & PatternType.ReverseStair);

    for (const hitObject of p.hitObjects) {
      if (isStair && hitObject.column === this.totalColumns - 1) {
        this.stairType = PatternType.ReverseStair;
      }

      if (isReverseStair && hitObject.column === this.randomStart) {
        this.stairType = PatternType.Stair;
      }
    }

    yield p;
  }
  _generateCore() {
    const pattern = new Pattern();

    if (this.totalColumns === 1) {
      this.addToPattern(pattern, 0);

      return pattern;
    }

    const lastColumn = this.previousPattern.hitObjects.length
      ? this.previousPattern.hitObjects[0].column
      : 0;
    const isReverse = !!(this.convertType & PatternType.Reverse);

    if (isReverse && this.previousPattern.hitObjects.length) {
      for (let i = this.randomStart; i < this.totalColumns; ++i) {
        if (this.previousPattern.columnHasObject(i)) {
          const column = this.randomStart + this.totalColumns - i - 1;

          this.addToPattern(pattern, column);
        }
      }

      return pattern;
    }

    const isCycle = !!(this.convertType & PatternType.Cycle);
    const isSingleObject = this.previousPattern.hitObjects.length === 1;
    const is7KPlus1 = this.totalColumns !== 8 || lastColumn !== 0;
    const isNotCenter = this.totalColumns % 2 === 0
            || lastColumn !== this.totalColumns / 2;

    if (isCycle && isSingleObject && is7KPlus1 && isNotCenter) {
      const column = this.randomStart + this.totalColumns - lastColumn - 1;

      this.addToPattern(pattern, column);

      return pattern;
    }

    const isForceStack = !!(this.convertType & PatternType.ForceStack);

    if (isForceStack && this.previousPattern.hitObjects.length) {
      for (let i = this.randomStart; i < this.totalColumns; ++i) {
        if (this.previousPattern.columnHasObject(i)) {
          this.addToPattern(pattern, i);
        }
      }

      return pattern;
    }

    if (this.previousPattern.hitObjects.length === 1) {
      if (this.convertType & PatternType.Stair) {
        let targetColumn = lastColumn + 1;

        if (targetColumn === this.totalColumns) {
          targetColumn = this.randomStart;
        }

        this.addToPattern(pattern, targetColumn);

        return pattern;
      }

      if (this.convertType & PatternType.ReverseStair) {
        let targetColumn = lastColumn - 1;

        if (targetColumn === this.randomStart - 1) {
          targetColumn = this.totalColumns - 1;
        }

        this.addToPattern(pattern, targetColumn);

        return pattern;
      }
    }

    if (this.convertType & PatternType.KeepSingle) {
      return this.generateRandomNotes(1);
    }

    if (this.convertType & PatternType.Mirror) {
      if (this.conversionDifficulty > 6.5) {
        return this.generateRandomPatternWithMirrored(0.12, 0.38, 0.12);
      }

      if (this.conversionDifficulty > 4) {
        return this.generateRandomPatternWithMirrored(0.12, 0.17, 0);
      }

      return this.generateRandomPatternWithMirrored(0.12, 0, 0);
    }

    if (this.conversionDifficulty > 6.5) {
      if (this.convertType & PatternType.LowProbability) {
        return this.generateRandomPattern(0.78, 0.42, 0, 0);
      }

      return this.generateRandomPattern(1, 0.62, 0, 0);
    }

    if (this.conversionDifficulty > 4) {
      if (this.convertType & PatternType.LowProbability) {
        return this.generateRandomPattern(0.35, 0.08, 0, 0);
      }

      return this.generateRandomPattern(0.52, 0.15, 0, 0);
    }

    if (this.conversionDifficulty > 2) {
      if (this.convertType & PatternType.LowProbability) {
        return this.generateRandomPattern(0.18, 0, 0, 0);
      }

      return this.generateRandomPattern(0.45, 0, 0, 0);
    }

    return this.generateRandomPattern(0, 0, 0, 0);
  }
  generateRandomNotes(noteCount) {
    const getNextColumn = (last) => {
      if (this.convertType & PatternType.Gathered) {
        if (++last === this.totalColumns) {
          last = this.randomStart;
        }
      }
      else {
        last = this.getRandomColumn();
      }

      return last;
    };

    const pattern = new Pattern();
    const allowStacking = !(this.convertType & PatternType.ForceNotStack);

    if (!allowStacking) {
      const count = this.totalColumns -
                this.randomStart -
                this.previousPattern.columnsWithObjects;

      noteCount = Math.min(noteCount, count);
    }

    const startX = this.hitObject.startX;
    let column = this.getColumn(startX || 0, true);

    for (let i = 0; i < noteCount; ++i) {
      if (allowStacking) {
        const options = {
          nextColumn: getNextColumn,
          patterns: [pattern],
        };

        column = this.findAvailableColumn(column, options);
      }
      else {
        const options = {
          nextColumn: getNextColumn,
          patterns: [pattern, this.previousPattern],
        };

        column = this.findAvailableColumn(column, options);
      }

      this.addToPattern(pattern, column);
    }

    return pattern;
  }
  hasSpecialColumn() {
    const findClap = (sample) => sample.hitSound === HitSound[HitSound.Clap];
    const findFinish = (sample) => sample.hitSound === HitSound[HitSound.Finish];

    return (!!this.hitObject.samples.find(findClap) &&
            !!this.hitObject.samples.find(findFinish));
  }
  generateRandomPattern(p2, p3, p4, p5) {
    const pattern = new Pattern();
    const noteCount = this.getRandomNoteCount(p2, p3, p4, p5);
    const randomNotes = this.generateRandomNotes(noteCount);

    pattern.addPatternHitObjects(randomNotes);

    if (this.randomStart > 0 && this.hasSpecialColumn()) {
      this.addToPattern(pattern, 0);
    }

    return pattern;
  }
  generateRandomPatternWithMirrored(centreProbability, p2, p3) {
    if (this.convertType & PatternType.ForceNotStack) {
      return this.generateRandomPattern(1 / Math.fround(2) + p2 / 2, p2, (p2 + p3) / 2, p3);
    }

    const pattern = new Pattern();
    const [noteCount, addToCentre] = this.getRandomNoteCountMirrored(centreProbability, p2, p3);
    const columnLimit = Math.trunc((this.totalColumns % 2 ? this.totalColumns - 1 : this.totalColumns) / 2);
    let column = this.getRandomColumn(this.randomStart, columnLimit);
    const options = {
      upperBound: columnLimit,
      patterns: [pattern],
    };

    for (let i = 0; i < noteCount; ++i) {
      column = this.findAvailableColumn(column, options);

      const mirroredColumn = this.randomStart + this.totalColumns - column - 1;

      this.addToPattern(pattern, column);
      this.addToPattern(pattern, mirroredColumn);
    }

    if (addToCentre) {
      this.addToPattern(pattern, Math.trunc(this.totalColumns / 2));
    }

    if (this.randomStart > 0 && this.hasSpecialColumn()) {
      this.addToPattern(pattern, 0);
    }

    return pattern;
  }
  getRandomNoteCount(p2, p3, p4, p5) {
    switch (this.totalColumns) {
      case 2:
        p2 = 0;
        p3 = 0;
        p4 = 0;
        p5 = 0;
        break;
      case 3:
        p2 = Math.min(p2, 0.1);
        p3 = 0;
        p4 = 0;
        p5 = 0;
        break;
      case 4:
        p2 = Math.min(p2, 0.23);
        p3 = Math.min(p3, 0.04);
        p4 = 0;
        p5 = 0;
        break;
      case 5:
        p3 = Math.min(p3, 0.15);
        p4 = Math.min(p4, 0.03);
        p5 = 0;
        break;
    }

    const findClap = (sample) => sample.hitSound === HitSound[HitSound.Clap];

    if (this.hitObject.samples.find(findClap)) {
      p2 = 1;
    }

    return super.getRandomNoteCount(p2, p3, p4, p5);
  }
  getRandomNoteCountMirrored(centreProbability, p2, p3) {
    switch (this.totalColumns) {
      case 2:
        centreProbability = 0;
        p2 = 0;
        p3 = 0;
        break;
      case 3:
        centreProbability = Math.min(centreProbability, 0.03);
        p2 = 0;
        p3 = 0;
        break;
      case 4:
        centreProbability = 0;
        p2 = 1 - Math.max((1 - p2) * 2, 0.8);
        p3 = 0;
        break;
      case 5:
        centreProbability = Math.min(centreProbability, 0.03);
        p3 = 0;
        break;
      case 6:
        centreProbability = 0;
        p2 = 1 - Math.max((1 - p2) * 2, 0.5);
        p3 = 1 - Math.max((1 - p3) * 2, 0.85);
        break;
    }

    p2 = Math.max(0, Math.min(p2, 1));
    p3 = Math.max(0, Math.min(p3, 1));

    const centreVal = this.rng.nextDouble();
    const noteCount = super.getRandomNoteCount(p2, p3);
    const addToCentre = this.totalColumns % 2 === 1
            && noteCount !== 3 && centreVal > 1 - centreProbability;

    return [noteCount, addToCentre];
  }
  addToPattern(pattern, column) {
    let _a;
    const note = new Note();
    const posData = this.hitObject;

    note.startTime = this.hitObject.startTime;
    note.originalColumn = column;
    note.hitType = HitType.Normal | (this.hitObject.hitType & HitType.NewCombo);
    note.samples = this.hitObject.samples;
    note.startPosition = (_a = posData === null || posData === void 0 ? void 0 : posData.startPosition) !== null && _a !== void 0 ? _a : new Vector2(256, 192);
    pattern.addHitObject(note);
  }
}

class SpecificBeatmapPatternGenerator extends PatternGenerator {
  *generate() {
    let _a, _b, _c;
    const startX = this.hitObject.startX;
    const column = this.getColumn(startX || 0);
    const pattern = new Pattern();
    const defaultNodeSamples = [this.hitObject.samples, []];

    if (this.hitObject.hitType & HitType.Hold) {
      const hold = new Hold();
      const posData = this.hitObject;

      hold.startTime = this.hitObject.startTime;
      hold.endTime = (_a = this.hitObject.endTime) !== null && _a !== void 0 ? _a : hold.startTime;
      hold.originalColumn = column;
      hold.samples = this.hitObject.samples;
      hold.hitType = HitType.Hold | (this.hitObject.hitType & HitType.NewCombo);
      hold.nodeSamples = hold.nodeSamples || defaultNodeSamples;
      hold.startPosition = (_b = posData === null || posData === void 0 ? void 0 : posData.startPosition) !== null && _b !== void 0 ? _b : new Vector2(256, 192);
      pattern.addHitObject(hold);
    }
    else {
      const note = new Note();
      const posData = this.hitObject;

      note.startTime = this.hitObject.startTime;
      note.originalColumn = column;
      note.hitType = HitType.Normal | (this.hitObject.hitType & HitType.NewCombo);
      note.samples = this.hitObject.samples;
      note.startPosition = (_c = posData === null || posData === void 0 ? void 0 : posData.startPosition) !== null && _c !== void 0 ? _c : new Vector2(256, 192);
      pattern.addHitObject(note);
    }

    yield pattern;
  }
}

let ColumnType;

(function(ColumnType) {
  ColumnType[ColumnType['Even'] = 0] = 'Even';
  ColumnType[ColumnType['Odd'] = 1] = 'Odd';
  ColumnType[ColumnType['Special'] = 2] = 'Special';
})(ColumnType || (ColumnType = {}));

class StageDefinition {
  constructor(columns) {
    this.columns = columns !== null && columns !== void 0 ? columns : 0;
  }
  isSpecialColumn(column) {
    return this.columns % 2 === 1 && this.columns / 2 === column;
  }
  getTypeOfColumn(column) {
    if (this.isSpecialColumn(column)) {
      return ColumnType.Special;
    }

    const distanceToEdge = Math.min(column, this.columns - 1 - column);

    return distanceToEdge % 2 ? ColumnType.Even : ColumnType.Odd;
  }
  clone() {
    return new StageDefinition(this.columns);
  }
}

class ManiaBeatmapConverter extends BeatmapConverter {
  constructor() {
    super(...arguments);
    this.originalRuleset = 3;
    this.originalTargetColumns = 0;
    this.targetColumns = 0;
    this.isDual = false;
    this._rng = null;
    this._prevNoteTimes = [];
    this._density = FastRandom.MAX_INT32;
    this._lastTime = 0;
    this._lastPosition = new Vector2(0, 0);
    this._lastPattern = new Pattern();
    this._lastStair = PatternType.Stair;
  }
  canConvert(beatmap) {
    return beatmap.hitObjects.every((h) => {
      return Number.isFinite(h.startX);
    });
  }
  convertBeatmap(original) {
    let _a;

    original = (_a = original.base) !== null && _a !== void 0 ? _a : original;
    this.originalRuleset = original.originalMode;
    this._updateTargetColumns(original);

    const difficulty = original.difficulty;
    let seed = RoundHelper.round(difficulty.approachRate);

    seed += RoundHelper.round(difficulty.drainRate + difficulty.circleSize) * 20;
    seed += Math.trunc(difficulty.overallDifficulty * 41.2);
    this._rng = new FastRandom(Math.trunc(seed));
    this._converted = this.createBeatmap();
    this._converted.general = original.general;
    this._converted.editor = original.editor;
    this._converted.difficulty = original.difficulty.clone();
    this._converted.metadata = original.metadata;
    this._converted.events = original.events;
    this._converted.controlPoints = original.controlPoints;
    this._converted.fileFormat = original.fileFormat;
    this._converted.originalMode = original.originalMode;
    this._converted.base = original;

    for (const hitObject of this.convertHitObjects(original)) {
      this._converted.hitObjects.push(hitObject);
    }

    this._converted.hitObjects.forEach((h) => (h.originalColumn = h.column));
    this._converted.hitObjects.sort((a, b) => a.startTime - b.startTime);
    this._converted.difficulty.circleSize = this._converted.totalColumns;

    return this._converted;
  }
  *convertHitObjects(beatmap) {
    const hitObjects = beatmap.hitObjects;

    for (const hitObject of hitObjects) {
      if (hitObject instanceof ManiaHitObject) {
        yield hitObject;
        continue;
      }

      const generated = this.originalRuleset === 3
        ? this._generateSpecific(hitObject, beatmap)
        : this._generateConverted(hitObject, beatmap);

      for (const object of generated) {
        yield object;
      }
    }
  }
  *_generateSpecific(hitObject, beatmap) {
    const random = this._rng;
    const converted = this._converted;
    const pattern = this._lastPattern;
    const generator = new SpecificBeatmapPatternGenerator(hitObject, converted, beatmap, pattern, random);

    for (const generated of generator.generate()) {
      this._lastPattern = generated;

      for (const obj of generated.hitObjects) {
        yield obj;
      }
    }
  }
  *_generateConverted(hitObject, beatmap) {
    const random = this._rng;
    const converted = this._converted;
    const pattern = this._lastPattern;
    let conversion = null;

    if (hitObject.path) {
      const generator = new DistanceObjectPatternGenerator(hitObject, converted, beatmap, pattern, random);
      const position = hitObject.startPosition;

      for (let i = 0; i <= generator.spanCount; ++i) {
        const time = hitObject.startTime + generator.segmentDuration * i;

        this._recordNote(time, position || new Vector2(0, 0));
        this._computeDensity(time);
      }

      conversion = generator;
    }
    else if (typeof hitObject.endTime === 'number') {
      const generator = new EndTimeObjectPatternGenerator(hitObject, converted, beatmap, pattern, random);
      const spinner = hitObject;

      this._recordNote(spinner.endTime, new Vector2(256, 192));
      this._computeDensity(spinner.endTime);
      conversion = generator;
    }
    else if (hitObject.startPosition) {
      this._computeDensity(hitObject.startTime);

      const lastTime = this._lastTime;
      const lastPosition = this._lastPosition;
      const density = this._density;
      const lastStair = this._lastStair;
      const generator = new HitObjectPatternGenerator(hitObject, converted, beatmap, pattern, random, lastTime, lastPosition, density, lastStair);
      const position = hitObject.startPosition;

      this._recordNote(hitObject.startTime, position);
      conversion = generator;
    }

    if (conversion === null) {
      return;
    }

    for (const generated of conversion.generate()) {
      if (!(conversion instanceof EndTimeObjectPatternGenerator)) {
        this._lastPattern = generated;
      }

      if (conversion instanceof HitObjectPatternGenerator) {
        this._lastStair = conversion.stairType;
      }

      for (const obj of generated.hitObjects) {
        yield obj;
      }
    }
  }
  _updateTargetColumns(original) {
    const difficulty = original.difficulty;
    const hitObjects = original.hitObjects;
    const roundedCS = RoundHelper.round(difficulty.circleSize);
    const roundedOD = RoundHelper.round(difficulty.overallDifficulty);

    if (this.targetColumns) {
      if (!this.originalTargetColumns) {
        this.originalTargetColumns = this.targetColumns;
      }

      return;
    }

    if (this.originalRuleset === 3) {
      this.targetColumns = Math.trunc(Math.max(1, roundedCS));

      if (this.targetColumns > ManiaBeatmapConverter.MAX_STAGE_KEYS) {
        this.targetColumns /= 2;
        this.isDual = true;
      }
    }
    else {
      const pathObjects = hitObjects;
      const objectsWithDuration = pathObjects.filter((h) => h.endTime || h.path);
      const percentage = objectsWithDuration.length / hitObjects.length;

      if (percentage < 0.2) {
        this.targetColumns = 7;
      }
      else if (percentage < 0.3 || roundedCS >= 5) {
        this.targetColumns = roundedOD > 5 ? 7 : 6;
      }
      else if (percentage > 0.6) {
        this.targetColumns = roundedOD > 4 ? 5 : 4;
      }
      else {
        this.targetColumns = Math.max(4, Math.min(roundedOD + 1, 7));
      }
    }

    this.originalTargetColumns = this.targetColumns;
  }
  _computeDensity(newNoteTime) {
    const maxNotesForDensity = ManiaBeatmapConverter.MAX_NOTES_FOR_DENSITY;

    if (this._prevNoteTimes.length === maxNotesForDensity) {
      this._prevNoteTimes.shift();
    }

    this._prevNoteTimes.push(newNoteTime);

    if (this._prevNoteTimes.length >= 2) {
      this._density =
                (newNoteTime - this._prevNoteTimes[0]) / this._prevNoteTimes.length;
    }
  }
  _recordNote(time, position) {
    this._lastTime = time;
    this._lastPosition = position;
  }
  createBeatmap() {
    const stage = new StageDefinition(this.targetColumns);
    const beatmap = new ManiaBeatmap(stage, this.originalTargetColumns);

    if (this.isDual) {
      const dualStage = new StageDefinition();

      dualStage.columns = this.targetColumns;
      beatmap.stages.push(dualStage);
    }

    return beatmap;
  }
}
ManiaBeatmapConverter.MAX_NOTES_FOR_DENSITY = 7;
ManiaBeatmapConverter.MAX_STAGE_KEYS = 10;

class ManiaBeatmapProcessor extends BeatmapProcessor {
}

class ManiaDifficultyAttributes extends DifficultyAttributes {
  constructor() {
    super(...arguments);
    this.greatHitWindow = 0;
  }
}

class ManiaPerformanceAttributes extends PerformanceAttributes {
  constructor(mods, totalPerformance) {
    super(mods, totalPerformance);
    this.difficultyPerformance = 0;
    this.mods = mods;
  }
}

class ManiaDifficultyHitObject extends DifficultyHitObject {
  constructor(hitObject, lastObject, clockRate, objects, index) {
    super(hitObject, lastObject, clockRate, objects, index);
    this.baseObject = hitObject;
  }
}

class Strain extends StrainDecaySkill {
  constructor(mods, totalColumns) {
    super(mods);
    this._skillMultiplier = 1;
    this._strainDecayBase = 1;
    this._individualStrain = 0;
    this._overallStrain = 1;
    this._startTimes = new Array(totalColumns).fill(0);
    this._endTimes = new Array(totalColumns).fill(0);
    this._individualStrains = new Array(totalColumns).fill(0);
  }
  _strainValueOf(current) {
    const maniaCurrent = current;
    const startTime = maniaCurrent.startTime;
    const endTime = maniaCurrent.endTime;
    const column = maniaCurrent.baseObject.column;
    let isOverlapping = false;
    let closestEndTime = Math.abs(endTime - startTime);
    let holdFactor = 1;
    let holdAddition = 0;
    const acceptableDifference = 1;

    for (let i = 0; i < this._endTimes.length; ++i) {
      const definitelyBigger1 = this._endTimes[i] - acceptableDifference > startTime;
      const definitelyBigger2 = endTime - acceptableDifference > this._endTimes[i];
      const definitelyBigger3 = this._endTimes[i] - acceptableDifference > endTime;

      isOverlapping || (isOverlapping = definitelyBigger1 && definitelyBigger2);

      if (definitelyBigger3) {
        holdFactor = 1.25;
      }

      closestEndTime = Math.min(closestEndTime, Math.abs(endTime - this._endTimes[i]));
    }

    if (isOverlapping) {
      holdAddition = 1 / (1 + Math.exp(0.5 * (Strain.RELEASE_THRESHOLD - closestEndTime)));
    }

    this._individualStrains[column] = Strain._applyDecay(this._individualStrains[column], startTime - this._startTimes[column], Strain.INDIVIDUAL_DECAY_BASE);
    this._individualStrains[column] += 2.0 * holdFactor;
    this._individualStrain = maniaCurrent.deltaTime <= 1
      ? Math.max(this._individualStrain, this._individualStrains[column])
      : this._individualStrains[column];

    this._overallStrain = Strain._applyDecay(this._overallStrain, current.deltaTime, Strain.OVERALL_DECAY_BASE);
    this._overallStrain += (1 + holdAddition) * holdFactor;
    this._startTimes[column] = startTime;
    this._endTimes[column] = endTime;

    return this._individualStrain + this._overallStrain - this._currentStrain;
  }
  _calculateInitialStrain(time, current) {
    let _a, _b, _c, _d;
    const decay1 = Strain._applyDecay(this._individualStrain, time - ((_b = (_a = current.previous(0)) === null || _a === void 0 ? void 0 : _a.startTime) !== null && _b !== void 0 ? _b : 0), Strain.INDIVIDUAL_DECAY_BASE);
    const decay2 = Strain._applyDecay(this._overallStrain, time - ((_d = (_c = current.previous(0)) === null || _c === void 0 ? void 0 : _c.startTime) !== null && _d !== void 0 ? _d : 0), Strain.OVERALL_DECAY_BASE);

    return decay1 + decay2;
  }
  static _applyDecay(value, deltaTime, decayBase) {
    return value * Math.pow(decayBase, deltaTime / 1000);
  }
}
Strain.INDIVIDUAL_DECAY_BASE = 0.125;
Strain.OVERALL_DECAY_BASE = 0.30;
Strain.RELEASE_THRESHOLD = 24;

class ManiaDifficultyCalculator extends DifficultyCalculator {
  constructor(beatmap, ruleset) {
    let _a;

    super(beatmap, ruleset);
    this._isForCurrentRuleset = beatmap.originalMode === ruleset.id;
    this._originalOverallDifficulty = ((_a = beatmap.base) !== null && _a !== void 0 ? _a : beatmap).difficulty.overallDifficulty;
  }
  _createDifficultyAttributes(beatmap, mods, skills, clockRate) {
    if (beatmap.hitObjects.length === 0) {
      return new ManiaDifficultyAttributes(mods, 0);
    }

    const starRating = skills[0].difficultyValue
            * ManiaDifficultyCalculator.STAR_SCALING_FACTOR;
    const attributes = new ManiaDifficultyAttributes(mods, starRating);

    attributes.mods = mods;
    attributes.maxCombo = beatmap.hitObjects.reduce((combo, obj) => {
      if (obj instanceof Hold) {
        return combo + 1 + Math.trunc((obj.endTime - obj.startTime) / 100);
      }

      return combo + 1;
    }, 0);

    attributes.greatHitWindow = Math.ceil(Math.trunc(this._getHitWindow300(mods) * clockRate) / clockRate);

    return attributes;
  }
  _createDifficultyHitObjects(beatmap, clockRate) {
    const hitObjects = beatmap.hitObjects.slice();

    const comparerFn = (a, b) => {
      return RoundHelper.round(a.startTime) - RoundHelper.round(b.startTime);
    };

    const sortedObjects = SortHelper.depthSort(hitObjects, comparerFn);
    const difficultyObjects = [];

    for (let i = 1; i < sortedObjects.length; ++i) {
      const object = new ManiaDifficultyHitObject(sortedObjects[i], sortedObjects[i - 1], clockRate, difficultyObjects, difficultyObjects.length);

      difficultyObjects.push(object);
    }

    return difficultyObjects;
  }
  _sortObjects(input) {
    return input;
  }
  _createSkills(beatmap, mods) {
    let _a, _b;

    return [
      new Strain(mods, (_b = (_a = beatmap) === null || _a === void 0 ? void 0 : _a.totalColumns) !== null && _b !== void 0 ? _b : 0),
    ];
  }
  get difficultyMods() {
    const mods = [
      new ManiaDoubleTime(),
      new ManiaHalfTime(),
      new ManiaEasy(),
      new ManiaHardRock(),
    ];

    if (this._isForCurrentRuleset) {
      return mods;
    }

    return [
      ...mods,
      new ManiaKey1(),
      new ManiaKey2(),
      new ManiaKey3(),
      new ManiaKey4(),
      new ManiaKey5(),
      new ManiaKey6(),
      new ManiaKey7(),
      new ManiaKey8(),
      new ManiaKey9(),
      new ManiaDualStages(),
    ];
  }
  _getHitWindow300(mods) {
    const applyModAdjustments = (value) => {
      if (mods.has(ModBitwise.HardRock)) {
        return value / 1.4;
      }

      if (mods.has(ModBitwise.Easy)) {
        return value * 1.4;
      }

      return value;
    };

    if (this._isForCurrentRuleset) {
      const od = Math.min(10, Math.max(0, 10 - this._originalOverallDifficulty));

      return applyModAdjustments(34 + 3 * od);
    }

    if (RoundHelper.round(this._originalOverallDifficulty) > 4) {
      return applyModAdjustments(34);
    }

    return applyModAdjustments(47);
  }
}
ManiaDifficultyCalculator.STAR_SCALING_FACTOR = 0.018;

class ManiaPerformanceCalculator extends PerformanceCalculator {
  constructor(ruleset, attributes, score) {
    super(ruleset, attributes, score);
    this._mods = new ManiaModCombination();
    this._countPerfect = 0;
    this._countGreat = 0;
    this._countGood = 0;
    this._countOk = 0;
    this._countMeh = 0;
    this._countMiss = 0;
    this.attributes = attributes;
    this._addParams(attributes, score);
  }
  calculateAttributes(attributes, score) {
    this._addParams(attributes, score);

    if (!this.attributes) {
      return new ManiaPerformanceAttributes(this._mods, 0);
    }

    let multiplier = 8;

    if (this._mods.any(ManiaNoFail)) {
      multiplier *= 0.75;
    }

    if (this._mods.any(ManiaEasy)) {
      multiplier *= 0.5;
    }

    const difficultyValue = this._computeDifficultyValue();
    const totalValue = difficultyValue * multiplier;
    const performance = new ManiaPerformanceAttributes(this._mods, totalValue);

    performance.difficultyPerformance = difficultyValue;

    return performance;
  }
  _computeDifficultyValue() {
    let difficultyValue = Math.pow(Math.max(this.attributes.starRating - 0.15, 0.05), 2.2);

    difficultyValue *= Math.max(0, 5 * this._customAccuracy - 4);
    difficultyValue *= 1 + 0.1 * Math.min(1, this._totalHits / 1500);

    return difficultyValue;
  }
  _addParams(attributes, score) {
    let _a, _b, _c, _d, _e, _f, _g;

    if (score) {
      this._mods = (_a = score === null || score === void 0 ? void 0 : score.mods) !== null && _a !== void 0 ? _a : this._mods;
      this._countPerfect = (_b = score.statistics.get(HitResult.Perfect)) !== null && _b !== void 0 ? _b : 0;
      this._countGreat = (_c = score.statistics.get(HitResult.Great)) !== null && _c !== void 0 ? _c : 0;
      this._countGood = (_d = score.statistics.get(HitResult.Good)) !== null && _d !== void 0 ? _d : 0;
      this._countOk = (_e = score.statistics.get(HitResult.Ok)) !== null && _e !== void 0 ? _e : 0;
      this._countMeh = (_f = score.statistics.get(HitResult.Meh)) !== null && _f !== void 0 ? _f : 0;
      this._countMiss = (_g = score.statistics.get(HitResult.Miss)) !== null && _g !== void 0 ? _g : 0;
    }

    if (attributes) {
      this.attributes = attributes;
    }
  }
  get _totalHits() {
    return this._countPerfect + this._countOk + this._countGreat +
            this._countGood + this._countMeh + this._countMiss;
  }
  get _customAccuracy() {
    const perfect = this._countPerfect;
    const great = this._countGreat;
    const good = this._countGood;
    const ok = this._countOk;
    const meh = this._countMeh;
    const totalHits = this._totalHits;

    if (!totalHits) {
      return 0;
    }

    return (perfect * 320 + great * 300 + good * 200 + ok * 100 + meh * 50) / (totalHits * 320);
  }
}

let ManiaAction;

(function(ManiaAction) {
  ManiaAction[ManiaAction['Special1'] = 1] = 'Special1';
  ManiaAction[ManiaAction['Special2'] = 2] = 'Special2';
  ManiaAction[ManiaAction['Key1'] = 10] = 'Key1';
  ManiaAction[ManiaAction['Key2'] = 11] = 'Key2';
  ManiaAction[ManiaAction['Key3'] = 12] = 'Key3';
  ManiaAction[ManiaAction['Key4'] = 13] = 'Key4';
  ManiaAction[ManiaAction['Key5'] = 14] = 'Key5';
  ManiaAction[ManiaAction['Key6'] = 15] = 'Key6';
  ManiaAction[ManiaAction['Key7'] = 16] = 'Key7';
  ManiaAction[ManiaAction['Key8'] = 17] = 'Key8';
  ManiaAction[ManiaAction['Key9'] = 18] = 'Key9';
  ManiaAction[ManiaAction['Key10'] = 19] = 'Key10';
  ManiaAction[ManiaAction['Key11'] = 20] = 'Key11';
  ManiaAction[ManiaAction['Key12'] = 21] = 'Key12';
  ManiaAction[ManiaAction['Key13'] = 22] = 'Key13';
  ManiaAction[ManiaAction['Key14'] = 23] = 'Key14';
  ManiaAction[ManiaAction['Key15'] = 24] = 'Key15';
  ManiaAction[ManiaAction['Key16'] = 25] = 'Key16';
  ManiaAction[ManiaAction['Key17'] = 26] = 'Key17';
  ManiaAction[ManiaAction['Key18'] = 27] = 'Key18';
  ManiaAction[ManiaAction['Key19'] = 28] = 'Key19';
  ManiaAction[ManiaAction['Key20'] = 29] = 'Key20';
})(ManiaAction || (ManiaAction = {}));

class ManiaReplayFrame extends ReplayFrame {
  constructor() {
    super(...arguments);
    this.actions = new Set();
  }
  fromLegacy(currentFrame, _, beatmap) {
    let _a;

    if (!beatmap) {
      throw new Error('Beatmap must be provided to convert osu!mania replay frames.');
    }

    this.startTime = currentFrame.startTime;
    this.interval = currentFrame.interval;

    const maniaBeatmap = beatmap;
    let normalAction = ManiaAction.Key1;
    let specialAction = ManiaAction.Special1;
    let activeColumns = Math.trunc((_a = currentFrame.mouseX) !== null && _a !== void 0 ? _a : 0);
    let counter = 0;

    while (activeColumns > 0) {
      const isSpecial = this._isColumnAtIndexSpecial(maniaBeatmap, counter);

      if ((activeColumns & 1) > 0) {
        this.actions.add(isSpecial ? specialAction : normalAction);
      }

      isSpecial ? specialAction++ : normalAction++;
      counter++;
      activeColumns >>= 1;
    }

    return this;
  }
  toLegacy(beatmap) {
    if (!beatmap) {
      throw new Error('Beatmap must be provided to convert osu!mania replay frames.');
    }

    const maniaBeatmap = beatmap;
    let keys = 0;

    for (const action of this.actions) {
      if (action === ManiaAction.Special1) {
        keys |= 1 << this._getSpecialColumnIndex(maniaBeatmap, 0);
        continue;
      }

      if (action === ManiaAction.Special2) {
        keys |= 1 << this._getSpecialColumnIndex(maniaBeatmap, 1);
        continue;
      }

      let nonSpecialKeyIndex = action - ManiaAction.Key1;
      let overallIndex = 0;

      while (overallIndex < maniaBeatmap.totalColumns) {
        if (this._isColumnAtIndexSpecial(maniaBeatmap, overallIndex)) {
          continue;
        }

        if (nonSpecialKeyIndex === 0) {
          break;
        }

        nonSpecialKeyIndex--;
        overallIndex++;
      }

      keys |= 1 << overallIndex;
    }

    return new LegacyReplayFrame(this.startTime, this.interval, new Vector2(keys, 0), ReplayButtonState.None);
  }
  _getSpecialColumnIndex(maniaBeatmap, specialOffset) {
    for (let i = 0; i < maniaBeatmap.totalColumns; ++i) {
      if (this._isColumnAtIndexSpecial(maniaBeatmap, i)) {
        if (specialOffset === 0) {
          return i;
        }

        specialOffset--;
      }
    }

    throw new Error('Special key index is too high.');
  }
  _isColumnAtIndexSpecial(beatmap, index) {
    for (const stage of beatmap.stages) {
      if (index >= stage.columns) {
        index -= stage.columns;
        continue;
      }

      return stage.isSpecialColumn(index);
    }

    throw new Error('Column index is too high.');
  }
}

class ManiaReplayConverter extends ReplayConverter {
  _createConvertibleReplayFrame() {
    return new ManiaReplayFrame();
  }
  _isConvertedReplayFrame(frame) {
    return frame instanceof ManiaReplayFrame;
  }
}

class ManiaHitWindows extends HitWindows {
  isHitResultAllowed(result) {
    switch (result) {
      case HitResult.Perfect:
      case HitResult.Great:
      case HitResult.Good:
      case HitResult.Ok:
      case HitResult.Meh:
      case HitResult.Miss:
        return true;
    }

    return false;
  }
}

class ManiaRuleset extends Ruleset {
  get id() {
    return 3;
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
    return new ManiaModCombination(input);
  }
  _createBeatmapProcessor() {
    return new ManiaBeatmapProcessor();
  }
  _createBeatmapConverter() {
    return new ManiaBeatmapConverter();
  }
  _createReplayConverter() {
    return new ManiaReplayConverter();
  }
  createDifficultyCalculator(beatmap) {
    return new ManiaDifficultyCalculator(beatmap, this);
  }
  createPerformanceCalculator(attributes, score) {
    return new ManiaPerformanceCalculator(this, attributes, score);
  }
}

export { ColumnType, DistanceObjectPatternGenerator, EndTimeObjectPatternGenerator, HitObjectPatternGenerator, Hold, HoldHead, HoldTail, HoldTick, ManiaAction, ManiaAutoplay, ManiaBeatmap, ManiaBeatmapConverter, ManiaBeatmapProcessor, ManiaCinema, ManiaDifficultyAttributes, ManiaDifficultyCalculator, ManiaDifficultyHitObject, ManiaDoubleTime, ManiaDualStages, ManiaEasy, ManiaEventGenerator, ManiaFadeIn, ManiaFlashlight, ManiaHalfTime, ManiaHardRock, ManiaHidden, ManiaHitObject, ManiaHitWindows, ManiaKey1, ManiaKey2, ManiaKey3, ManiaKey4, ManiaKey5, ManiaKey6, ManiaKey7, ManiaKey8, ManiaKey9, ManiaKeyMod, ManiaMirror, ManiaModCombination, ManiaNightcore, ManiaNoFail, ManiaNoMod, ManiaPerfect, ManiaPerformanceAttributes, ManiaPerformanceCalculator, ManiaRandom, ManiaReplayConverter, ManiaReplayFrame, ManiaRuleset, ManiaSuddenDeath, Note, Pattern, PatternGenerator, PatternType, SpecificBeatmapPatternGenerator, StageDefinition, Strain };
