class BeatmapColorSection {
  constructor() {
    this.comboColors = [];
  }
  clone() {
    const cloned = new BeatmapColorSection();

    cloned.comboColors = this.comboColors.map((c) => c.clone());

    if (this.sliderTrackColor) {
      cloned.sliderTrackColor = this.sliderTrackColor;
    }

    if (this.sliderBorderColor) {
      cloned.sliderBorderColor = this.sliderBorderColor;
    }

    return cloned;
  }
}

class BeatmapDifficultySection {
  constructor() {
    this._CS = BeatmapDifficultySection.BASE_DIFFICULTY;
    this._HP = BeatmapDifficultySection.BASE_DIFFICULTY;
    this._OD = BeatmapDifficultySection.BASE_DIFFICULTY;
    this._multiplier = 1;
    this._tickRate = 1;
    this._rate = 1;
  }
  get circleSize() {
    return Math.fround(this._CS);
  }
  set circleSize(value) {
    this._CS = value;
  }
  get drainRate() {
    return Math.fround(this._HP);
  }
  set drainRate(value) {
    this._HP = value;
  }
  get overallDifficulty() {
    return Math.fround(this._OD);
  }
  set overallDifficulty(value) {
    this._OD = value;
  }
  get approachRate() {
    let _a;

    return Math.fround((_a = this._AR) !== null && _a !== void 0 ? _a : this._OD);
  }
  set approachRate(value) {
    this._AR = value;
  }
  get sliderMultiplier() {
    return this._multiplier;
  }
  set sliderMultiplier(value) {
    this._multiplier = value;
  }
  get sliderTickRate() {
    return this._tickRate;
  }
  set sliderTickRate(value) {
    this._tickRate = value;
  }
  get clockRate() {
    return this._rate;
  }
  set clockRate(value) {
    this._rate = value;
  }
  clone() {
    const cloned = new BeatmapDifficultySection();

    cloned.circleSize = this._CS;
    cloned.drainRate = this._HP;
    cloned.overallDifficulty = this._OD;

    if (typeof this._AR === 'number') {
      cloned.approachRate = this._AR;
    }

    cloned.sliderMultiplier = this._multiplier;
    cloned.sliderTickRate = this._tickRate;
    cloned.clockRate = this._rate;

    return cloned;
  }
  static range(diff, min, mid, max) {
    if (diff > 5) {
      return mid + ((max - mid) * (diff - 5)) / 5;
    }

    if (diff < 5) {
      return mid - ((mid - min) * (5 - diff)) / 5;
    }

    return mid;
  }
}
BeatmapDifficultySection.BASE_DIFFICULTY = 5;

class BeatmapEditorSection {
  constructor() {
    this.bookmarks = [];
    this.distanceSpacing = 1;
    this.beatDivisor = 4;
    this.gridSize = 1;
    this.timelineZoom = 2;
  }
  clone() {
    const cloned = new BeatmapEditorSection();

    cloned.bookmarks = this.bookmarks.slice();
    cloned.distanceSpacing = this.distanceSpacing;
    cloned.beatDivisor = this.beatDivisor;
    cloned.gridSize = this.gridSize;
    cloned.timelineZoom = this.timelineZoom;

    return cloned;
  }
}

let BlendingMode;

(function (BlendingMode) {
  BlendingMode[BlendingMode['AdditiveBlending'] = 0] = 'AdditiveBlending';
  BlendingMode[BlendingMode['AlphaBlending'] = 1] = 'AlphaBlending';
})(BlendingMode || (BlendingMode = {}));

class BlendingParameters {
  constructor(params) {
    this.source = params.source || 0;
    this.destination = params.destination || 0;
    this.sourceAlpha = params.sourceAlpha || 0;
    this.destinationAlpha = params.destinationAlpha || 0;
    this.rgbEquation = params.rgbEquation || 0;
    this.alphaEquation = params.alphaEquation || 0;
  }
  copyFromParent(parent) {
    if (this.source === 0) {
      this.source = parent.source;
    }

    if (this.destination === 0) {
      this.destination = parent.destination;
    }

    if (this.sourceAlpha === 0) {
      this.sourceAlpha = parent.sourceAlpha;
    }

    if (this.destinationAlpha === 0) {
      this.destinationAlpha = parent.destinationAlpha;
    }

    if (this.rgbEquation === 0) {
      this.rgbEquation = parent.rgbEquation;
    }

    if (this.alphaEquation === 0) {
      this.alphaEquation = parent.alphaEquation;
    }
  }
  applyDefaultToInherited() {
    if (this.source === 0) {
      this.source = 12;
    }

    if (this.destination === 0) {
      this.destination = 10;
    }

    if (this.sourceAlpha === 0) {
      this.sourceAlpha = 5;
    }

    if (this.destinationAlpha === 0) {
      this.destinationAlpha = 5;
    }

    if (this.rgbEquation === 0) {
      this.rgbEquation = 1;
    }

    if (this.alphaEquation === 0) {
      this.alphaEquation = 1;
    }
  }
  equals(other) {
    return other.source === this.source
      && other.destination === this.destination
      && other.sourceAlpha === this.sourceAlpha
      && other.destinationAlpha === this.destinationAlpha
      && other.rgbEquation === this.rgbEquation
      && other.alphaEquation === this.alphaEquation;
  }
  get isDisabled() {
    return this.source === 5
      && this.destination === 15
      && this.sourceAlpha === 5
      && this.destinationAlpha === 15
      && this.rgbEquation === 1
      && this.alphaEquation === 1;
  }
  get rgbEquationMode() {
    return BlendingParameters._translateEquation(this.rgbEquation);
  }
  get alphaEquationMode() {
    return BlendingParameters._translateEquation(this.alphaEquation);
  }
  get sourceBlendingFactor() {
    return BlendingParameters._translateBlendingFactorSrc(this.source);
  }
  get destinationBlendingFactor() {
    return BlendingParameters._translateBlendingFactorDest(this.destination);
  }
  get sourceAlphaBlendingFactor() {
    return BlendingParameters._translateBlendingFactorSrc(this.sourceAlpha);
  }
  get destinationAlphaBlendingFactor() {
    return BlendingParameters._translateBlendingFactorDest(this.destinationAlpha);
  }
  static _translateBlendingFactorSrc(factor) {
    switch (factor) {
      case 1:
        return 32771;
      case 2:
        return 32769;
      case 3:
        return 772;
      case 4:
        return 774;
      case 5:
        return 1;
      case 6:
        return 32772;
      case 7:
        return 32770;
      case 8:
        return 773;
      case 9:
        return 775;
      case 10:
        return 769;
      case 12:
        return 770;
      case 13:
        return 776;
      case 14:
        return 768;
      default:
      case 15:
        return 0;
    }
  }
  static _translateBlendingFactorDest(factor) {
    switch (factor) {
      case 1:
        return 32771;
      case 2:
        return 32769;
      case 3:
        return 772;
      case 4:
        return 774;
      case 5:
        return 1;
      case 6:
        return 32772;
      case 7:
        return 32770;
      case 8:
        return 773;
      case 9:
        return 775;
      case 10:
        return 771;
      case 11:
        return 769;
      case 12:
        return 770;
      case 13:
        return 776;
      case 14:
        return 768;
      default:
      case 15:
        return 0;
    }
  }
  static _translateEquation(equation) {
    switch (equation) {
      default:
      case 0:
      case 1:
        return 32774;
      case 2:
        return 32775;
      case 3:
        return 32776;
      case 4:
        return 32778;
      case 5:
        return 32779;
    }
  }
}
BlendingParameters.None = new BlendingParameters({
  source: 5,
  destination: 15,
  sourceAlpha: 5,
  destinationAlpha: 15,
  rgbEquation: 1,
  alphaEquation: 1,
});

BlendingParameters.Inherit = new BlendingParameters({
  source: 0,
  destination: 0,
  sourceAlpha: 0,
  destinationAlpha: 0,
  rgbEquation: 0,
  alphaEquation: 0,
});

BlendingParameters.Mixture = new BlendingParameters({
  source: 12,
  destination: 10,
  sourceAlpha: 5,
  destinationAlpha: 5,
  rgbEquation: 1,
  alphaEquation: 1,
});

BlendingParameters.Additive = new BlendingParameters({
  source: 12,
  destination: 5,
  sourceAlpha: 5,
  destinationAlpha: 5,
  rgbEquation: 1,
  alphaEquation: 1,
});

let Anchor;

(function (Anchor) {
  Anchor[Anchor['y0'] = 1] = 'y0';
  Anchor[Anchor['y1'] = 2] = 'y1';
  Anchor[Anchor['y2'] = 4] = 'y2';
  Anchor[Anchor['x0'] = 8] = 'x0';
  Anchor[Anchor['x1'] = 16] = 'x1';
  Anchor[Anchor['x2'] = 32] = 'x2';
  Anchor[Anchor['Custom'] = 64] = 'Custom';
  Anchor[Anchor['TopLeft'] = 9] = 'TopLeft';
  Anchor[Anchor['TopCentre'] = 17] = 'TopCentre';
  Anchor[Anchor['TopRight'] = 33] = 'TopRight';
  Anchor[Anchor['CentreLeft'] = 10] = 'CentreLeft';
  Anchor[Anchor['Centre'] = 18] = 'Centre';
  Anchor[Anchor['CentreRight'] = 34] = 'CentreRight';
  Anchor[Anchor['BottomLeft'] = 12] = 'BottomLeft';
  Anchor[Anchor['BottomCentre'] = 20] = 'BottomCentre';
  Anchor[Anchor['BottomRight'] = 36] = 'BottomRight';
})(Anchor || (Anchor = {}));

let CommandType;

(function (CommandType) {
  CommandType['None'] = '';
  CommandType['Movement'] = 'M';
  CommandType['MovementX'] = 'MX';
  CommandType['MovementY'] = 'MY';
  CommandType['Fade'] = 'F';
  CommandType['Scale'] = 'S';
  CommandType['VectorScale'] = 'V';
  CommandType['Rotation'] = 'R';
  CommandType['Color'] = 'C';
  CommandType['Parameter'] = 'P';
})(CommandType || (CommandType = {}));

let CompoundType;

(function (CompoundType) {
  CompoundType['None'] = '';
  CompoundType['Loop'] = 'L';
  CompoundType['Trigger'] = 'T';
})(CompoundType || (CompoundType = {}));

let EventType;

(function (EventType) {
  EventType[EventType['Background'] = 0] = 'Background';
  EventType[EventType['Video'] = 1] = 'Video';
  EventType[EventType['Break'] = 2] = 'Break';
  EventType[EventType['Colour'] = 3] = 'Colour';
  EventType[EventType['Sprite'] = 4] = 'Sprite';
  EventType[EventType['Sample'] = 5] = 'Sample';
  EventType[EventType['Animation'] = 6] = 'Animation';
  EventType[EventType['StoryboardCommand'] = 7] = 'StoryboardCommand';
})(EventType || (EventType = {}));

let LayerType;

(function (LayerType) {
  LayerType[LayerType['Background'] = 0] = 'Background';
  LayerType[LayerType['Fail'] = 1] = 'Fail';
  LayerType[LayerType['Pass'] = 2] = 'Pass';
  LayerType[LayerType['Foreground'] = 3] = 'Foreground';
  LayerType[LayerType['Overlay'] = 4] = 'Overlay';
  LayerType[LayerType['Video'] = 5] = 'Video';
})(LayerType || (LayerType = {}));

let LoopType;

(function (LoopType) {
  LoopType[LoopType['LoopForever'] = 0] = 'LoopForever';
  LoopType[LoopType['LoopOnce'] = 1] = 'LoopOnce';
})(LoopType || (LoopType = {}));

let Origins;

(function (Origins) {
  Origins[Origins['TopLeft'] = 0] = 'TopLeft';
  Origins[Origins['Centre'] = 1] = 'Centre';
  Origins[Origins['CentreLeft'] = 2] = 'CentreLeft';
  Origins[Origins['TopRight'] = 3] = 'TopRight';
  Origins[Origins['BottomCentre'] = 4] = 'BottomCentre';
  Origins[Origins['TopCentre'] = 5] = 'TopCentre';
  Origins[Origins['Custom'] = 6] = 'Custom';
  Origins[Origins['CentreRight'] = 7] = 'CentreRight';
  Origins[Origins['BottomLeft'] = 8] = 'BottomLeft';
  Origins[Origins['BottomRight'] = 9] = 'BottomRight';
})(Origins || (Origins = {}));

let ParameterType;

(function (ParameterType) {
  ParameterType['None'] = '';
  ParameterType['HorizontalFlip'] = 'H';
  ParameterType['VerticalFlip'] = 'V';
  ParameterType['BlendingMode'] = 'A';
})(ParameterType || (ParameterType = {}));

class Color4 {
  constructor(red, green, blue, alpha) {
    this.red = red !== null && red !== void 0 ? red : 255;
    this.green = green !== null && green !== void 0 ? green : 255;
    this.blue = blue !== null && blue !== void 0 ? blue : 255;
    this.alpha = alpha !== null && alpha !== void 0 ? alpha : 1;
  }
  get hex() {
    const alpha = Math.round(this.alpha * 255);

    return ('#' +
      this.red.toString(16).padStart(2, '0') +
      this.green.toString(16).padStart(2, '0') +
      this.blue.toString(16).padStart(2, '0') +
      alpha.toString(16).padStart(2, '0'));
  }
  equals(color) {
    return this.red === color.red
      && this.green === color.green
      && this.blue === color.blue
      && this.alpha === color.alpha;
  }
  clone() {
    return new Color4(this.red, this.green, this.blue, this.alpha);
  }
  toString() {
    return `${this.red},${this.green},${this.blue},${this.alpha}`;
  }
}

class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = isFinite(y) ? y : x;
  }
  get floatX() {
    return Math.fround(this.x);
  }
  get floatY() {
    return Math.fround(this.y);
  }
  add(vec) {
    return new Vector2(this.x + vec.x, this.y + vec.y);
  }
  fadd(vec) {
    return new Vector2(Math.fround(this.floatX + vec.floatX), Math.fround(this.floatY + vec.floatY));
  }
  subtract(vec) {
    return new Vector2(this.x - vec.x, this.y - vec.y);
  }
  fsubtract(vec) {
    return new Vector2(Math.fround(this.floatX - vec.floatX), Math.fround(this.floatY - vec.floatY));
  }
  scale(multiplier) {
    return new Vector2(this.x * multiplier, this.y * multiplier);
  }
  fscale(multiplier) {
    const floatMultiplier = Math.fround(multiplier);

    return new Vector2(Math.fround(this.floatX * floatMultiplier), Math.fround(this.floatY * floatMultiplier));
  }
  divide(divisor) {
    return new Vector2(this.x / divisor, this.y / divisor);
  }
  fdivide(divisor) {
    const floatDivisor = Math.fround(divisor);

    return new Vector2(Math.fround(this.floatX / floatDivisor), Math.fround(this.floatY / floatDivisor));
  }
  dot(vec) {
    return this.x * vec.x + this.y * vec.y;
  }
  fdot(vec) {
    return Math.fround(Math.fround(Math.fround(this.floatX * vec.floatX) +
      Math.fround(this.floatY * vec.floatY)));
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  flength() {
    return Math.fround(Math.sqrt(Math.fround(Math.fround(this.floatX * this.floatX) +
      Math.fround(this.floatY * this.floatY))));
  }
  distance(vec) {
    const x = this.x - vec.x;
    const y = this.y - vec.y;

    return Math.sqrt(x * x + y * y);
  }
  fdistance(vec) {
    const x = Math.fround(this.floatX - vec.floatX);
    const y = Math.fround(this.floatY - vec.floatY);

    return Math.fround(Math.sqrt(Math.fround(Math.fround(x * x) + Math.fround(y * y))));
  }
  normalize() {
    const scale = 1 / this.length();

    return new Vector2(this.x * scale, this.y * scale);
  }
  fnormalize() {
    const scale = Math.fround(1 / this.flength());

    return new Vector2(Math.fround(this.floatX * scale), Math.fround(this.floatY * scale));
  }
  equals(vec) {
    return this.x === vec.x && this.y === vec.y;
  }
  clone() {
    return new Vector2(this.x, this.y);
  }
  toString() {
    return `${this.x},${this.y}`;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function map(value, from1, to1, from2, to2) {
  if (value < from1) {
    return from2;
  }

  if (value >= to1) {
    return to2;
  }

  return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
}

function map01(value, from1, to1) {
  return map(value, from1, to1, 0, 1);
}

function lerp(value, a, b) {
  return a * (1 - value) + b * value;
}

function lerpClamped01(value, a, b) {
  return lerp(clamp01(value), a, b);
}

function lerpVector2(value, a, b) {
  const x = lerpClamped01(value, a.floatX, b.floatX);
  const y = lerpClamped01(value, a.floatY, b.floatY);

  return new Vector2(x, y);
}

function lerpColor4(value, a, b) {
  const red = lerpClamped01(value, a.red, b.red);
  const green = lerpClamped01(value, a.green, b.green);
  const blue = lerpClamped01(value, a.blue, b.blue);
  const alpha = lerpClamped01(value, a.alpha, b.alpha);

  return new Color4(red, green, blue, alpha);
}

let MathUtils = /* #__PURE__*/Object.freeze({
  __proto__: null,
  clamp,
  clamp01,
  map,
  map01,
  lerp,
  lerpClamped01,
  lerpVector2,
  lerpColor4,
});

let EasingType;

(function (EasingType) {
  EasingType[EasingType['None'] = 0] = 'None';
  EasingType[EasingType['Out'] = 1] = 'Out';
  EasingType[EasingType['In'] = 2] = 'In';
  EasingType[EasingType['InQuad'] = 3] = 'InQuad';
  EasingType[EasingType['OutQuad'] = 4] = 'OutQuad';
  EasingType[EasingType['InOutQuad'] = 5] = 'InOutQuad';
  EasingType[EasingType['InCubic'] = 6] = 'InCubic';
  EasingType[EasingType['OutCubic'] = 7] = 'OutCubic';
  EasingType[EasingType['InOutCubic'] = 8] = 'InOutCubic';
  EasingType[EasingType['InQuart'] = 9] = 'InQuart';
  EasingType[EasingType['OutQuart'] = 10] = 'OutQuart';
  EasingType[EasingType['InOutQuart'] = 11] = 'InOutQuart';
  EasingType[EasingType['InQuint'] = 12] = 'InQuint';
  EasingType[EasingType['OutQuint'] = 13] = 'OutQuint';
  EasingType[EasingType['InOutQuint'] = 14] = 'InOutQuint';
  EasingType[EasingType['InSine'] = 15] = 'InSine';
  EasingType[EasingType['OutSine'] = 16] = 'OutSine';
  EasingType[EasingType['InOutSine'] = 17] = 'InOutSine';
  EasingType[EasingType['InExpo'] = 18] = 'InExpo';
  EasingType[EasingType['OutExpo'] = 19] = 'OutExpo';
  EasingType[EasingType['InOutExpo'] = 20] = 'InOutExpo';
  EasingType[EasingType['InCirc'] = 21] = 'InCirc';
  EasingType[EasingType['OutCirc'] = 22] = 'OutCirc';
  EasingType[EasingType['InOutCirc'] = 23] = 'InOutCirc';
  EasingType[EasingType['InElastic'] = 24] = 'InElastic';
  EasingType[EasingType['OutElastic'] = 25] = 'OutElastic';
  EasingType[EasingType['OutElasticHalf'] = 26] = 'OutElasticHalf';
  EasingType[EasingType['OutElasticQuarter'] = 27] = 'OutElasticQuarter';
  EasingType[EasingType['InOutElastic'] = 28] = 'InOutElastic';
  EasingType[EasingType['InBack'] = 29] = 'InBack';
  EasingType[EasingType['OutBack'] = 30] = 'OutBack';
  EasingType[EasingType['InOutBack'] = 31] = 'InOutBack';
  EasingType[EasingType['InBounce'] = 32] = 'InBounce';
  EasingType[EasingType['OutBounce'] = 33] = 'OutBounce';
  EasingType[EasingType['InOutBounce'] = 34] = 'InOutBounce';
  EasingType[EasingType['OutPow10'] = 35] = 'OutPow10';
})(EasingType || (EasingType = {}));

const ELASTIC_CONST = 2 * Math.PI / 0.3;
const ELASTIC_CONST2 = 0.3 / 4;
const BACK_CONST = 1.70158;
const BACK_CONST2 = BACK_CONST * 1.525;
const BOUNCE_CONST = 1 / 2.75;
const EXPO_OFFSET = Math.pow(2, -10);
const ELASTIC_OFFSET_FULL = Math.pow(2, -11);
const ELASTIC_OFFSET_HALF = Math.pow(2, -10) * Math.sin((0.5 - ELASTIC_CONST2) * ELASTIC_CONST);
const ELASTIC_OFFSET_QUARTER = Math.pow(2, -10) * Math.sin((0.25 - ELASTIC_CONST2) * ELASTIC_CONST);
const IN_OUT_ELASTIC_OFFSET = Math.pow(2, -10) * Math.sin(((1 - ELASTIC_CONST2 * 1.5) * ELASTIC_CONST) / 1.5);
const clampEase = (fn) => (p) => fn(clamp01(p));
const linear = clampEase((p) => p);
const inQuad = clampEase((p) => p * p);
const outQuad = clampEase((p) => p * (2 - p));
const inOutQuad = clampEase((p) => {
  if (p < 0.5) {
    return p * p * 2;
  }

  return --p * p * -2 + 1;
});
const inCubic = clampEase((p) => p * p * p);
const outCubic = clampEase((p) => --p * p * p + 1);
const inOutCubic = clampEase((p) => {
  if (p < 0.5) {
    return p * p * p * 4;
  }

  return --p * p * p * 4 + 1;
});
const inQuart = clampEase((p) => p * p * p * p);
const outQuart = clampEase((p) => 1 - --p * p * p * p);
const inOutQuart = clampEase((p) => {
  if (p < 0.5) {
    return p * p * p * p * 8;
  }

  return --p * p * p * p * -8 + 1;
});
const inQuint = clampEase((p) => {
  return p * p * p * p * p;
});
const outQuint = clampEase((p) => {
  return --p * p * p * p * p + 1;
});
const inOutQuint = clampEase((p) => {
  if (p < 0.5) {
    return p * p * p * p * p * 16;
  }

  return --p * p * p * p * p * 16 + 1;
});
const inSine = clampEase((p) => {
  return 1 - Math.cos(p * Math.PI * 0.5);
});
const outSine = clampEase((p) => {
  return Math.sin(p * Math.PI * 0.5);
});
const inOutSine = clampEase((p) => {
  return 0.5 - 0.5 * Math.cos(Math.PI * p);
});
const inExpo = clampEase((p) => {
  return Math.pow(2, 10 * (p - 1)) + EXPO_OFFSET * (p - 1);
});
const outExpo = clampEase((p) => {
  return -Math.pow(2, -10 * p) + 1 + EXPO_OFFSET * p;
});
const inOutExpo = clampEase((p) => {
  if (p < 0.5) {
    return 0.5 * (Math.pow(2, 20 * p - 10) + EXPO_OFFSET * (2 * p - 1));
  }

  return 1 - 0.5 * (Math.pow(2, -20 * p + 10) + EXPO_OFFSET * (-2 * p + 1));
});
const inCirc = clampEase((p) => {
  return 1 - Math.sqrt(1 - p * p);
});
const outCirc = clampEase((p) => {
  return Math.sqrt(1 - --p * p);
});
const inOutCirc = clampEase((p) => {
  if ((p *= 2) < 1) {
    return 0.5 - 0.5 * Math.sqrt(1 - p * p);
  }

  return 0.5 * Math.sqrt(1 - (p -= 2) * p) + 0.5;
});
const inElastic = clampEase((p) => {
  return -Math.pow(2, -10 + 10 * p) * Math.sin((1 - ELASTIC_CONST2 - p) * ELASTIC_CONST) + ELASTIC_OFFSET_FULL * (1 - p);
});
const outElastic = clampEase((p) => {
  return Math.pow(2, -10 * p) * Math.sin((p - ELASTIC_CONST2) * ELASTIC_CONST) + 1 - ELASTIC_OFFSET_FULL * p;
});
const outElasticHalf = clampEase((p) => {
  return Math.pow(2, -10 * p) * Math.sin((0.5 * p - ELASTIC_CONST2) * ELASTIC_CONST) + 1 - ELASTIC_OFFSET_HALF * p;
});
const outElasticQuarter = clampEase((p) => {
  return Math.pow(2, -10 * p) * Math.sin((0.25 * p - ELASTIC_CONST2) * ELASTIC_CONST) + 1 - ELASTIC_OFFSET_QUARTER * p;
});
const inOutElastic = clampEase((p) => {
  if ((p *= 2) < 1) {
    return -0.5 * (Math.pow(2, -10 + 10 * p) * Math.sin(((1 - ELASTIC_CONST2 * 1.5 - p) * ELASTIC_CONST) / 1.5) - IN_OUT_ELASTIC_OFFSET * (1 - p));
  }

  return 0.5 * (Math.pow(2, -10 * --p) * Math.sin(((p - ELASTIC_CONST2 * 1.5) * ELASTIC_CONST) / 1.5) - IN_OUT_ELASTIC_OFFSET * p) + 1;
});
const inBack = clampEase((p) => {
  return p * p * ((BACK_CONST + 1) * p - BACK_CONST);
});
const outBack = clampEase((p) => {
  return --p * p * ((BACK_CONST + 1) * p + BACK_CONST) + 1;
});
const inOutBack = clampEase((p) => {
  if ((p *= 2) < 1) {
    return 0.5 * p * p * ((BACK_CONST2 + 1) * p - BACK_CONST2);
  }

  return 0.5 * ((p -= 2) * p * ((BACK_CONST2 + 1) * p + BACK_CONST2) + 2);
});
const inBounce = clampEase((p) => {
  p = 1 - p;

  if (p < BOUNCE_CONST) {
    return 1 - 7.5625 * p * p;
  }

  if (p < 2 * BOUNCE_CONST) {
    return 1 - (7.5625 * (p -= 1.5 * BOUNCE_CONST) * p + 0.75);
  }

  if (p < 2.5 * BOUNCE_CONST) {
    return 1 - (7.5625 * (p -= 2.25 * BOUNCE_CONST) * p + 0.9375);
  }

  return 1 - (7.5625 * (p -= 2.625 * BOUNCE_CONST) * p + 0.984375);
});
const outBounce = clampEase((p) => {
  if (p < BOUNCE_CONST) {
    return 7.5625 * p * p;
  }

  if (p < 2 * BOUNCE_CONST) {
    return 7.5625 * (p -= 1.5 * BOUNCE_CONST) * p + 0.75;
  }

  if (p < 2.5 * BOUNCE_CONST) {
    return 7.5625 * (p -= 2.25 * BOUNCE_CONST) * p + 0.9375;
  }

  return 7.5625 * (p -= 2.625 * BOUNCE_CONST) * p + 0.984375;
});
const inOutBounce = clampEase((p) => {
  if (p < 0.5) {
    return 0.5 - 0.5 * outBounce(1 - p * 2);
  }

  return outBounce((p - 0.5) * 2) * 0.5 + 0.5;
});
const outPow10 = clampEase((p) => {
  return --p * Math.pow(p, 10) + 1;
});

function getEasingFn(easing) {
  switch (easing) {
    case EasingType.In:
    case EasingType.InQuad: return inQuad;
    case EasingType.Out:
    case EasingType.OutQuad: return outQuad;
    case EasingType.InOutQuad: return inOutQuad;
    case EasingType.InCubic: return inCubic;
    case EasingType.OutCubic: return outCubic;
    case EasingType.InOutCubic: return inOutCubic;
    case EasingType.InQuart: return inQuart;
    case EasingType.OutQuart: return outQuart;
    case EasingType.InOutQuart: return inOutQuart;
    case EasingType.InQuint: return inQuint;
    case EasingType.OutQuint: return outQuint;
    case EasingType.InOutQuint: return inOutQuint;
    case EasingType.InSine: return inSine;
    case EasingType.OutSine: return outSine;
    case EasingType.InOutSine: return inOutSine;
    case EasingType.InExpo: return inExpo;
    case EasingType.OutExpo: return outExpo;
    case EasingType.InOutExpo: return inOutExpo;
    case EasingType.InCirc: return inCirc;
    case EasingType.OutCirc: return outCirc;
    case EasingType.InOutCirc: return inOutCirc;
    case EasingType.InElastic: return inElastic;
    case EasingType.OutElastic: return outElastic;
    case EasingType.OutElasticHalf: return outElasticHalf;
    case EasingType.OutElasticQuarter: return outElasticQuarter;
    case EasingType.InOutElastic: return inOutElastic;
    case EasingType.InBack: return inBack;
    case EasingType.OutBack: return outBack;
    case EasingType.InOutBack: return inOutBack;
    case EasingType.InBounce: return inBounce;
    case EasingType.OutBounce: return outBounce;
    case EasingType.InOutBounce: return inOutBounce;
    case EasingType.OutPow10: return outPow10;
  }

  return linear;
}

let Easing = /* #__PURE__*/Object.freeze({
  __proto__: null,
  linear,
  inQuad,
  outQuad,
  inOutQuad,
  inCubic,
  outCubic,
  inOutCubic,
  inQuart,
  outQuart,
  inOutQuart,
  inQuint,
  outQuint,
  inOutQuint,
  inSine,
  outSine,
  inOutSine,
  inExpo,
  outExpo,
  inOutExpo,
  inCirc,
  outCirc,
  inOutCirc,
  inElastic,
  outElastic,
  outElasticHalf,
  outElasticQuarter,
  inOutElastic,
  inBack,
  outBack,
  inOutBack,
  inBounce,
  outBounce,
  inOutBounce,
  outPow10,
  getEasingFn,
});

class Command {
  constructor(params) {
    let _a, _b, _c, _d, _e, _f, _g;

    this.type = (_a = params === null || params === void 0 ? void 0 : params.type) !== null && _a !== void 0 ? _a : CommandType.None;
    this.parameter = (_b = params === null || params === void 0 ? void 0 : params.parameter) !== null && _b !== void 0 ? _b : ParameterType.None;
    this.easing = (_c = params === null || params === void 0 ? void 0 : params.easing) !== null && _c !== void 0 ? _c : EasingType.None;
    this.startTime = (_d = params === null || params === void 0 ? void 0 : params.startTime) !== null && _d !== void 0 ? _d : 0;
    this.endTime = (_e = params === null || params === void 0 ? void 0 : params.endTime) !== null && _e !== void 0 ? _e : 0;
    this.startValue = (_f = params === null || params === void 0 ? void 0 : params.startValue) !== null && _f !== void 0 ? _f : null;
    this.endValue = (_g = params === null || params === void 0 ? void 0 : params.endValue) !== null && _g !== void 0 ? _g : null;
  }
  get duration() {
    return this.endTime - this.startTime;
  }
  getProgress(time) {
    const clamped = map01(time, this.startTime, this.endTime);

    return getEasingFn(this.easing)(clamped);
  }
  getValueAtProgress(progress) {
    const getNumber = (progress, start, end) => {
      return start + progress * (end - start);
    };

    const getBoolean = (time, start, end) => {
      return start === end || time >= start && time < end;
    };

    if (typeof this.startValue === 'number') {
      const startValue = this.startValue;
      const endValue = this.endValue;

      return getNumber(progress, startValue, endValue);
    }

    if (this.startValue instanceof Vector2) {
      const startValue = this.startValue;
      const endValue = this.endValue;

      return new Vector2(getNumber(progress, startValue.floatX, endValue.floatX), getNumber(progress, startValue.floatY, endValue.floatY));
    }

    if (this.startValue instanceof Color4) {
      const startValue = this.startValue;
      const endValue = this.endValue;

      return new Color4(getNumber(progress, startValue.red, endValue.red), getNumber(progress, startValue.green, endValue.green), getNumber(progress, startValue.blue, endValue.blue), getNumber(progress, startValue.alpha, endValue.alpha));
    }

    const time = this.startTime + this.duration * progress;

    if (typeof this.startValue === 'boolean') {
      return getBoolean(time, this.startTime, this.endTime);
    }

    if (this.startValue instanceof BlendingParameters) {
      const startValue = this.startValue;
      const endValue = this.endValue;
      const isAdditive = getBoolean(time, this.startTime, this.endTime);

      return isAdditive ? startValue : endValue;
    }

    return this.endValue;
  }
  getValueAtTime(time) {
    return this.getValueAtProgress(this.getProgress(time));
  }
  equals(other) {
    return this.type === other.type
      && this.startTime === other.startTime
      && this.endTime === other.endTime
      && this.startValue === other.startValue
      && this.endValue === other.endValue
      && this.easing === other.easing
      && this.parameter === other.parameter;
  }
}

class CommandTimeline {
  constructor() {
    this._commands = [];
    this.startTime = Infinity;
    this.endTime = -Infinity;
  }
  [Symbol.iterator]() {
    const data = this.commands;
    let i = -1;

    return {
      next: () => ({ value: data[++i], done: !(i in data) }),
    };
  }
  get commands() {
    return this._commands.sort((a, b) => {
      return a.startTime - b.startTime || a.endTime - b.endTime;
    });
  }
  add(type, easing, startTime, endTime, startValue, endValue, parameter) {
    if (endTime < startTime) {
      [startTime, endTime] = [endTime, startTime];
      [startValue, endValue] = [endValue, startValue];
    }

    this._commands.push(new Command({
      type,
      easing,
      startTime,
      endTime,
      startValue,
      endValue,
      parameter,
    }));

    if (startTime < this.startTime) {
      this.startValue = startValue;
      this.startTime = startTime;
    }

    if (endTime > this.endTime) {
      this.endValue = endValue;
      this.endTime = endTime;
    }
  }
  get hasCommands() {
    return this._commands.length > 0;
  }
}

class CommandTimelineGroup {
  constructor() {
    this.x = new CommandTimeline();
    this.y = new CommandTimeline();
    this.scale = new CommandTimeline();
    this.vectorScale = new CommandTimeline();
    this.rotation = new CommandTimeline();
    this.color = new CommandTimeline();
    this.alpha = new CommandTimeline();
    this.blendingParameters = new CommandTimeline();
    this.flipH = new CommandTimeline();
    this.flipV = new CommandTimeline();
    this._timelines = [
      this.x,
      this.y,
      this.scale,
      this.vectorScale,
      this.rotation,
      this.color,
      this.alpha,
      this.blendingParameters,
      this.flipH,
      this.flipV,
    ];
  }
  get timelines() {
    return this._timelines;
  }
  get totalCommands() {
    return this._timelines.reduce((c, t) => c + t.commands.length, 0);
  }
  get commands() {
    return this._timelines
      .flatMap((t) => t.commands)
      .sort((a, b) => a.startTime - b.startTime || a.endTime - b.endTime);
  }
  get commandsStartTime() {
    let min = Infinity;

    for (let i = 0; i < this._timelines.length; ++i) {
      min = Math.min(min, this._timelines[i].startTime);
    }

    return min;
  }
  get commandsEndTime() {
    let max = -Infinity;

    for (let i = 0; i < this._timelines.length; ++i) {
      max = Math.max(max, this._timelines[i].endTime);
    }

    return max;
  }
  get commandsDuration() {
    return this.commandsEndTime - this.commandsStartTime;
  }
  get startTime() {
    return this.commandsStartTime;
  }
  get endTime() {
    return this.commandsEndTime;
  }
  get duration() {
    return this.endTime - this.startTime;
  }
  get hasCommands() {
    for (let i = 0; i < this._timelines.length; ++i) {
      if (this._timelines[i].hasCommands) {
        return true;
      }
    }

    return false;
  }
}

class CommandLoop extends CommandTimelineGroup {
  constructor(loopStartTime, loopCount) {
    super();
    this.type = CompoundType.Loop;
    this.loopStartTime = loopStartTime || 0;
    this.loopCount = loopCount || 0;
  }
  get totalIterations() {
    return this.loopCount + 1;
  }
  get startTime() {
    return this.loopStartTime + this.commandsStartTime;
  }
  get endTime() {
    return this.startTime + this.commandsDuration * this.totalIterations;
  }
  unrollCommands() {
    const commands = this.commands;

    if (commands.length === 0) {
      return [];
    }

    const { commandsDuration, totalIterations, loopStartTime } = this;
    const unrolledCommands = new Array(totalIterations * commands.length);

    for (let i = 0; i < totalIterations; i++) {
      const iterationStartTime = loopStartTime + i * commandsDuration;

      for (let j = 0; j < commands.length; j++) {
        const currentIndex = i * commands.length + j;
        const command = commands[j];

        unrolledCommands[currentIndex] = new Command({
          ...command,
          startTime: command.startTime + iterationStartTime,
          endTime: command.endTime + iterationStartTime,
        });
      }
    }

    return unrolledCommands;
  }
}

class CommandTrigger extends CommandTimelineGroup {
  constructor(triggerName, startTime, endTime, groupNumber) {
    super();
    this.type = CompoundType.Trigger;
    this.triggerName = triggerName || '';
    this.triggerStartTime = startTime || 0;
    this.triggerEndTime = endTime || 0;
    this.groupNumber = groupNumber || 0;
  }
  unrollCommands() {
    const commands = this.commands;

    if (commands.length === 0) {
      return [];
    }

    const unrolledCommands = new Array(commands.length);

    for (let i = 0; i < commands.length; i++) {
      unrolledCommands[i] = new Command({
        ...commands[i],
        startTime: commands[i].startTime + this.triggerStartTime,
        endTime: commands[i].endTime + this.triggerStartTime,
      });
    }

    return unrolledCommands;
  }
}

class StoryboardSprite {
  constructor(path, origin, anchor, position) {
    this.startTime = Infinity;
    this.endTime = -Infinity;
    this.commands = [];
    this.timelineGroup = new CommandTimelineGroup();
    this.loops = [];
    this.triggers = [];
    this.scale = new Vector2(1, 1);
    this.color = new Color4();
    this.rotation = 0;
    this.flipX = false;
    this.flipY = false;
    this.isAdditive = false;
    this.filePath = path !== null && path !== void 0 ? path : '';
    this.origin = origin !== null && origin !== void 0 ? origin : Origins.TopLeft;
    this.anchor = anchor !== null && anchor !== void 0 ? anchor : Anchor.TopLeft;
    this.startPosition = position !== null && position !== void 0 ? position : new Vector2(0, 0);
  }
  get startX() {
    return this.startPosition.floatX;
  }
  set startX(value) {
    this.startPosition.x = value;
  }
  get startY() {
    return this.startPosition.floatY;
  }
  set startY(value) {
    this.startPosition.y = value;
  }
  get duration() {
    return this.endTime - this.startTime;
  }
  get hasCommands() {
    return this.timelineGroup.hasCommands
      || this.loops.some((l) => l.hasCommands)
      || this.triggers.some((t) => t.hasCommands);
  }
  get isDrawable() {
    return this.color.alpha >= 0.01 && this.hasCommands;
  }
  addLoop(startTime, repeatCount) {
    const loop = new CommandLoop(startTime, repeatCount);

    this.loops.push(loop);

    return loop;
  }
  addTrigger(triggerName, startTime, endTime, groupNumber) {
    const trigger = new CommandTrigger(triggerName, startTime, endTime, groupNumber);

    this.triggers.push(trigger);

    return trigger;
  }
  updateCommands() {
    const unwinded = [
      ...this.timelineGroup.commands,
      ...this.loops.flatMap((l) => l.unrollCommands()),
    ];

    this.commands = unwinded.sort((a, b) => a.startTime - b.startTime);

    return this.commands;
  }
  adjustTimesToCommands() {
    let earliestStartTime = this.startTime;
    let latestEndTime = this.endTime;

    for (const command of this.commands) {
      earliestStartTime = Math.min(earliestStartTime, command.startTime);
      latestEndTime = Math.max(latestEndTime, command.endTime);
    }

    this.startTime = earliestStartTime;
    this.endTime = latestEndTime;
  }
  resetValuesToCommands() {
    const applied = {};

    for (const command of this.commands) {
      if (!applied[command.type]) {
        this.setValueFromCommand(command, 0);
        applied[command.type] = true;
      }
    }
  }
  setValueFromCommand(command, progress) {
    const value = command.getValueAtProgress(progress);

    switch (command.type) {
      case CommandType.Movement:
        this.startPosition.x = value.x;
        this.startPosition.y = value.y;
        break;
      case CommandType.MovementX:
        this.startPosition.x = value;
        break;
      case CommandType.MovementY:
        this.startPosition.y = value;
        break;
      case CommandType.Fade:
        this.color.alpha = value;
        break;
      case CommandType.Scale:
        this.scale.x = value;
        this.scale.y = value;
        break;
      case CommandType.VectorScale:
        this.scale.x = value.x;
        this.scale.y = value.y;
        break;
      case CommandType.Rotation:
        this.rotation = value;
        break;
      case CommandType.Color:
        this.color.red = value.red;
        this.color.green = value.green;
        this.color.blue = value.blue;
        break;
    }

    if (command.type !== CommandType.Parameter) {
      return;
    }

    switch (command.parameter) {
      case ParameterType.BlendingMode:
        this.isAdditive = value.rgbEquation === 1;
        break;
      case ParameterType.HorizontalFlip:
        this.flipX = value;
        break;
      case ParameterType.VerticalFlip:
        this.flipY = value;
    }
  }
}

class StoryboardAnimation extends StoryboardSprite {
  constructor(path, origin, anchor, position, frameCount, frameDelay, loopType) {
    super(path, origin, anchor, position);
    this.frameCount = frameCount !== null && frameCount !== void 0 ? frameCount : 0;
    this.frameDelay = frameDelay !== null && frameDelay !== void 0 ? frameDelay : 0;
    this.loopType = loopType !== null && loopType !== void 0 ? loopType : LoopType.LoopForever;
  }
}

class StoryboardSample {
  get isDrawable() {
    return true;
  }
  constructor(path, time, volume) {
    this.filePath = path !== null && path !== void 0 ? path : '';
    this.startTime = time !== null && time !== void 0 ? time : 0;
    this.volume = volume !== null && volume !== void 0 ? volume : 100;
  }
}

class StoryboardVideo {
  get isDrawable() {
    return true;
  }
  constructor(path, time) {
    this.filePath = path !== null && path !== void 0 ? path : '';
    this.startTime = time !== null && time !== void 0 ? time : 0;
  }
}

class StoryboardLayer {
  constructor(params) {
    let _a;

    this.visibleWhenPassing = true;
    this.visibleWhenFailing = true;
    this.elements = [];
    this.name = params.name;
    this.depth = params.depth;
    this.masking = (_a = params.masking) !== null && _a !== void 0 ? _a : true;
  }
}

class Storyboard {
  constructor() {
    this.variables = new Map();
    this.colors = new BeatmapColorSection();
    this.useSkinSprites = false;
    this.minimumLayerDepth = 0;
    this.fileFormat = 14;
    this._layers = new Map();
    this.addLayer(new StoryboardLayer({ name: 'Video', depth: 4, masking: false }));
    this.addLayer(new StoryboardLayer({ name: 'Background', depth: 3 }));
    this.addLayer(new StoryboardLayer({ name: 'Fail', depth: 2, visibleWhenPassing: false }));
    this.addLayer(new StoryboardLayer({ name: 'Pass', depth: 1, visibleWhenFailing: false }));
    this.addLayer(new StoryboardLayer({ name: 'Foreground', depth: 0 }));
    this.addLayer(new StoryboardLayer({ name: 'Overlay', depth: -2147483648 }));
  }
  get layers() {
    return this._layers;
  }
  get hasDrawable() {
    for (const layer of this.layers.values()) {
      if (layer.elements.find((e) => e.isDrawable)) {
        return true;
      }
    }

    return false;
  }
  get hasVariables() {
    for (const _ in this.variables) {
      return true;
    }

    return false;
  }
  get earliestEventTime() {
    let time = Infinity;

    this._layers.forEach((layer) => {
      const elements = layer.elements;
      const min = elements.reduce((m, el) => Math.min(m, el.startTime), 0);

      time = Math.min(min, time);
    });

    return time === Infinity ? null : time;
  }
  get latestEventTime() {
    let time = -Infinity;

    this._layers.forEach((layer) => {
      const elements = layer.elements;
      const max = elements.reduce((max, element) => {
        let _a;
        const durationElement = element;

        return Math.max(max, (_a = durationElement === null || durationElement === void 0 ? void 0 : durationElement.endTime) !== null && _a !== void 0 ? _a : element.startTime);
      }, 0);

      time = Math.max(max, time);
    });

    return time === -Infinity ? null : time;
  }
  addLayer(layer) {
    if (this._layers.has(layer.name)) {
      return;
    }

    this._layers.set(layer.name, layer);
  }
  getLayerByType(type) {
    let _a;

    return this.getLayerByName((_a = LayerType[type]) !== null && _a !== void 0 ? _a : 'Background');
  }
  getLayerByName(name) {
    let _a;
    const layer = (_a = this._layers.get(name)) !== null && _a !== void 0 ? _a : new StoryboardLayer({ name, depth: --this.minimumLayerDepth });

    if (!this._layers.has(name)) {
      this._layers.set(name, layer);
    }

    return layer;
  }
}

class BeatmapEventSection {
  constructor() {
    this.backgroundPath = null;
    this.breaks = [];
    this.storyboard = null;
  }
  get isBackgroundReplaced() {
    if (!this.backgroundPath || !this.storyboard) {
      return false;
    }

    const filePath = this.backgroundPath.trim().toLowerCase();
    const layer = this.storyboard.getLayerByType(LayerType.Background);

    return layer.elements.some((e) => e.filePath.toLowerCase() === filePath);
  }
  clone() {
    const cloned = new BeatmapEventSection();

    cloned.backgroundPath = this.backgroundPath;
    cloned.breaks = this.breaks;
    cloned.storyboard = this.storyboard;

    return cloned;
  }
}

let SampleSet;

(function (SampleSet) {
  SampleSet[SampleSet['None'] = 0] = 'None';
  SampleSet[SampleSet['Normal'] = 1] = 'Normal';
  SampleSet[SampleSet['Soft'] = 2] = 'Soft';
  SampleSet[SampleSet['Drum'] = 3] = 'Drum';
})(SampleSet || (SampleSet = {}));

class BeatmapGeneralSection {
  constructor() {
    this.audioFilename = '';
    this.overlayPosition = 'NoChange';
    this.skinPreference = '';
    this.audioLeadIn = 0;
    this.previewTime = -1;
    this.countdown = 1;
    this.stackLeniency = 0.7;
    this.countdownOffset = 0;
    this.sampleSet = SampleSet.Normal;
    this.letterboxInBreaks = false;
    this.useSkinSprites = false;
    this.epilepsyWarning = false;
    this.specialStyle = false;
    this.widescreenStoryboard = false;
    this.samplesMatchPlaybackRate = false;
  }
  clone() {
    const cloned = new BeatmapGeneralSection();

    cloned.audioFilename = this.audioFilename;

    if (this.audioHash) {
      cloned.audioHash = this.audioHash;
    }

    cloned.overlayPosition = this.overlayPosition;
    cloned.skinPreference = this.skinPreference;
    cloned.audioLeadIn = this.audioLeadIn;
    cloned.previewTime = this.previewTime;
    cloned.countdown = this.countdown;
    cloned.stackLeniency = this.stackLeniency;
    cloned.countdownOffset = this.countdownOffset;
    cloned.sampleSet = this.sampleSet;
    cloned.letterboxInBreaks = this.letterboxInBreaks;

    if (this.storyFireInFront) {
      cloned.storyFireInFront = this.storyFireInFront;
    }

    cloned.useSkinSprites = this.useSkinSprites;

    if (this.alwaysShowPlayfield) {
      cloned.alwaysShowPlayfield = this.alwaysShowPlayfield;
    }

    cloned.epilepsyWarning = this.epilepsyWarning;
    cloned.specialStyle = this.specialStyle;
    cloned.widescreenStoryboard = this.widescreenStoryboard;
    cloned.samplesMatchPlaybackRate = this.samplesMatchPlaybackRate;

    return cloned;
  }
}

class BeatmapMetadataSection {
  constructor() {
    this.title = 'Unknown Title';
    this.artist = 'Unknown Artist';
    this.creator = 'Unknown Creator';
    this.version = 'Normal';
    this.source = '';
    this.tags = [];
    this.beatmapId = 0;
    this.beatmapSetId = 0;
    this._titleUnicode = 'Unknown Title';
    this._artistUnicode = 'Unknown Artist';
  }
  get titleUnicode() {
    return this._titleUnicode !== 'Unknown Title'
      ? this._titleUnicode : this.title;
  }
  set titleUnicode(value) {
    this._titleUnicode = value;
  }
  get artistUnicode() {
    return this._artistUnicode !== 'Unknown Artist'
      ? this._artistUnicode : this.artist;
  }
  set artistUnicode(value) {
    this._artistUnicode = value;
  }
  clone() {
    const cloned = new BeatmapMetadataSection();

    cloned.title = this.title;
    cloned.titleUnicode = this.titleUnicode;
    cloned.artist = this.artist;
    cloned.artistUnicode = this.artistUnicode;
    cloned.creator = this.creator;
    cloned.version = this.version;
    cloned.source = this.source;
    cloned.tags = this.tags.slice();
    cloned.beatmapId = this.beatmapId;
    cloned.beatmapSetId = this.beatmapSetId;

    return cloned;
  }
}

class ControlPoint {
  constructor(group) {
    this.group = group || null;
  }
  attachGroup(group) {
    this.group = group;
  }
  dettachGroup() {
    this.group = null;
  }
  get startTime() {
    if (this.group) {
      return this.group.startTime;
    }

    return 0;
  }
}

class ControlPointGroup {
  constructor(time) {
    this.controlPoints = [];
    this.startTime = time;
  }
  add(point) {
    const existing = this.controlPoints.find((p) => {
      return p.pointType === point.pointType;
    });

    if (existing) {
      this.remove(existing);
    }

    point.attachGroup(this);
    this.controlPoints.push(point);
  }
  remove(point) {
    const index = this.controlPoints.findIndex((p) => {
      return p.pointType === point.pointType;
    });

    if (index !== -1) {
      this.controlPoints.splice(index, 1);
      point.dettachGroup();
    }
  }
}

function findNumber(arr, x) {
  let start = 0, mid, end = arr.length - 1;

  while (start <= end) {
    mid = start + ((end - start) >> 1);

    if (arr[mid] === x) {
      return mid;
    }

    if (arr[mid] < x) {
      start = mid + 1;
    }
    else {
      end = mid - 1;
    }
  }

  return ~start;
}

function findControlPointIndex(arr, time) {
  if (!arr.length) {
    return -1;
  }

  if (time < arr[0].startTime) {
    return -1;
  }

  if (time >= arr[arr.length - 1].startTime) {
    return arr.length - 1;
  }

  let l = 0;
  let r = arr.length - 2;

  while (l <= r) {
    const pivot = l + ((r - l) >> 1);

    if (arr[pivot].startTime < time) {
      l = pivot + 1;
    }
    else if (arr[pivot].startTime > time) {
      r = pivot - 1;
    }
    else {
      return pivot;
    }
  }

  return l - 1;
}

function findControlPoint(arr, time) {
  const index = findControlPointIndex(arr, time);

  if (index === -1) {
    return null;
  }

  return arr[index];
}

function findIndex(arr, predicate) {
  let l = -1;
  let r = arr.length - 1;

  while (1 + l < r) {
    const mid = l + ((r - l) >> 1);
    const cmp = predicate(arr[mid], mid, arr);

    cmp ? (r = mid) : (l = mid);
  }

  return r;
}

let BinarySearch = /* #__PURE__*/Object.freeze({
  __proto__: null,
  findNumber,
  findControlPointIndex,
  findControlPoint,
  findIndex,
});

function barycentricWeights(points) {
  const n = points.length;
  const w = [];

  for (let i = 0; i < n; i++) {
    w[i] = 1;

    for (let j = 0; j < n; j++) {
      if (i !== j) {
        w[i] *= points[i].floatX - points[j].floatX;
      }
    }

    w[i] = 1.0 / w[i];
  }

  return w;
}

function barycentricLagrange(points, weights, time) {
  if (points === null || points.length === 0) {
    throw new Error('points must contain at least one point');
  }

  if (points.length !== weights.length) {
    throw new Error('points must contain exactly as many items as weights');
  }

  let numerator = 0;
  let denominator = 0;

  for (let i = 0, len = points.length; i < len; ++i) {
    if (time === points[i].floatX) {
      return points[i].floatY;
    }

    const li = weights[i] / (time - points[i].floatX);

    numerator += li * points[i].floatY;
    denominator += li;
  }

  return numerator / denominator;
}

let Interpolation = /* #__PURE__*/Object.freeze({
  __proto__: null,
  barycentricWeights,
  barycentricLagrange,
});

class FastRandom {
  constructor(seed) {
    this._y = 842502087 >>> 0;
    this._z = 3579807591 >>> 0;
    this._w = 273326509 >>> 0;
    this._x = 0;
    this._bitBuffer = 0;
    this._bitIndex = 32;
    this._x = seed;
  }
  _next() {
    const t = (this._x ^ ((this._x << 11) >>> 0)) >>> 0;

    this._x = this._y >>> 0;
    this._y = this._z >>> 0;
    this._z = this._w >>> 0;
    this._w = (this._w ^ (this._w >>> 19)) >>> 0;
    this._w = (this._w ^ t) >>> 0;
    this._w = (this._w ^ (t >>> 8)) >>> 0;

    return this._w;
  }
  next() {
    return (FastRandom.INT_MASK & this._next()) >> 0;
  }
  nextUInt(lowerBound = 0, upperBound = FastRandom.MAX_INT32) {
    if (lowerBound === 0 && upperBound === FastRandom.MAX_INT32) {
      return this._next();
    }

    return (lowerBound + this.nextDouble() * (upperBound - lowerBound)) >>> 0;
  }
  nextInt(lowerBound = 0, upperBound = FastRandom.MAX_INT32) {
    return (lowerBound + this.nextDouble() * (upperBound - lowerBound)) >> 0;
  }
  nextDouble() {
    return FastRandom.INT_TO_REAL * this.next();
  }
  nextBool() {
    if (this._bitIndex === 32) {
      this._bitBuffer = this.nextUInt();
      this._bitIndex = 1;

      return (this._bitBuffer & 1) === 1;
    }

    this._bitIndex = (this._bitIndex + 1) >> 0;

    return ((this._bitBuffer >>= 1) & 1) === 1;
  }
}
FastRandom.MAX_INT32 = 2147483647;
FastRandom.MAX_UINT32 = 4294967295;
FastRandom.INT_MASK = 0x7fffffff >> 0;
FastRandom.INT_TO_REAL = 1 / (FastRandom.MAX_INT32 + 1);

class RoundHelper {
  static round(x, mode = 1) {
    return mode ? this.roundToEven(x) : this.roundAwayFromZero(x);
  }
  static roundToEven(x) {
    return this.isAtMidPoint(x) ? 2 * Math.round(x / 2) : Math.round(x);
  }
  static roundAwayFromZero(x) {
    return this.isAtMidPoint(x) ? (x > 0 ? Math.ceil(x) : Math.floor(x)) : Math.round(x);
  }
  static isAtMidPoint(x) {
    return Math.abs(0.5 - Math.abs(x - (x >> 0))) <= this.PRECISION_ERROR;
  }
}
RoundHelper.PRECISION_ERROR = 1e-15;

class SortHelper {
  static depthSort(keys, comparerFn) {
    if (!keys || keys.length === 0) {
      return keys;
    }

    comparerFn !== null && comparerFn !== void 0 ? comparerFn : (comparerFn = this.defaultCompare);
    this._depthLimitedQuickSort(keys, 0, keys.length - 1, comparerFn, this._QUICK_SORT_DEPTH_THRESHOLD);

    return keys;
  }
  static introSort(keys, comparerFn) {
    if (!keys || keys.length < 2) {
      return keys;
    }

    comparerFn !== null && comparerFn !== void 0 ? comparerFn : (comparerFn = this.defaultCompare);
    this._introSort(keys, 0, keys.length - 1, comparerFn, 2 * this._floorLog2(keys.length));

    return keys;
  }
  static _depthLimitedQuickSort(keys, left, right, comparerFn, depthLimit) {
    do {
      if (depthLimit === 0) {
        return this._heapsort(keys, left, right, comparerFn);
      }

      let i = left;
      let j = right;
      const middle = i + ((j - i) >> 1);

      this._swapIfGreater(keys, comparerFn, i, middle);
      this._swapIfGreater(keys, comparerFn, i, j);
      this._swapIfGreater(keys, comparerFn, middle, j);

      const x = keys[middle];

      do {
        while (comparerFn(keys[i], x) < 0) {
          i++;
        }

        while (comparerFn(x, keys[j]) < 0) {
          j--;
        }

        if (i > j) {
          break;
        }

        if (i < j) {
          [keys[i], keys[j]] = [keys[j], keys[i]];
        }

        i++;
        j--;
      } while (i <= j);

      depthLimit--;

      if (j - left <= right - i) {
        if (left < j) {
          this._depthLimitedQuickSort(keys, left, j, comparerFn, depthLimit);
        }

        left = i;
        continue;
      }

      if (i < right) {
        this._depthLimitedQuickSort(keys, i, right, comparerFn, depthLimit);
      }

      right = j;
    } while (left < right);
  }
  static _introSort(keys, left, right, comparerFn, depthLimit) {
    while (right > left) {
      const partitionSize = right - left + 1;

      if (partitionSize <= this._INTRO_SORT_SIZE_THRESHOLD) {
        if (partitionSize === 1) {
          return;
        }

        if (partitionSize === 2) {
          this._swapIfGreater(keys, comparerFn, left, right);

          return;
        }

        if (partitionSize === 3) {
          this._swapIfGreater(keys, comparerFn, left, right - 1);
          this._swapIfGreater(keys, comparerFn, left, right);
          this._swapIfGreater(keys, comparerFn, right - 1, right);

          return;
        }

        this._insertionSort(keys, left, right, comparerFn);

        return;
      }

      if (depthLimit === 0) {
        this._heapsort(keys, left, right, comparerFn);

        return;
      }

      depthLimit--;

      const p = this._pickPivotAndPartition(keys, left, right, comparerFn);

      this._introSort(keys, p + 1, right, comparerFn, depthLimit);
      right = p - 1;
    }
  }
  static _insertionSort(keys, lo, hi, comparerFn) {
    for (let i = lo; i < hi; ++i) {
      let j = i;
      const t = keys[i + 1];

      while (j >= lo && comparerFn(t, keys[j]) < 0) {
        keys[j + 1] = keys[j];
        j--;
      }

      keys[j + 1] = t;
    }
  }
  static _pickPivotAndPartition(keys, lo, hi, comparerFn) {
    const middle = (lo + ((hi - lo) / 2)) >> 0;

    this._swapIfGreater(keys, comparerFn, lo, middle);
    this._swapIfGreater(keys, comparerFn, lo, hi);
    this._swapIfGreater(keys, comparerFn, middle, hi);

    const pivot = keys[middle];

    this._swap(keys, middle, hi - 1);

    let left = lo;
    let right = hi - 1;

    while (left < right) {
      while (comparerFn(keys[++left], pivot) < 0)
        ;
      while (comparerFn(pivot, keys[--right]) < 0)
        ;

      if (left >= right) {
        break;
      }

      this._swap(keys, left, right);
    }

    this._swap(keys, left, (hi - 1));

    return left;
  }
  static _heapsort(keys, lo, hi, comparerFn) {
    const n = hi - lo + 1;

    for (let i = n / 2; i >= 1; --i) {
      this._downHeap(keys, i, n, lo, comparerFn);
    }

    for (let i = n; i > 1; --i) {
      this._swap(keys, lo, lo + i - 1);
      this._downHeap(keys, 1, i - 1, lo, comparerFn);
    }
  }
  static _downHeap(keys, i, n, lo, comparerFn) {
    const d = keys[lo + i - 1];

    while (i <= n / 2) {
      let child = 2 * i;

      if (child < n && comparerFn(keys[lo + child - 1], keys[lo + child]) < 0) {
        child++;
      }

      if (comparerFn(d, keys[lo + child - 1]) >= 0) {
        break;
      }

      keys[lo + i - 1] = keys[lo + child - 1];
      i = child;
    }

    keys[lo + i - 1] = d;
  }
  static _swap(keys, i, j) {
    if (i !== j) {
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }
  }
  static _swapIfGreater(keys, comparerFn, a, b) {
    if (a !== b && comparerFn(keys[a], keys[b]) > 0) {
      [keys[a], keys[b]] = [keys[b], keys[a]];
    }
  }
  static _floorLog2(n) {
    let result = 0;

    while (n >= 1) {
      result++;
      n /= 2;
    }

    return result;
  }
}
SortHelper._QUICK_SORT_DEPTH_THRESHOLD = 32;
SortHelper._INTRO_SORT_SIZE_THRESHOLD = 16;

SortHelper.defaultCompare = (x, y) => {
  if (x === undefined && y === undefined) {
    return 0;
  }

  if (x === undefined) {
    return 1;
  }

  if (y === undefined) {
    return -1;
  }

  const xString = SortHelper.toString(x);
  const yString = SortHelper.toString(y);

  if (xString < yString) {
    return -1;
  }

  if (xString > yString) {
    return 1;
  }

  return 0;
};

SortHelper.toString = (obj) => {
  if (obj === null) {
    return 'null';
  }

  if (typeof obj === 'boolean' || typeof obj === 'number') {
    return (obj).toString();
  }

  if (typeof obj === 'string') {
    return obj;
  }

  if (typeof obj === 'symbol') {
    throw new TypeError();
  }

  return JSON.stringify(obj);
};

let ControlPointType;

(function (ControlPointType) {
  ControlPointType[ControlPointType['TimingPoint'] = 0] = 'TimingPoint';
  ControlPointType[ControlPointType['DifficultyPoint'] = 1] = 'DifficultyPoint';
  ControlPointType[ControlPointType['EffectPoint'] = 2] = 'EffectPoint';
  ControlPointType[ControlPointType['SamplePoint'] = 3] = 'SamplePoint';
})(ControlPointType || (ControlPointType = {}));

class DifficultyPoint extends ControlPoint {
  constructor() {
    super(...arguments);
    this.pointType = ControlPointType.DifficultyPoint;
    this.generateTicks = true;
    this.isLegacy = false;
    this._sliderVelocity = 1;
    this.bpmMultiplier = 1;
  }
  get sliderVelocity() {
    return clamp(this._sliderVelocity, 0.1, 10);
  }
  set sliderVelocity(value) {
    this._sliderVelocity = value;
  }
  isRedundant(existing) {
    return existing !== null
      && existing.sliderVelocity === this.sliderVelocity
      && existing.generateTicks === this.generateTicks;
  }
  equals(other) {
    return other instanceof DifficultyPoint
      && this.sliderVelocity === other.sliderVelocity;
  }
}
DifficultyPoint.default = new DifficultyPoint();

class EffectPoint extends ControlPoint {
  constructor() {
    super(...arguments);
    this.pointType = ControlPointType.EffectPoint;
    this.kiai = false;
    this.omitFirstBarLine = false;
    this._scrollSpeed = 1;
  }
  get scrollSpeed() {
    return clamp(this._scrollSpeed, 0.1, 10);
  }
  set scrollSpeed(value) {
    this._scrollSpeed = value;
  }
  isRedundant(existing) {
    return (!this.omitFirstBarLine
      && existing !== null
      && this.kiai === existing.kiai
      && this.omitFirstBarLine === existing.omitFirstBarLine
      && this.scrollSpeed === existing.scrollSpeed);
  }
  equals(other) {
    return other instanceof EffectPoint
      && this.kiai === other.kiai
      && this.omitFirstBarLine === other.omitFirstBarLine
      && this.scrollSpeed === other.scrollSpeed;
  }
}
EffectPoint.default = new EffectPoint();

class SamplePoint extends ControlPoint {
  constructor() {
    super(...arguments);
    this.pointType = ControlPointType.SamplePoint;
    this.sampleSet = SampleSet[SampleSet.Normal];
    this.customIndex = 0;
    this.volume = 100;
  }
  isRedundant(existing) {
    return (existing !== null
      && this.volume === existing.volume
      && this.customIndex === existing.customIndex
      && this.sampleSet === existing.sampleSet);
  }
  equals(other) {
    return other instanceof SamplePoint
      && this.volume === other.volume
      && this.customIndex === other.customIndex
      && this.sampleSet === other.sampleSet;
  }
}
SamplePoint.default = new SamplePoint();

let TimeSignature;

(function (TimeSignature) {
  TimeSignature[TimeSignature['SimpleTriple'] = 3] = 'SimpleTriple';
  TimeSignature[TimeSignature['SimpleQuadruple'] = 4] = 'SimpleQuadruple';
})(TimeSignature || (TimeSignature = {}));

class TimingPoint extends ControlPoint {
  constructor() {
    super(...arguments);
    this.pointType = ControlPointType.TimingPoint;
    this._beatLength = 1000;
    this.timeSignature = TimeSignature.SimpleQuadruple;
  }
  get beatLength() {
    return clamp(this._beatLength, 6, 60000);
  }
  set beatLength(value) {
    this._beatLength = value;
  }
  get bpm() {
    return 60000 / this.beatLength;
  }
  isRedundant() {
    return false;
  }
  equals(other) {
    return other instanceof TimingPoint
      && this.timeSignature === other.timeSignature
      && this.beatLength === other.beatLength;
  }
}
TimingPoint.default = new TimingPoint();

class ControlPointInfo {
  constructor() {
    this.groups = [];
    this.difficultyPoints = [];
    this.effectPoints = [];
    this.samplePoints = [];
    this.timingPoints = [];
  }
  get allPoints() {
    const points = [];

    this.groups.forEach((g) => points.push(...g.controlPoints));

    return points;
  }
  groupAt(time) {
    let group = this.groups.find((g) => g.startTime === time);

    if (!group) {
      group = new ControlPointGroup(time);
      this.groups.push(group);
      this.groups.sort((a, b) => a.startTime - b.startTime);
    }

    return group;
  }
  difficultyPointAt(time) {
    const point = findControlPoint(this.difficultyPoints, time);
    const fallback = DifficultyPoint.default;

    return point || fallback;
  }
  effectPointAt(time) {
    const point = findControlPoint(this.effectPoints, time);
    const fallback = EffectPoint.default;

    return point || fallback;
  }
  samplePointAt(time) {
    const point = findControlPoint(this.samplePoints, time);
    const fallback = SamplePoint.default;

    return point || fallback;
  }
  timingPointAt(time) {
    const point = findControlPoint(this.timingPoints, time);
    const fallback = this.timingPoints[0] || TimingPoint.default;

    return point || fallback;
  }
  add(point, time) {
    if (this.checkAlreadyExisting(time, point)) {
      return false;
    }

    const list = this.getCurrentList(point);
    const index = findControlPointIndex(list, time);

    list.splice(index + 1, 0, point);
    this.groupAt(time).add(point);

    return true;
  }
  getCurrentList(newPoint) {
    switch (newPoint.pointType) {
      case ControlPointType.DifficultyPoint: return this.difficultyPoints;
      case ControlPointType.EffectPoint: return this.effectPoints;
      case ControlPointType.SamplePoint: return this.samplePoints;
      case ControlPointType.TimingPoint: return this.timingPoints;
    }

    throw new TypeError(`Unknown control point type: ${newPoint.pointType}!`);
  }
  checkAlreadyExisting(time, newPoint) {
    let existing = null;

    switch (newPoint.pointType) {
      case ControlPointType.DifficultyPoint:
        existing = this.difficultyPointAt(time);
        break;
      case ControlPointType.EffectPoint:
        existing = this.effectPointAt(time);
        break;
      case ControlPointType.SamplePoint:
        existing = findControlPoint(this.samplePoints, time);
        break;
      case ControlPointType.TimingPoint:
        existing = findControlPoint(this.timingPoints, time);
    }

    return newPoint === null || newPoint === void 0 ? void 0 : newPoint.isRedundant(existing);
  }
  remove(point, time) {
    let list;

    switch (point.pointType) {
      case ControlPointType.DifficultyPoint:
        list = this.difficultyPoints;
        break;
      case ControlPointType.EffectPoint:
        list = this.effectPoints;
        break;
      case ControlPointType.SamplePoint:
        list = this.samplePoints;
        break;
      default:
        list = this.timingPoints;
    }

    const index = list.findIndex((p) => {
      return p.startTime === point.startTime;
    });

    if (index === -1) {
      return false;
    }

    list.splice(index, 1);
    this.groupAt(time).remove(point);

    return true;
  }
  clear() {
    this.groups.length = 0;
    this.difficultyPoints.length = 0;
    this.effectPoints.length = 0;
    this.samplePoints.length = 0;
    this.timingPoints.length = 0;
  }
  clone() {
    const cloned = new ControlPointInfo();

    cloned.groups = this.groups;
    cloned.difficultyPoints = this.difficultyPoints;
    cloned.effectPoints = this.effectPoints;
    cloned.samplePoints = this.samplePoints;
    cloned.timingPoints = this.timingPoints;

    return cloned;
  }
}

let HitSound;

(function (HitSound) {
  HitSound[HitSound['None'] = 0] = 'None';
  HitSound[HitSound['Normal'] = 1] = 'Normal';
  HitSound[HitSound['Whistle'] = 2] = 'Whistle';
  HitSound[HitSound['Finish'] = 4] = 'Finish';
  HitSound[HitSound['Clap'] = 8] = 'Clap';
})(HitSound || (HitSound = {}));

let HitType;

(function (HitType) {
  HitType[HitType['Normal'] = 1] = 'Normal';
  HitType[HitType['Slider'] = 2] = 'Slider';
  HitType[HitType['NewCombo'] = 4] = 'NewCombo';
  HitType[HitType['Spinner'] = 8] = 'Spinner';
  HitType[HitType['ComboSkip1'] = 16] = 'ComboSkip1';
  HitType[HitType['ComboSkip2'] = 32] = 'ComboSkip2';
  HitType[HitType['ComboSkip3'] = 64] = 'ComboSkip3';
  HitType[HitType['ComboOffset'] = 112] = 'ComboOffset';
  HitType[HitType['Hold'] = 128] = 'Hold';
})(HitType || (HitType = {}));

let PathType;

(function (PathType) {
  PathType['Catmull'] = 'C';
  PathType['Bezier'] = 'B';
  PathType['Linear'] = 'L';
  PathType['PerfectCurve'] = 'P';
})(PathType || (PathType = {}));

let SliderEventType;

(function (SliderEventType) {
  SliderEventType[SliderEventType['Tick'] = 1] = 'Tick';
  SliderEventType[SliderEventType['LegacyLastTick'] = 2] = 'LegacyLastTick';
  SliderEventType[SliderEventType['Head'] = 4] = 'Head';
  SliderEventType[SliderEventType['Tail'] = 8] = 'Tail';
  SliderEventType[SliderEventType['Repeat'] = 16] = 'Repeat';
})(SliderEventType || (SliderEventType = {}));

class EventGenerator {
  static *generate(slider) {
    const sliderDistance = Math.min(this.SLIDER_MAX_DISTANCE, slider.path.distance);
    const tickDistance = clamp(slider.tickDistance || 0, 0, sliderDistance);
    const minDistanceFromEnd = slider.velocity * 10;
    let spanStartTime = slider.startTime;

    yield {
      eventType: SliderEventType.Head,
      startTime: spanStartTime,
      spanStartTime,
      spanIndex: 0,
      progress: 0,
    };

    if (tickDistance !== 0 && tickDistance !== Infinity) {
      for (let spanIndex = 0; spanIndex < slider.spans; ++spanIndex) {
        const reversed = !!(spanIndex & 1);
        const events = [];
        let distance = tickDistance;

        while (distance < sliderDistance - minDistanceFromEnd) {
          const progress = distance / sliderDistance;
          const timeProgress = reversed ? 1 - progress : progress;

          events.push({
            eventType: SliderEventType.Tick,
            startTime: spanStartTime + timeProgress * slider.spanDuration,
            spanStartTime,
            spanIndex,
            progress,
          });

          distance += tickDistance;
        }

        if (reversed) {
          events.reverse();
        }

        for (const event of events) {
          yield event;
        }

        if (spanIndex < slider.repeats) {
          yield {
            eventType: SliderEventType.Repeat,
            startTime: spanStartTime + slider.spanDuration,
            spanStartTime,
            spanIndex,
            progress: (spanIndex + 1) & 1,
          };
        }

        spanStartTime += slider.spanDuration;
      }
    }

    const totalDuration = slider.spans * slider.spanDuration;
    const finalSpanIndex = slider.spans - 1;
    const finalSpanStartTime = slider.startTime + finalSpanIndex * slider.spanDuration;
    const finalSpanEndTime = Math.max(slider.startTime + totalDuration / 2, finalSpanStartTime + slider.spanDuration - (slider.legacyLastTickOffset || 0));
    let finalProgress = (finalSpanEndTime - finalSpanStartTime) / slider.spanDuration;

    if ((slider.spans & 1) === 0) {
      finalProgress = 1 - finalProgress;
    }

    yield {
      eventType: SliderEventType.LegacyLastTick,
      startTime: finalSpanEndTime,
      spanStartTime: finalSpanStartTime,
      spanIndex: finalSpanIndex,
      progress: finalProgress,
    };

    yield {
      eventType: SliderEventType.Tail,
      startTime: slider.startTime + totalDuration,
      spanStartTime: finalSpanStartTime,
      spanIndex: finalSpanIndex,
      progress: slider.spans % 2,
    };
  }
}
EventGenerator.SLIDER_MAX_DISTANCE = 100000;

class DifficultyRange {
  constructor(result, min, average, max) {
    this.result = result;
    this.min = min;
    this.average = average;
    this.max = max;
  }
  static map(difficulty, min, mid, max) {
    if (difficulty > 5) {
      return mid + (max - mid) * (difficulty - 5) / 5;
    }

    if (difficulty < 5) {
      return mid - (mid - min) * (5 - difficulty) / 5;
    }

    return mid;
  }
}

let HitResult;

(function (HitResult) {
  HitResult[HitResult['None'] = 0] = 'None';
  HitResult[HitResult['Miss'] = 1] = 'Miss';
  HitResult[HitResult['Meh'] = 2] = 'Meh';
  HitResult[HitResult['Ok'] = 3] = 'Ok';
  HitResult[HitResult['Good'] = 4] = 'Good';
  HitResult[HitResult['Great'] = 5] = 'Great';
  HitResult[HitResult['Perfect'] = 6] = 'Perfect';
  HitResult[HitResult['SmallTickMiss'] = 7] = 'SmallTickMiss';
  HitResult[HitResult['SmallTickHit'] = 8] = 'SmallTickHit';
  HitResult[HitResult['LargeTickMiss'] = 9] = 'LargeTickMiss';
  HitResult[HitResult['LargeTickHit'] = 10] = 'LargeTickHit';
  HitResult[HitResult['SmallBonus'] = 11] = 'SmallBonus';
  HitResult[HitResult['LargeBonus'] = 12] = 'LargeBonus';
  HitResult[HitResult['IgnoreMiss'] = 13] = 'IgnoreMiss';
  HitResult[HitResult['IgnoreHit'] = 14] = 'IgnoreHit';
})(HitResult || (HitResult = {}));

let _a;

class HitWindows {
  constructor() {
    this._perfect = 0;
    this._great = 0;
    this._good = 0;
    this._ok = 0;
    this._meh = 0;
    this._miss = 0;
  }
  _lowestSuccessfulHitResult() {
    for (let result = HitResult.Meh; result <= HitResult.Perfect; ++result) {
      if (this.isHitResultAllowed(result)) {
        return result;
      }
    }

    return HitResult.None;
  }
  *getAllAvailableWindows() {
    for (let result = HitResult.Meh; result <= HitResult.Perfect; ++result) {
      if (this.isHitResultAllowed(result)) {
        yield [result, this.windowFor(result)];
      }
    }
  }
  isHitResultAllowed(result) {
    return true;
  }
  setDifficulty(difficulty) {
    for (const range of this._getRanges()) {
      const value = DifficultyRange.map(difficulty, range.min, range.average, range.max);

      switch (range.result) {
        case HitResult.Miss:
          this._miss = value;
          break;
        case HitResult.Meh:
          this._meh = value;
          break;
        case HitResult.Ok:
          this._ok = value;
          break;
        case HitResult.Good:
          this._good = value;
          break;
        case HitResult.Great:
          this._great = value;
          break;
        case HitResult.Perfect:
          this._perfect = value;
          break;
      }
    }
  }
  resultFor(timeOffset) {
    timeOffset = Math.abs(timeOffset);

    for (let result = HitResult.Perfect; result >= HitResult.Miss; --result) {
      if (this.isHitResultAllowed(result) && timeOffset <= this.windowFor(result)) {
        return result;
      }
    }

    return HitResult.None;
  }
  windowFor(result) {
    switch (result) {
      case HitResult.Perfect:
        return this._perfect;
      case HitResult.Great:
        return this._great;
      case HitResult.Good:
        return this._good;
      case HitResult.Ok:
        return this._ok;
      case HitResult.Meh:
        return this._meh;
      case HitResult.Miss:
        return this._miss;
      default:
        throw new Error('Unknown enum member');
    }
  }
  canBeHit(timeOffset) {
    return timeOffset <= this.windowFor(this._lowestSuccessfulHitResult());
  }
  _getRanges() {
    return HitWindows._BASE_RANGES;
  }
}
HitWindows._BASE_RANGES = [
  new DifficultyRange(HitResult.Perfect, 22.4, 19.4, 13.9),
  new DifficultyRange(HitResult.Great, 64, 49, 34),
  new DifficultyRange(HitResult.Good, 97, 82, 67),
  new DifficultyRange(HitResult.Ok, 127, 112, 97),
  new DifficultyRange(HitResult.Meh, 151, 136, 121),
  new DifficultyRange(HitResult.Miss, 188, 173, 158),
];

HitWindows.EmptyHitWindows = (_a = class EmptyHitWindows extends HitWindows {
  isHitResultAllowed(result) {
    switch (result) {
      case HitResult.Perfect:
      case HitResult.Miss:
        return true;
    }

    return false;
  }
  _getRanges() {
    return EmptyHitWindows._ranges;
  }
},
  _a._ranges = [
    new DifficultyRange(HitResult.Perfect, 0, 0, 0),
    new DifficultyRange(HitResult.Miss, 0, 0, 0),
  ],
  _a);

HitWindows.empty = new HitWindows.EmptyHitWindows();

class HitObject {
  constructor() {
    this.kiai = false;
    this.nestedHitObjects = [];
    this.startTime = 0;
    this.hitType = HitType.Normal;
    this.hitSound = HitSound.Normal;
    this.samples = [];
    this.startPosition = new Vector2(0, 0);
    this.hitWindows = new HitWindows();
  }
  get startX() {
    return this.startPosition.floatX;
  }
  set startX(value) {
    this.startPosition.x = value;
  }
  get startY() {
    return this.startPosition.floatY;
  }
  set startY(value) {
    this.startPosition.y = value;
  }
  createNestedHitObjects() {
    this.nestedHitObjects = [];
  }
  applyDefaultsToSelf(controlPoints, difficulty) {
    let _a;

    this.kiai = controlPoints.effectPointAt(this.startTime + 1).kiai;
    (_a = this.hitWindows) === null || _a === void 0 ? void 0 : _a.setDifficulty(difficulty.overallDifficulty);
  }
  applyDefaultsToNested(controlPoints, difficulty) {
    this.nestedHitObjects.forEach((n) => {
      n.applyDefaults(controlPoints, difficulty);
    });
  }
  applyDefaults(controlPoints, difficulty) {
    this.applyDefaultsToSelf(controlPoints, difficulty);
    this.nestedHitObjects = [];
    this.createNestedHitObjects();
    this.nestedHitObjects.sort((a, b) => a.startTime - b.startTime);
    this.applyDefaultsToNested(controlPoints, difficulty);
  }
  clone() {
    const HitObject = this.constructor;
    const cloned = new HitObject();

    cloned.startPosition = this.startPosition.clone();
    cloned.startTime = this.startTime;
    cloned.hitType = this.hitType;
    cloned.hitSound = this.hitSound;
    cloned.samples = this.samples.map((s) => s.clone());
    cloned.kiai = this.kiai;

    return cloned;
  }
}

class PathApproximator {
  static approximateBezier(controlPoints) {
    return this.approximateBSpline(controlPoints);
  }
  static approximateBSpline(controlPoints, p = 0) {
    const output = [];
    const n = controlPoints.length - 1;

    if (n < 0) {
      return output;
    }

    const toFlatten = [];
    const freeBuffers = [];
    const points = controlPoints.slice();

    if (p > 0 && p < n) {
      for (let i = 0; i < n - p; ++i) {
        const subBezier = [points[i]];

        for (let j = 0; j < p - 1; ++j) {
          subBezier[j + 1] = points[i + 1];

          for (let k = 1; k < p - j; ++k) {
            const l = Math.min(k, n - p - i);

            points[i + k] = (points[i + k]
              .fscale(l)
              .fadd(points[i + k + 1]))
              .fdivide(l + 1);
          }
        }

        subBezier[p] = points[i + 1];
        toFlatten.push(subBezier);
      }

      toFlatten.push(points.slice(n - p));
      toFlatten.reverse();
    }
    else {
      p = n;
      toFlatten.push(points);
    }

    const subdivisionBuffer1 = [];
    const subdivisionBuffer2 = [];
    const leftChild = subdivisionBuffer2;

    while (toFlatten.length > 0) {
      const parent = toFlatten.pop() || [];

      if (this._bezierIsFlatEnough(parent)) {
        this._bezierApproximate(parent, output, subdivisionBuffer1, subdivisionBuffer2, p + 1);
        freeBuffers.push(parent);
        continue;
      }

      const rightChild = freeBuffers.pop() || [];

      this._bezierSubdivide(parent, leftChild, rightChild, subdivisionBuffer1, p + 1);

      for (let i = 0; i < p + 1; ++i) {
        parent[i] = leftChild[i];
      }

      toFlatten.push(rightChild);
      toFlatten.push(parent);
    }

    output.push(controlPoints[n]);

    return output;
  }
  static approximateCatmull(controlPoints) {
    const output = [];
    const controlPointsLength = controlPoints.length;

    for (let i = 0; i < controlPointsLength - 1; i++) {
      const v1 = i > 0 ? controlPoints[i - 1] : controlPoints[i];
      const v2 = controlPoints[i];
      const v3 = i < controlPointsLength - 1
        ? controlPoints[i + 1]
        : v2.fadd(v2).fsubtract(v1);
      const v4 = i < controlPointsLength - 2
        ? controlPoints[i + 2]
        : v3.fadd(v3).fsubtract(v2);

      for (let c = 0; c < PathApproximator.CATMULL_DETAIL; c++) {
        output.push(PathApproximator._catmullFindPoint(v1, v2, v3, v4, Math.fround(Math.fround(c) / PathApproximator.CATMULL_DETAIL)));
        output.push(PathApproximator._catmullFindPoint(v1, v2, v3, v4, Math.fround(Math.fround(c + 1) / PathApproximator.CATMULL_DETAIL)));
      }
    }

    return output;
  }
  static approximateCircularArc(controlPoints) {
    const pr = this._circularArcProperties(controlPoints);

    if (!pr.isValid) {
      return this.approximateBezier(controlPoints);
    }

    let amountPoints = 2;

    if (2 * pr.radius > PathApproximator.CIRCULAR_ARC_TOLERANCE) {
      let angle = Math.fround(PathApproximator.CIRCULAR_ARC_TOLERANCE / pr.radius);

      angle = Math.fround(1 - angle);
      angle = Math.fround(2 * Math.fround(Math.acos(angle)));

      const points = Math.ceil(Math.fround(pr.thetaRange / angle));
      const validPoints = !isFinite(points) ? -(2 ** 31) : points;

      amountPoints = Math.max(2, validPoints);
    }

    const output = [];

    for (let i = 0; i < amountPoints; ++i) {
      const fract = i / (amountPoints - 1);
      const theta = pr.thetaStart + pr.direction * fract * pr.thetaRange;
      const vector2 = new Vector2(Math.fround(Math.cos(theta)), Math.fround(Math.sin(theta)));

      output.push(vector2.fscale(pr.radius).fadd(pr.centre));
    }

    return output;
  }
  static _circularArcProperties(controlPoints) {
    const a = controlPoints[0];
    const b = controlPoints[1];
    const c = controlPoints[2];
    const sideLength = Math.fround(Math.fround(b.floatY - a.floatY) * Math.fround(c.floatX - a.floatX) -
      Math.fround(b.floatX - a.floatX) * Math.fround(c.floatY - a.floatY));

    if (Math.abs(sideLength) < Math.fround(0.001)) {
      return new CircularArcProperties();
    }

    const d = Math.fround(2 * Math.fround((Math.fround(a.floatX * b.fsubtract(c).floatY) +
      Math.fround(b.floatX * c.fsubtract(a).floatY) +
      Math.fround(c.floatX * a.fsubtract(b).floatY))));
    const aSq = Math.fround(Math.fround(a.floatX * a.floatX) + Math.fround(a.floatY * a.floatY));
    const bSq = Math.fround(Math.fround(b.floatX * b.floatX) + Math.fround(b.floatY * b.floatY));
    const cSq = Math.fround(Math.fround(c.floatX * c.floatX) + Math.fround(c.floatY * c.floatY));
    const centre = new Vector2(Math.fround(Math.fround(Math.fround(aSq * b.fsubtract(c).floatY) +
      Math.fround(bSq * c.fsubtract(a).floatY)) + Math.fround(cSq * a.fsubtract(b).floatY)), Math.fround(Math.fround(Math.fround(aSq * c.fsubtract(b).floatX) +
        Math.fround(bSq * a.fsubtract(c).floatX)) + Math.fround(cSq * b.fsubtract(a).floatX))).fdivide(d);
    const dA = a.fsubtract(centre);
    const dC = c.fsubtract(centre);
    const radius = dA.flength();
    const thetaStart = Math.atan2(dA.floatY, dA.floatX);
    let thetaEnd = Math.atan2(dC.floatY, dC.floatX);

    while (thetaEnd < thetaStart) {
      thetaEnd += 2 * Math.PI;
    }

    let direction = 1;
    let thetaRange = thetaEnd - thetaStart;
    let orthoAtoC = c.fsubtract(a);

    orthoAtoC = new Vector2(orthoAtoC.floatY, -orthoAtoC.floatX);

    if (orthoAtoC.fdot(b.fsubtract(a)) < 0) {
      direction = -direction;
      thetaRange = 2 * Math.PI - thetaRange;
    }

    return new CircularArcProperties(thetaStart, thetaRange, direction, radius, centre);
  }
  static approximateLinear(controlPoints) {
    return controlPoints.slice();
  }
  static approximateLagrangePolynomial(controlPoints) {
    const NUM_STEPS = 51;
    const output = [];
    const weights = barycentricWeights(controlPoints);
    let minX = controlPoints[0].floatX;
    let maxX = controlPoints[0].floatX;

    for (let i = 1, len = controlPoints.length; i < len; i++) {
      minX = Math.min(minX, controlPoints[i].floatX);
      maxX = Math.max(maxX, controlPoints[i].floatX);
    }

    const dx = maxX - minX;

    for (let i = 0; i < NUM_STEPS; i++) {
      const x = minX + (dx / (NUM_STEPS - 1)) * i;
      const y = Math.fround(barycentricLagrange(controlPoints, weights, x));

      output.push(new Vector2(x, y));
    }

    return output;
  }
  static _bezierIsFlatEnough(controlPoints) {
    let vector2;

    for (let i = 1, len = controlPoints.length; i < len - 1; i++) {
      vector2 = controlPoints[i - 1]
        .fsubtract(controlPoints[i].fscale(2))
        .fadd(controlPoints[i + 1]);

      if (vector2.flength() ** 2 > PathApproximator.BEZIER_TOLERANCE ** 2 * 4) {
        return false;
      }
    }

    return true;
  }
  static _bezierSubdivide(controlPoints, l, r, subdivisionBuffer, count) {
    const midpoints = subdivisionBuffer;

    for (let i = 0; i < count; ++i) {
      midpoints[i] = controlPoints[i];
    }

    for (let i = 0; i < count; ++i) {
      l[i] = midpoints[0];
      r[count - i - 1] = midpoints[count - i - 1];

      for (let j = 0; j < count - i - 1; j++) {
        midpoints[j] = midpoints[j].fadd(midpoints[j + 1]).fdivide(2);
      }
    }
  }
  static _bezierApproximate(controlPoints, output, subdivisionBuffer1, subdivisionBuffer2, count) {
    const l = subdivisionBuffer2;
    const r = subdivisionBuffer1;

    PathApproximator._bezierSubdivide(controlPoints, l, r, subdivisionBuffer1, count);

    for (let i = 0; i < count - 1; ++i) {
      l[count + i] = r[i + 1];
    }

    output.push(controlPoints[0]);

    for (let i = 1; i < count - 1; ++i) {
      const index = 2 * i;
      const p = l[index - 1]
        .fadd(l[index].fscale(2))
        .fadd(l[index + 1])
        .fscale(Math.fround(0.25));

      output.push(p);
    }
  }
  static _catmullFindPoint(vec1, vec2, vec3, vec4, t) {
    const t2 = Math.fround(t * t);
    const t3 = Math.fround(t * t2);
    const coordinates = [];

    for (let i = 0; i <= 1; ++i) {
      const value1 = i === 0 ? vec1.floatX : vec1.floatY;
      const value2 = i === 0 ? vec2.floatX : vec2.floatY;
      const value3 = i === 0 ? vec3.floatX : vec3.floatY;
      const value4 = i === 0 ? vec4.floatX : vec4.floatY;
      const v1 = Math.fround(2 * value2);
      const v2 = Math.fround(value3 - value1);
      const v31 = Math.fround(2 * value1);
      const v32 = Math.fround(5 * value2);
      const v33 = Math.fround(4 * value3);
      const v41 = Math.fround(3 * value2);
      const v42 = Math.fround(3 * value3);
      const v5 = Math.fround(v2 * t);
      const v61 = Math.fround(v31 - v32);
      const v62 = Math.fround(v61 + v33);
      const v63 = Math.fround(v62 - value4);
      const v6 = Math.fround(v63);
      const v71 = Math.fround(v41 - value1);
      const v72 = Math.fround(v71 - v42);
      const v7 = Math.fround(v72 + value4);
      const v8 = Math.fround(v6 * t2);
      const v9 = Math.fround(v7 * t3);
      const v101 = Math.fround(v1 + v5);
      const v102 = Math.fround(v101 + v8);
      const v10 = Math.fround(v102 + v9);

      coordinates.push(Math.fround(Math.fround(0.5) * v10));
    }

    return new Vector2(coordinates[0], coordinates[1]);
  }
}
PathApproximator.BEZIER_TOLERANCE = Math.fround(0.25);
PathApproximator.CIRCULAR_ARC_TOLERANCE = Math.fround(0.1);
PathApproximator.CATMULL_DETAIL = 50;

class CircularArcProperties {
  constructor(thetaStart, thetaRange, direction, radius, centre) {
    this.isValid = !!(thetaStart || thetaRange || direction || radius || centre);
    this.thetaStart = thetaStart || 0;
    this.thetaRange = thetaRange || 0;
    this.direction = direction || 0;
    this.radius = radius ? Math.fround(radius) : 0;
    this.centre = centre || new Vector2(0, 0);
  }
  get thetaEnd() {
    return this.thetaStart + this.thetaRange * this.direction;
  }
}

class PathPoint {
  constructor(position, type) {
    this.position = position || new Vector2(0, 0);
    this.type = type || null;
  }
}

class SliderPath {
  constructor(curveType, controlPoints, expectedDistance) {
    this._calculatedLength = 0;
    this._calculatedPath = [];
    this._cumulativeLength = [];
    this._isCached = false;
    this._curveType = curveType || PathType.Linear;
    this._controlPoints = controlPoints || [];
    this._expectedDistance = expectedDistance || 0;
  }
  get curveType() {
    return this._curveType;
  }
  set curveType(value) {
    this._curveType = value;
    this.invalidate();
  }
  get controlPoints() {
    return this._controlPoints;
  }
  set controlPoints(value) {
    this._controlPoints = value;
    this.invalidate();
  }
  get expectedDistance() {
    return this._expectedDistance;
  }
  set expectedDistance(value) {
    this._expectedDistance = value;
    this.invalidate();
  }
  get distance() {
    this._ensureValid();

    if (this._cumulativeLength.length) {
      return this._cumulativeLength[this._cumulativeLength.length - 1];
    }

    return 0;
  }
  set distance(value) {
    this.expectedDistance = value;
  }
  get calculatedDistance() {
    this._ensureValid();

    return this._calculatedLength;
  }
  get path() {
    this._ensureValid();

    const path = [];

    for (let i = 0; i < this._calculatedPath.length; i++) {
      if (this._cumulativeLength[i] >= this.expectedDistance) {
        break;
      }
      else {
        path.push(this._calculatedPath[i]);
      }
    }

    path.push(this.positionAt(1));

    return path;
  }
  get calculatedPath() {
    this._ensureValid();

    return this._calculatedPath;
  }
  invalidate() {
    this._calculatedLength = 0;
    this._calculatedPath = [];
    this._cumulativeLength = [];
    this._isCached = false;
  }
  calculatePathToProgress(path, p0, p1) {
    this._ensureValid();

    const d0 = this._progressToDistance(p0);
    const d1 = this._progressToDistance(p1);
    let i = 0;

    while (i < this._calculatedPath.length && this._cumulativeLength[i] < d0) {
      ++i;
    }

    path = [this._interpolateVertices(i, d0)];

    while (i < this._calculatedPath.length && this._cumulativeLength[i++] <= d1) {
      path.push(this._calculatedPath[i]);
    }

    path.push(this._interpolateVertices(i, d1));
  }
  progressAt(progress, spans) {
    const p = (progress * spans) % 1;

    return Math.trunc(progress * spans) % 2 ? 1 - p : p;
  }
  positionAt(progress) {
    this._ensureValid();

    const d = this._progressToDistance(progress);

    return this._interpolateVertices(this._indexOfDistance(d), d);
  }
  curvePositionAt(progress, spans) {
    return this.positionAt(this.progressAt(progress, spans));
  }
  clone() {
    const controlPoints = this._controlPoints.map((p) => {
      return new PathPoint(p.position.clone(), p.type);
    });

    return new SliderPath(this._curveType, controlPoints, this._expectedDistance);
  }
  _ensureValid() {
    if (this._isCached) {
      return;
    }

    this._calculatePath();
    this._calculateLength();
    this._isCached = true;
  }
  _calculatePath() {
    this._calculatedPath = [];

    const pathPointsLength = this.controlPoints.length;

    if (pathPointsLength === 0) {
      return;
    }

    const vertices = [];

    for (let i = 0; i < pathPointsLength; i++) {
      vertices[i] = this.controlPoints[i].position;
    }

    let start = 0;

    for (let i = 0; i < pathPointsLength; ++i) {
      if (!this.controlPoints[i].type && i < pathPointsLength - 1) {
        continue;
      }

      const segmentVertices = vertices.slice(start, i + 1);
      const segmentType = this.controlPoints[start].type || PathType.Linear;

      for (const t of this._calculateSubPath(segmentVertices, segmentType)) {
        const last = this._calculatedPath[this._calculatedPath.length - 1];

        if (this._calculatedPath.length === 0 || !last.equals(t)) {
          this._calculatedPath.push(t);
        }
      }

      start = i;
    }
  }
  _calculateSubPath(subControlPoints, type) {
    switch (type) {
      case PathType.Linear:
        return PathApproximator.approximateLinear(subControlPoints);
      case PathType.PerfectCurve: {
        if (subControlPoints.length !== 3) {
          break;
        }

        const subpath = PathApproximator.approximateCircularArc(subControlPoints);

        if (subpath.length === 0) {
          break;
        }

        return subpath;
      }
      case PathType.Catmull:
        return PathApproximator.approximateCatmull(subControlPoints);
    }

    return PathApproximator.approximateBezier(subControlPoints);
  }
  _calculateLength() {
    this._calculatedLength = 0;
    this._cumulativeLength = [0];

    for (let i = 0, l = this._calculatedPath.length - 1; i < l; ++i) {
      const diff = this._calculatedPath[i + 1].fsubtract(this._calculatedPath[i]);

      this._calculatedLength += diff.flength();
      this._cumulativeLength.push(this._calculatedLength);
    }

    if (this.expectedDistance && this._calculatedLength !== this.expectedDistance) {
      const controlPoints = this.controlPoints;
      const lastPoint = controlPoints[controlPoints.length - 1];
      const preLastPoint = controlPoints[controlPoints.length - 2];
      const pointsAreEqual = controlPoints.length >= 2
        && lastPoint.position.equals(preLastPoint.position);

      if (pointsAreEqual && this.expectedDistance > this._calculatedLength) {
        this._cumulativeLength.push(this._calculatedLength);

        return;
      }

      this._cumulativeLength.pop();

      let pathEndIndex = this._calculatedPath.length - 1;

      if (this._calculatedLength > this.expectedDistance) {
        while (this._cumulativeLength.length > 0 &&
          this._cumulativeLength[this._cumulativeLength.length - 1] >=
          this.expectedDistance) {
          this._cumulativeLength.pop();
          this._calculatedPath.splice(pathEndIndex--, 1);
        }
      }

      if (pathEndIndex <= 0) {
        this._cumulativeLength.push(0);

        return;
      }

      const direction = this._calculatedPath[pathEndIndex]
        .fsubtract(this._calculatedPath[pathEndIndex - 1])
        .fnormalize();
      const distance = Math.fround(this.expectedDistance -
        this._cumulativeLength[this._cumulativeLength.length - 1]);

      this._calculatedPath[pathEndIndex] = this._calculatedPath[pathEndIndex - 1]
        .fadd(direction.fscale(distance));

      this._cumulativeLength.push(this.expectedDistance);
    }
  }
  _indexOfDistance(d) {
    let i = findNumber(this._cumulativeLength, d);

    if (i < 0) {
      i = ~i;
    }

    return i;
  }
  _progressToDistance(progress) {
    return clamp01(progress) * this.distance;
  }
  _interpolateVertices(i, d) {
    if (this._calculatedPath.length === 0) {
      return new Vector2(0, 0);
    }

    if (i <= 0) {
      return this._calculatedPath[0];
    }

    if (i >= this._calculatedPath.length) {
      return this._calculatedPath[this._calculatedPath.length - 1];
    }

    const p0 = this._calculatedPath[i - 1];
    const p1 = this._calculatedPath[i];
    const d0 = this._cumulativeLength[i - 1];
    const d1 = this._cumulativeLength[i];

    if (Math.abs(d0 - d1) < 0.001) {
      return p0;
    }

    const w = (d - d0) / (d1 - d0);

    return p0.fadd(p1.fsubtract(p0).fscale(w));
  }
}

class HitSample {
  constructor() {
    this.sampleSet = SampleSet[SampleSet.None];
    this.hitSound = HitSound[HitSound.Normal];
    this.customIndex = 0;
    this.suffix = '';
    this.volume = 100;
    this.isLayered = false;
    this.filename = '';
  }
  clone() {
    const cloned = new HitSample();

    cloned.sampleSet = this.sampleSet;
    cloned.hitSound = this.hitSound;
    cloned.customIndex = this.customIndex;
    cloned.suffix = this.suffix;
    cloned.volume = this.volume;
    cloned.isLayered = this.isLayered;
    cloned.filename = this.filename;

    return cloned;
  }
}

class SampleBank {
  constructor() {
    this.filename = '';
    this.volume = 100;
    this.normalSet = SampleSet.Normal;
    this.additionSet = SampleSet.Normal;
    this.customIndex = 0;
  }
  clone() {
    const cloned = new SampleBank();

    cloned.filename = this.filename;
    cloned.volume = this.volume;
    cloned.normalSet = this.normalSet;
    cloned.additionSet = this.additionSet;
    cloned.customIndex = this.customIndex;

    return cloned;
  }
}

class Beatmap {
  constructor() {
    this.general = new BeatmapGeneralSection();
    this.editor = new BeatmapEditorSection();
    this.difficulty = new BeatmapDifficultySection();
    this.metadata = new BeatmapMetadataSection();
    this.colors = new BeatmapColorSection();
    this.events = new BeatmapEventSection();
    this.controlPoints = new ControlPointInfo();
    this.hitObjects = [];
    this.fileFormat = 14;
    this.fileUpdateDate = new Date();
    this.originalMode = 0;
    this.originalModeStr = "";
  }
  get mode() {
    return this.originalMode;
  }
  get length() {
    if (!this.hitObjects.length) {
      return 0;
    }

    const first = this.hitObjects[0];
    const last = this.hitObjects[this.hitObjects.length - 1];
    const durationLast = last;
    const startTime = first.startTime;
    const endTime = durationLast.endTime || last.startTime;

    return (endTime - startTime) / this.difficulty.clockRate;
  }
  get totalLength() {
    if (!this.hitObjects.length) {
      return 0;
    }

    const last = this.hitObjects[this.hitObjects.length - 1];
    const durationObject = last;
    const endTime = durationObject.endTime || last.startTime;

    return endTime / this.difficulty.clockRate;
  }
  get bpmMin() {
    const beats = this.controlPoints.timingPoints
      .map((t) => t.bpm)
      .filter((t) => t >= 0);

    if (beats.length) {
      const bpm = beats.reduce((bpm, beat) => Math.min(bpm, beat), Infinity);

      return bpm * this.difficulty.clockRate;
    }

    return 60;
  }
  get bpmMax() {
    const beats = this.controlPoints.timingPoints
      .map((t) => t.bpm)
      .filter((t) => t >= 0);

    if (beats.length) {
      const bpm = beats.reduce((bpm, beat) => Math.max(bpm, beat), 0);

      return bpm * this.difficulty.clockRate;
    }

    return 60;
  }
  get bpm() {
    let _a, _b, _c;

    if (!this.controlPoints.timingPoints.length) {
      return this.bpmMax;
    }

    const timingPoints = this.controlPoints.timingPoints;
    const hitObjects = this.hitObjects;
    const lastTimingPoint = timingPoints[timingPoints.length - 1];
    const lastHitObject = hitObjects[hitObjects.length - 1];
    const durationObject = lastHitObject;
    const lastTime = (_c = (_b = (_a = durationObject === null || durationObject === void 0 ? void 0 : durationObject.endTime) !== null && _a !== void 0 ? _a : lastHitObject === null || lastHitObject === void 0 ? void 0 : lastHitObject.startTime) !== null && _b !== void 0 ? _b : lastTimingPoint === null || lastTimingPoint === void 0 ? void 0 : lastTimingPoint.startTime) !== null && _c !== void 0 ? _c : 0;
    let nextTime = 0;
    let nextBeat = 0;
    const groups = {};

    for (let i = 0, len = timingPoints.length; i < len; ++i) {
      nextTime = i === len - 1 ? lastTime : timingPoints[i + 1].startTime;
      nextBeat = RoundHelper.round(timingPoints[i].beatLength * 1000) / 1000;

      if (timingPoints[i].startTime > lastTime) {
        groups[nextBeat] = 0;
        continue;
      }

      if (!groups[nextBeat]) {
        groups[nextBeat] = 0;
      }

      groups[nextBeat] += (nextTime - timingPoints[i].startTime);
    }

    const entries = Object.entries(groups).sort((a, b) => b[1] - a[1]);

    return 60000 / Number(entries[0][0]) * this.difficulty.clockRate;
  }
  get totalBreakTime() {
    return (this.events.breaks || []).reduce((d, e) => d + e.duration, 0);
  }
  get hittable() {
    return this.hitObjects.reduce((s, h) => {
      return s + (h.hitType & HitType.Normal ? 1 : 0);
    }, 0);
  }
  get slidable() {
    return this.hitObjects.reduce((s, h) => {
      return s + (h.hitType & HitType.Slider ? 1 : 0);
    }, 0);
  }
  get spinnable() {
    return this.hitObjects.reduce((s, h) => {
      return s + (h.hitType & HitType.Spinner ? 1 : 0);
    }, 0);
  }
  get holdable() {
    return this.hitObjects.reduce((s, h) => {
      return s + (h.hitType & HitType.Hold ? 1 : 0);
    }, 0);
  }
  clone() {
    const Beatmap = this.constructor;
    const cloned = new Beatmap();

    cloned.general = this.general.clone();
    cloned.editor = this.editor.clone();
    cloned.difficulty = this.difficulty.clone();
    cloned.metadata = this.metadata.clone();
    cloned.colors = this.colors.clone();
    cloned.events = this.events.clone();
    cloned.controlPoints = this.controlPoints.clone();
    cloned.hitObjects = this.hitObjects.map((h) => h.clone());
    cloned.originalMode = this.originalMode;
    cloned.originalModeStr = this.originalModeStr;
    cloned.fileFormat = this.fileFormat;

    if (this.base) {
      cloned.base = this.base;
    }

    return cloned;
  }
}

class BeatmapConverter {
  convertBeatmap(beatmap) {
    let _a;
    const converted = this.createBeatmap();

    converted.general = beatmap.general;
    converted.editor = beatmap.editor;
    converted.difficulty = beatmap.difficulty.clone();
    converted.metadata = beatmap.metadata;
    converted.colors = beatmap.colors;
    converted.events = beatmap.events;
    converted.controlPoints = beatmap.controlPoints;
    converted.fileFormat = beatmap.fileFormat;
    converted.originalMode = beatmap.originalMode;
    converted.base = (_a = beatmap.base) !== null && _a !== void 0 ? _a : beatmap;

    for (const hitObject of this.convertHitObjects(converted.base)) {
      converted.hitObjects.push(hitObject);
    }

    converted.hitObjects.sort((a, b) => a.startTime - b.startTime);

    return converted;
  }
}

class BeatmapInfo {
  get ruleset() {
    return this._ruleset;
  }
  set ruleset(value) {
    let _a, _b;

    this._ruleset = value;
    this._mods = (_b = (_a = this.ruleset) === null || _a === void 0 ? void 0 : _a.createModCombination(this.rawMods)) !== null && _b !== void 0 ? _b : null;
  }
  get rulesetId() {
    let _a, _b;

    return (_b = (_a = this.ruleset) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : this._rulesetId;
  }
  set rulesetId(value) {
    this._rulesetId = value;
  }
  get mods() {
    return this._mods;
  }
  set mods(value) {
    let _a;

    this._mods = value;
    this._rawMods = (_a = value === null || value === void 0 ? void 0 : value.bitwise) !== null && _a !== void 0 ? _a : 0;
  }
  get rawMods() {
    return this._rawMods;
  }
  set rawMods(value) {
    let _a, _b;

    if (this._rawMods === value) {
      return;
    }

    this._rawMods = value;
    this._mods = (_b = (_a = this.ruleset) === null || _a === void 0 ? void 0 : _a.createModCombination(value)) !== null && _b !== void 0 ? _b : null;
  }
  constructor(options = {}) {
    this.id = 0;
    this.beatmapsetId = 0;
    this.creatorId = 0;
    this.creator = '';
    this.favourites = 0;
    this.passcount = 0;
    this.playcount = 0;
    this.status = -2;
    this.title = 'Unknown title';
    this.artist = 'Unknown artist';
    this.version = 'Normal';
    this.hittable = 0;
    this.slidable = 0;
    this.spinnable = 0;
    this.holdable = 0;
    this.length = 0;
    this.bpmMin = 0;
    this.bpmMax = 0;
    this.bpm = 0;
    this.circleSize = 0;
    this.approachRate = 0;
    this.overallDifficulty = 0;
    this.drainRate = 0;
    this._ruleset = null;
    this._rulesetId = 0;
    this._mods = null;
    this._rawMods = 0;
    this.starRating = 0;
    this.maxCombo = 0;
    this.isConvert = false;
    this.deletedAt = null;
    this.updatedAt = null;
    this.hashMD5 = '';
    Object.assign(this, options);
  }
  get totalHits() {
    return this.hittable + this.slidable + this.spinnable + this.holdable;
  }
  clone() {
    const BeatmapInfo = this.constructor;
    const cloned = new BeatmapInfo();

    Object.assign(cloned, this);

    return cloned;
  }
  equals(other) {
    if (!other) {
      return false;
    }

    if (this.id !== 0 && other.id !== 0) {
      return this.id === other.id;
    }

    return false;
  }
  toJSON() {
    let _a, _b;
    const partial = {};
    const deselect = ['ruleset', 'rawMods', 'mods'];

    for (const key in this) {
      if (key.startsWith('_')) {
        continue;
      }

      if (deselect.includes(key)) {
        continue;
      }

      partial[key] = this[key];
    }

    return {
      ...partial,
      mods: (_b = (_a = this.mods) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : 'NM',
      rulesetId: this.rulesetId,
      totalHits: this.totalHits,
      deletedAt: this.deletedAt ? this.deletedAt.getTime() / 1000 : null,
      updatedAt: this.updatedAt ? this.updatedAt.getTime() / 1000 : null,
    };
  }
  static fromJSON(json) {
    return new BeatmapInfo({
      ...json,
      deletedAt: json.deletedAt ? new Date(json.deletedAt * 1000) : null,
      updatedAt: json.updatedAt ? new Date(json.updatedAt * 1000) : null,
      rawMods: json.mods,
    });
  }
}

class BeatmapProcessor {
  preProcess(beatmap) {
    let _a, _b, _c;
    const objects = beatmap.hitObjects.filter((hitObject) => {
      const comboObject = hitObject;

      if (typeof comboObject.comboIndex === 'number') {
        return comboObject;
      }
    });
    const objectsWithCombo = objects;
    let lastObj = null;

    for (let i = 0; i < objectsWithCombo.length; i++) {
      const obj = objectsWithCombo[i];

      if (i === 0) {
        objectsWithCombo[i].hitType |= HitType.NewCombo;
        objectsWithCombo[i].isNewCombo = true;
      }

      obj.comboIndex = (_a = lastObj === null || lastObj === void 0 ? void 0 : lastObj.comboIndex) !== null && _a !== void 0 ? _a : 0;
      obj.comboIndexWithOffsets = (_b = lastObj === null || lastObj === void 0 ? void 0 : lastObj.comboIndexWithOffsets) !== null && _b !== void 0 ? _b : 0;
      obj.currentComboIndex = ((_c = lastObj === null || lastObj === void 0 ? void 0 : lastObj.currentComboIndex) !== null && _c !== void 0 ? _c : -1) + 1;

      if (obj.isNewCombo) {
        obj.currentComboIndex = 0;
        obj.comboIndex++;
        obj.comboIndexWithOffsets += obj.comboOffset + 1;

        if (lastObj !== null) {
          lastObj.lastInCombo = true;
        }
      }

      lastObj = obj;
    }

    return beatmap;
  }
  postProcess(beatmap) {
    return beatmap;
  }
}

let EffectType;

(function (EffectType) {
  EffectType[EffectType['None'] = 0] = 'None';
  EffectType[EffectType['Kiai'] = 1] = 'Kiai';
  EffectType[EffectType['OmitFirstBarLine'] = 8] = 'OmitFirstBarLine';
})(EffectType || (EffectType = {}));

class BeatmapBreakEvent {
  constructor(startTime, endTime) {
    this.startTime = startTime;
    this.endTime = endTime;
  }
  get duration() {
    return this.endTime - this.startTime;
  }
  get hasEffect() {
    return this.duration >= 650;
  }
  contains(time) {
    return this.startTime <= time && time <= this.endTime;
  }
}

class ProgressiveCalculationBeatmap {
  constructor(baseBeatmap) {
    this.hitObjects = [];
    this._baseBeatmap = baseBeatmap;
  }
  get general() {
    return this._baseBeatmap.general;
  }
  set general(value) {
    this._baseBeatmap.general = value;
  }
  get editor() {
    return this._baseBeatmap.editor;
  }
  set editor(value) {
    this._baseBeatmap.editor = value;
  }
  get difficulty() {
    return this._baseBeatmap.difficulty;
  }
  set difficulty(value) {
    this._baseBeatmap.difficulty = value;
  }
  get metadata() {
    return this._baseBeatmap.metadata;
  }
  set metadata(value) {
    this._baseBeatmap.metadata = value;
  }
  get colors() {
    return this._baseBeatmap.colors;
  }
  set colors(value) {
    this._baseBeatmap.colors = value;
  }
  get events() {
    return this._baseBeatmap.events;
  }
  set events(value) {
    this._baseBeatmap.events = value;
  }
  get controlPoints() {
    return this._baseBeatmap.controlPoints;
  }
  set controlPoints(value) {
    this._baseBeatmap.controlPoints = value;
  }
  get mode() {
    return this._baseBeatmap.mode;
  }
  get originalMode() {
    return this._baseBeatmap.originalMode;
  }
  get fileFormat() {
    return this._baseBeatmap.fileFormat;
  }
  get length() {
    return this._baseBeatmap.length;
  }
  get bpmMin() {
    return this._baseBeatmap.bpmMin;
  }
  get bpmMax() {
    return this._baseBeatmap.bpmMax;
  }
  get bpm() {
    return this._baseBeatmap.bpm;
  }
  get totalBreakTime() {
    return this._baseBeatmap.totalBreakTime;
  }
  clone() {
    return new ProgressiveCalculationBeatmap(this._baseBeatmap);
  }
}

class RulesetBeatmap extends Beatmap {
  clone() {
    const cloned = super.clone();

    cloned.mods = this.mods.clone();

    return cloned;
  }
}

class DifficultyAttributes {
  constructor(mods, starRating) {
    this.maxCombo = 0;
    this.mods = mods;
    this.starRating = starRating;
  }
}

class PerformanceAttributes {
  constructor(mods, totalPerformance) {
    this.mods = mods;
    this.totalPerformance = totalPerformance;
  }
}

class TimedDifficultyAttributes {
  constructor(time, attributes) {
    this.time = time;
    this.attributes = attributes;
  }
  compareTo(other) {
    if (this.time < other.time) {
      return -1;
    }

    if (this.time > other.time) {
      return 1;
    }

    if (this.time === other.time) {
      return 0;
    }

    if (!Number.isFinite(this.time)) {
      return (!Number.isFinite(other.time) ? 0 : -1);
    }

    return 1;
  }
}

class DifficultyCalculator {
  constructor(beatmap, ruleset) {
    let _a;

    this._beatmap = beatmap;
    this._ruleset = ruleset;
    this._mods = (_a = beatmap === null || beatmap === void 0 ? void 0 : beatmap.mods) !== null && _a !== void 0 ? _a : this._ruleset.createModCombination();
  }
  calculate(clockRate) {
    return this.calculateWithMods(this._mods, clockRate);
  }
  *calculateAll(clockRate) {
    for (const combination of this._createDifficultyModCombinations()) {
      yield this.calculateWithMods(combination, clockRate);
    }
  }
  calculateWithMods(mods, clockRate) {
    const beatmap = this._getWorkingBeatmap(mods);

    clockRate !== null && clockRate !== void 0 ? clockRate : (clockRate = beatmap.difficulty.clockRate);

    const skills = this._createSkills(beatmap, mods, clockRate);

    if (!beatmap.hitObjects.length) {
      return this._createDifficultyAttributes(beatmap, mods, skills, clockRate);
    }

    for (const hitObject of this._getDifficultyHitObjects(beatmap, clockRate)) {
      for (const skill of skills) {
        skill.process(hitObject);
      }
    }

    return this._createDifficultyAttributes(beatmap, mods, skills, clockRate);
  }
  calculateAt(objectCount, clockRate) {
    return this.calculateWithModsAt(this._mods, objectCount, clockRate);
  }
  calculateWithModsAt(mods, objectCount, clockRate) {
    if (!objectCount) {
      return this.calculateWithMods(mods);
    }

    const beatmap = this._getWorkingBeatmap(mods);

    clockRate !== null && clockRate !== void 0 ? clockRate : (clockRate = beatmap.difficulty.clockRate);

    const skills = this._createSkills(beatmap, mods, clockRate);

    if (!beatmap.hitObjects.length || objectCount <= 0) {
      return this._createDifficultyAttributes(beatmap, mods, skills, clockRate);
    }

    const progressiveBeatmap = new ProgressiveCalculationBeatmap(beatmap);

    progressiveBeatmap.hitObjects = beatmap.hitObjects.slice(0, objectCount);

    for (const hitObject of this._getDifficultyHitObjects(progressiveBeatmap, clockRate)) {
      for (const skill of skills) {
        skill.process(hitObject);
      }
    }

    return this._createDifficultyAttributes(progressiveBeatmap, mods, skills, clockRate);
  }
  calculateTimed(clockRate) {
    return this.calculateTimedWithMods(this._mods, clockRate);
  }
  *calculateTimedWithMods(mods, clockRate) {
    const beatmap = this._getWorkingBeatmap(mods);

    if (!beatmap.hitObjects.length) {
      return;
    }

    clockRate !== null && clockRate !== void 0 ? clockRate : (clockRate = beatmap.difficulty.clockRate);

    const skills = this._createSkills(beatmap, mods, clockRate);
    const progressiveBeatmap = new ProgressiveCalculationBeatmap(beatmap);

    for (const hitObject of this._getDifficultyHitObjects(beatmap, clockRate)) {
      progressiveBeatmap.hitObjects.push(hitObject.baseObject);

      for (const skill of skills) {
        skill.process(hitObject);
      }

      const time = hitObject.endTime * clockRate;
      const atts = this._createDifficultyAttributes(progressiveBeatmap, mods, skills, clockRate);

      yield new TimedDifficultyAttributes(time, atts);
    }
  }
  _getWorkingBeatmap(mods) {
    let _a, _b, _c;
    const rulesetBeatmap = this._beatmap;
    const sameRuleset = this._beatmap.mode === this._ruleset.id;
    const sameMods = (_b = (_a = rulesetBeatmap.mods) === null || _a === void 0 ? void 0 : _a.equals(mods)) !== null && _b !== void 0 ? _b : false;

    if (sameRuleset && sameMods) {
      return rulesetBeatmap;
    }

    const original = (_c = this._beatmap.base) !== null && _c !== void 0 ? _c : this._beatmap;

    return this._ruleset.applyToBeatmapWithMods(original, mods);
  }
  _getDifficultyHitObjects(beatmap, clockRate) {
    return this._sortObjects(this._createDifficultyHitObjects(beatmap, clockRate));
  }
  _sortObjects(input) {
    return input.sort((a, b) => a.startTime - b.startTime);
  }
  _createDifficultyModCombinations() {
    const ruleset = this._ruleset;

    function* createModCombinations(remainingMods, currentSet) {
      const bitwise = currentSet.reduce((p, c) => p + c.bitwise, 0);

      yield ruleset.createModCombination(bitwise);

      for (let i = 0; i < remainingMods.length; ++i) {
        const nextMod = remainingMods[i];

        if (currentSet.find((m) => m.incompatibles & nextMod.bitwise)) {
          continue;
        }

        if (currentSet.find((m) => m.bitwise & nextMod.bitwise)) {
          continue;
        }

        const nextRemaining = remainingMods.slice(i + 1);
        const nextSet = [...currentSet, nextMod];
        const combinations = createModCombinations(nextRemaining, nextSet);

        for (const combination of combinations) {
          yield combination;
        }
      }
    }

    return createModCombinations(this.difficultyMods, []);
  }
  get difficultyMods() {
    return [];
  }
}

class PerformanceCalculator {
  constructor(ruleset, attributes, score) {
    this._ruleset = ruleset;
    this._score = score;
    this.attributes = attributes;
  }
  calculate(attributes, score) {
    return this.calculateAttributes(attributes, score).totalPerformance;
  }
}

class DifficultyHitObject {
  constructor(hitObject, lastObject, clockRate, objects, index) {
    let _a;

    this._difficultyHitObjects = objects;
    this.index = index;
    this.baseObject = hitObject;
    this.lastObject = lastObject;
    this.deltaTime = (hitObject.startTime - lastObject.startTime) / clockRate;
    this.startTime = hitObject.startTime / clockRate;

    const durationObj = hitObject;

    this.endTime = ((_a = durationObj === null || durationObj === void 0 ? void 0 : durationObj.endTime) !== null && _a !== void 0 ? _a : hitObject.startTime) / clockRate;
  }
  previous(backwardsIndex) {
    let _a;
    const index = this.index - (backwardsIndex + 1);

    return (_a = this._difficultyHitObjects[index]) !== null && _a !== void 0 ? _a : null;
  }
  next(forwardsIndex) {
    let _a;
    const index = this.index + (forwardsIndex + 1);

    return (_a = this._difficultyHitObjects[index]) !== null && _a !== void 0 ? _a : null;
  }
}

class Skill {
  constructor(mods) {
    this._mods = mods;
  }
}

class StrainSkill extends Skill {
  constructor() {
    super(...arguments);
    this._decayWeight = 0.9;
    this._sectionLength = 400;
    this._currentSectionPeak = 0;
    this._currentSectionEnd = 0;
    this._strainPeaks = [];
  }
  process(current) {
    if (current.index === 0) {
      this._currentSectionEnd = Math.ceil(current.startTime / this._sectionLength);
      this._currentSectionEnd *= this._sectionLength;
    }

    while (current.startTime > this._currentSectionEnd) {
      this._saveCurrentPeak();
      this._startNewSectionFrom(this._currentSectionEnd, current);
      this._currentSectionEnd += this._sectionLength;
    }

    this._currentSectionPeak = Math.max(this._strainValueAt(current), this._currentSectionPeak);
  }
  _saveCurrentPeak() {
    this._strainPeaks.push(this._currentSectionPeak);
  }
  _startNewSectionFrom(time, current) {
    this._currentSectionPeak = this._calculateInitialStrain(time, current);
  }
  *getCurrentStrainPeaks() {
    for (const peak of this._strainPeaks) {
      yield peak;
    }

    yield this._currentSectionPeak;
  }
  get difficultyValue() {
    let difficulty = 0;
    let weight = 1;
    const peaks = [...this.getCurrentStrainPeaks()].filter((p) => p > 0);

    peaks.sort((a, b) => b - a);

    for (const strain of peaks) {
      difficulty += strain * weight;
      weight *= this._decayWeight;
    }

    return difficulty;
  }
}

class StrainDecaySkill extends StrainSkill {
  constructor() {
    super(...arguments);
    this._currentStrain = 0;
  }
  _calculateInitialStrain(time, current) {
    let _a, _b;
    const previousTime = (_b = (_a = current.previous(0)) === null || _a === void 0 ? void 0 : _a.startTime) !== null && _b !== void 0 ? _b : 0;
    const strainDecay = this._strainDecay(time - previousTime);

    return this._currentStrain * strainDecay;
  }
  _strainValueAt(current) {
    this._currentStrain *= this._strainDecay(current.deltaTime);
    this._currentStrain += this._strainValueOf(current) * this._skillMultiplier;

    return this._currentStrain;
  }
  _strainDecay(ms) {
    return Math.pow(this._strainDecayBase, ms / 1000);
  }
}

class LimitedCapacityQueue {
  constructor(capacity) {
    this.count = 0;
    this._start = 0;
    this._end = -1;

    if (capacity < 0) {
      throw new Error('Capacity of the limited queue must be greater than 0!');
    }

    this._capacity = capacity;
    this._array = [];
    this.clear();
  }
  get full() {
    return this.count === this._capacity;
  }
  clear() {
    this._start = 0;
    this._end = -1;
    this.count = 0;
  }
  dequeue() {
    if (this.count === 0) {
      throw new Error('Queue is empty!');
    }

    const result = this._array[this._start];

    this._start = (this._start + 1) % this._capacity;
    this.count--;

    return result;
  }
  enqueue(item) {
    this._end = (this._end + 1) % this._capacity;

    if (this.count === this._capacity) {
      this._start = (this._start + 1) % this._capacity;
    }
    else {
      this.count++;
    }

    this._array[this._end] = item;
  }
  get(index) {
    if (index < 0 || index >= this.count) {
      throw new Error('Index is out of range!');
    }

    return this._array[(this._start + index) % this._capacity];
  }
  *enumerate() {
    if (this.count === 0) {
      return;
    }

    for (let i = 0; i < this.count; ++i) {
      yield this._array[(this._start + i) % this._capacity];
    }
  }
}

class ReverseQueue {
  constructor(initialCapacity) {
    this.count = 0;

    if (initialCapacity <= 0) {
      throw new Error('Capacity of the reverse queue must be greater than 0!');
    }

    this._items = [];
    this._capacity = initialCapacity;
    this._start = 0;
  }
  get(index) {
    if (index < 0 || index > this.count - 1) {
      throw new Error('Index is out of range!');
    }

    const reverseIndex = this.count - 1 - index;

    return this._items[(this._start + reverseIndex) % this._capacity];
  }
  enqueue(item) {
    if (this.count === this._capacity) {
      this._capacity *= 2;
      this._start = 0;
    }

    this._items[(this._start + this.count) % this._capacity] = item;
    this.count++;
  }
  dequeue() {
    const item = this._items[this._start];

    this._start = (this._start + 1) % this._capacity;
    this.count--;

    return item;
  }
  clear() {
    this._start = 0;
    this.count = 0;
  }
  *enumerate() {
    if (this.count === 0) {
      return;
    }

    for (let i = this.count; i >= this._start; --i) {
      yield this._items[i];
    }
  }
}

let ModBitwise;

(function (ModBitwise) {
  ModBitwise[ModBitwise['None'] = 0] = 'None';
  ModBitwise[ModBitwise['NoFail'] = 1] = 'NoFail';
  ModBitwise[ModBitwise['Easy'] = 2] = 'Easy';
  ModBitwise[ModBitwise['TouchDevice'] = 4] = 'TouchDevice';
  ModBitwise[ModBitwise['Hidden'] = 8] = 'Hidden';
  ModBitwise[ModBitwise['HardRock'] = 16] = 'HardRock';
  ModBitwise[ModBitwise['SuddenDeath'] = 32] = 'SuddenDeath';
  ModBitwise[ModBitwise['DoubleTime'] = 64] = 'DoubleTime';
  ModBitwise[ModBitwise['Relax'] = 128] = 'Relax';
  ModBitwise[ModBitwise['HalfTime'] = 256] = 'HalfTime';
  ModBitwise[ModBitwise['Nightcore'] = 512] = 'Nightcore';
  ModBitwise[ModBitwise['Flashlight'] = 1024] = 'Flashlight';
  ModBitwise[ModBitwise['Autoplay'] = 2048] = 'Autoplay';
  ModBitwise[ModBitwise['SpunOut'] = 4096] = 'SpunOut';
  ModBitwise[ModBitwise['Relax2'] = 8192] = 'Relax2';
  ModBitwise[ModBitwise['Perfect'] = 16384] = 'Perfect';
  ModBitwise[ModBitwise['Key4'] = 32768] = 'Key4';
  ModBitwise[ModBitwise['Key5'] = 65536] = 'Key5';
  ModBitwise[ModBitwise['Key6'] = 131072] = 'Key6';
  ModBitwise[ModBitwise['Key7'] = 262144] = 'Key7';
  ModBitwise[ModBitwise['Key8'] = 524288] = 'Key8';
  ModBitwise[ModBitwise['FadeIn'] = 1048576] = 'FadeIn';
  ModBitwise[ModBitwise['Random'] = 2097152] = 'Random';
  ModBitwise[ModBitwise['Cinema'] = 4194304] = 'Cinema';
  ModBitwise[ModBitwise['Target'] = 8388608] = 'Target';
  ModBitwise[ModBitwise['Key9'] = 16777216] = 'Key9';
  ModBitwise[ModBitwise['KeyCoop'] = 33554432] = 'KeyCoop';
  ModBitwise[ModBitwise['Key1'] = 67108864] = 'Key1';
  ModBitwise[ModBitwise['Key3'] = 134217728] = 'Key3';
  ModBitwise[ModBitwise['Key2'] = 268435456] = 'Key2';
  ModBitwise[ModBitwise['ScoreV2'] = 536870912] = 'ScoreV2';
  ModBitwise[ModBitwise['Mirror'] = 1073741824] = 'Mirror';
  ModBitwise[ModBitwise['KeyMod'] = 487555072] = 'KeyMod';
  ModBitwise[ModBitwise['DifficultyDecrease'] = 258] = 'DifficultyDecrease';
  ModBitwise[ModBitwise['DifficultyIncrease'] = 1616] = 'DifficultyIncrease';
})(ModBitwise || (ModBitwise = {}));

let ModType;

(function (ModType) {
  ModType[ModType['DifficultyReduction'] = 0] = 'DifficultyReduction';
  ModType[ModType['DifficultyIncrease'] = 1] = 'DifficultyIncrease';
  ModType[ModType['Conversion'] = 2] = 'Conversion';
  ModType[ModType['Automation'] = 3] = 'Automation';
  ModType[ModType['Fun'] = 4] = 'Fun';
  ModType[ModType['System'] = 5] = 'System';
})(ModType || (ModType = {}));

class Autoplay {
  constructor() {
    this.name = 'Autoplay';
    this.acronym = 'AT';
    this.bitwise = ModBitwise.Autoplay;
    this.type = ModType.Automation;
    this.multiplier = 1;
    this.isRanked = false;
    this.incompatibles = ModBitwise.NoFail |
      ModBitwise.SuddenDeath |
      ModBitwise.Perfect |
      ModBitwise.Relax |
      ModBitwise.Relax2 |
      ModBitwise.SpunOut |
      ModBitwise.Cinema;
  }
}

class Cinema {
  constructor() {
    this.name = 'Cinema';
    this.acronym = 'CN';
    this.bitwise = ModBitwise.Cinema;
    this.type = ModType.Fun;
    this.multiplier = 1;
    this.isRanked = false;
    this.incompatibles = ModBitwise.NoFail |
      ModBitwise.SuddenDeath |
      ModBitwise.Perfect |
      ModBitwise.Relax |
      ModBitwise.Relax2 |
      ModBitwise.SpunOut |
      ModBitwise.Autoplay;
  }
}

class DoubleTime {
  constructor() {
    this.name = 'Double Time';
    this.acronym = 'DT';
    this.bitwise = ModBitwise.DoubleTime;
    this.type = ModType.DifficultyIncrease;
    this.multiplier = 1.12;
    this.isRanked = true;
    this.incompatibles = ModBitwise.HalfTime | ModBitwise.Nightcore;
  }
  applyToDifficulty(difficulty) {
    difficulty.clockRate = 1.5;
  }
}

class Easy {
  constructor() {
    this.name = 'Easy';
    this.acronym = 'EZ';
    this.bitwise = ModBitwise.Easy;
    this.type = ModType.DifficultyReduction;
    this.multiplier = 0.5;
    this.isRanked = true;
    this.incompatibles = ModBitwise.HardRock;
  }
  applyToDifficulty(difficulty) {
    difficulty.circleSize = Math.fround(difficulty.circleSize * 0.5);
    difficulty.approachRate = Math.fround(difficulty.approachRate * 0.5);
    difficulty.drainRate = Math.fround(difficulty.drainRate * 0.5);
    difficulty.overallDifficulty = Math.fround(difficulty.overallDifficulty * 0.5);
  }
}

class Flashlight {
  constructor() {
    this.name = 'Flashlight';
    this.acronym = 'FL';
    this.bitwise = ModBitwise.Flashlight;
    this.type = ModType.DifficultyIncrease;
    this.multiplier = 1.12;
    this.isRanked = true;
    this.incompatibles = ModBitwise.None;
  }
}

class HalfTime {
  constructor() {
    this.name = 'Half Time';
    this.acronym = 'HT';
    this.bitwise = ModBitwise.HalfTime;
    this.type = ModType.DifficultyReduction;
    this.multiplier = 0.3;
    this.isRanked = true;
    this.incompatibles = ModBitwise.DoubleTime | ModBitwise.Nightcore;
  }
  applyToDifficulty(difficulty) {
    difficulty.clockRate = 0.75;
  }
}

class HardRock {
  constructor() {
    this.name = 'Hard Rock';
    this.acronym = 'HR';
    this.bitwise = ModBitwise.HardRock;
    this.type = ModType.DifficultyIncrease;
    this.multiplier = 1.06;
    this.isRanked = true;
    this.incompatibles = ModBitwise.Easy;
  }
  applyToDifficulty(difficulty) {
    const ratio = Math.fround(1.4);
    const circleSize = Math.fround(difficulty.circleSize * Math.fround(1.3));
    const approachRate = Math.fround(difficulty.approachRate * ratio);
    const drainRate = Math.fround(difficulty.drainRate * ratio);
    const overallDifficulty = Math.fround(difficulty.overallDifficulty * ratio);

    difficulty.circleSize = Math.min(circleSize, 10);
    difficulty.approachRate = Math.min(approachRate, 10);
    difficulty.drainRate = Math.min(drainRate, 10);
    difficulty.overallDifficulty = Math.min(overallDifficulty, 10);
  }
}

class Hidden {
  constructor() {
    this.name = 'Hidden';
    this.acronym = 'HD';
    this.bitwise = ModBitwise.Hidden;
    this.type = ModType.DifficultyIncrease;
    this.multiplier = 1.06;
    this.isRanked = true;
    this.incompatibles = ModBitwise.None;
  }
}

class Nightcore extends DoubleTime {
  constructor() {
    super(...arguments);
    this.name = 'Nightcore';
    this.acronym = 'NC';
    this.bitwise = ModBitwise.Nightcore;
    this.incompatibles = ModBitwise.HalfTime | ModBitwise.DoubleTime;
  }
}

class NoFail {
  constructor() {
    this.name = 'No Fail';
    this.acronym = 'NF';
    this.bitwise = ModBitwise.NoFail;
    this.type = ModType.DifficultyReduction;
    this.multiplier = 0.5;
    this.isRanked = true;
    this.incompatibles = ModBitwise.SuddenDeath |
      ModBitwise.Perfect |
      ModBitwise.Autoplay |
      ModBitwise.Cinema |
      ModBitwise.Relax |
      ModBitwise.Relax2;
  }
}

class NoMod {
  constructor() {
    this.name = 'No Mod';
    this.acronym = 'NM';
    this.bitwise = ModBitwise.None;
    this.type = ModType.System;
    this.multiplier = 1;
    this.isRanked = true;
    this.incompatibles = ModBitwise.None;
  }
}

class Perfect {
  constructor() {
    this.name = 'Perfect';
    this.acronym = 'PF';
    this.bitwise = ModBitwise.Perfect;
    this.type = ModType.DifficultyIncrease;
    this.multiplier = 1;
    this.isRanked = true;
    this.incompatibles = ModBitwise.NoFail |
      ModBitwise.SuddenDeath |
      ModBitwise.Autoplay |
      ModBitwise.Cinema |
      ModBitwise.Relax |
      ModBitwise.Relax2;
  }
}

class Relax {
  constructor() {
    this.name = 'Relax';
    this.acronym = 'RX';
    this.bitwise = ModBitwise.Relax;
    this.type = ModType.Automation;
    this.multiplier = 1;
    this.isRanked = false;
    this.incompatibles = ModBitwise.NoFail |
      ModBitwise.SuddenDeath |
      ModBitwise.Perfect |
      ModBitwise.Autoplay |
      ModBitwise.Cinema |
      ModBitwise.Relax2;
  }
}

class SuddenDeath {
  constructor() {
    this.name = 'Sudden Death';
    this.acronym = 'SD';
    this.bitwise = ModBitwise.SuddenDeath;
    this.type = ModType.DifficultyIncrease;
    this.multiplier = 1;
    this.isRanked = true;
    this.incompatibles = ModBitwise.NoFail |
      ModBitwise.Perfect |
      ModBitwise.Autoplay |
      ModBitwise.Cinema |
      ModBitwise.Relax |
      ModBitwise.Relax2;
  }
}

class ModCombination {
  constructor(input) {
    this._mods = [];

    const available = this._availableMods;

    if (typeof input === 'number' || typeof input === 'string') {
      let bitwise = this.toBitwise(input);
      let mask = 1 << 30;

      while (mask > 0) {
        const found = available.find((m) => m.bitwise & bitwise & mask);

        if (found && !(this.bitwise & found.incompatibles)) {
          this._mods.push(found);
        }

        bitwise &= ~mask;
        mask >>= 1;
      }
    }

    if (!this._mods.length) {
      const noMod = available.find((m) => m.bitwise === 0);

      if (noMod) {
        this._mods.push(noMod);
      }
    }

    this._mods.sort((a, b) => a.bitwise - b.bitwise);
  }
  get all() {
    return this._mods;
  }
  get beatmapMods() {
    const mods = this.all;

    return mods.filter((m) => m.applyToBeatmap);
  }
  get hitObjectMods() {
    const mods = this.all;

    return mods.filter((m) => m.applyToHitObjects);
  }
  get difficultyMods() {
    const mods = this.all;

    return mods.filter((m) => m.applyToDifficulty);
  }
  get converterMods() {
    const mods = this.all;

    return mods.filter((m) => m.applyToConverter);
  }
  get names() {
    return this.all.map((m) => m.name);
  }
  get acronyms() {
    return this.all.map((m) => m.acronym);
  }
  get bitwise() {
    return this.all.reduce((bitwise, mod) => {
      bitwise |= mod.bitwise;

      if (mod.bitwise === ModBitwise.Nightcore) {
        bitwise |= ModBitwise.DoubleTime;
      }

      if (mod.bitwise === ModBitwise.Perfect) {
        bitwise |= ModBitwise.SuddenDeath;
      }

      return bitwise;
    }, 0);
  }
  get multiplier() {
    return this.all.reduce((mp, m) => mp * m.multiplier, 1);
  }
  get isRanked() {
    return this.all.reduce((r, m) => r && m.isRanked, true);
  }
  get incompatibles() {
    return this.all.reduce((b, m) => b | m.incompatibles, 0);
  }
  has(input) {
    const bitwise = this.toBitwise(input);

    return (this.bitwise & bitwise) === bitwise || this.bitwise === bitwise;
  }
  any(Mod) {
    return this._mods.some((mod) => mod instanceof Mod);
  }
  beatmapModsAt(input) {
    const bitwise = this.toBitwise(input);
    const mods = this.all;

    return mods.filter((m) => m.bitwise & bitwise && m.applyToBeatmap);
  }
  beatmapModAt(input) {
    const bitwise = this.toBitwise(input);

    return this.beatmapModsAt(bitwise)[0] || null;
  }
  hitObjectModsAt(input) {
    const bitwise = this.toBitwise(input);
    const mods = this.all;

    return mods.filter((m) => m.bitwise & bitwise && m.applyToHitObjects);
  }
  hitObjectModAt(input) {
    const bitwise = this.toBitwise(input);

    return this.hitObjectModsAt(bitwise)[0] || null;
  }
  difficultyModsAt(input) {
    const bitwise = this.toBitwise(input);
    const mods = this.all;

    return mods.filter((m) => m.bitwise & bitwise && m.applyToDifficulty);
  }
  difficultyModAt(input) {
    const bitwise = this.toBitwise(input);

    return this.difficultyModsAt(bitwise)[0] || null;
  }
  converterModsAt(input) {
    const bitwise = this.toBitwise(input);
    const mods = this.all;

    return mods.filter((m) => m.bitwise & bitwise && m.applyToConverter);
  }
  converterModAt(input) {
    const bitwise = this.toBitwise(input);

    return this.converterModsAt(bitwise)[0] || null;
  }
  modsAt(input) {
    const bitwise = this.toBitwise(input);

    return this.all.filter((m) => m.bitwise & bitwise);
  }
  modAt(input) {
    const bitwise = this.toBitwise(input);

    return this.modsAt(bitwise)[0] || null;
  }
  toString() {
    return this.acronyms.join('');
  }
  toJSON() {
    return this.toString();
  }
  toBitwise(input) {
    let _a, _b;

    if (typeof input === 'number') {
      return Math.max(0, input);
    }

    if (typeof input !== 'string' || !input) {
      return 0;
    }

    if (input.length % 2) {
      return 0;
    }

    const acronyms = (_b = (_a = input.match(/.{1,2}/g)) === null || _a === void 0 ? void 0 : _a.map((a) => a.toUpperCase())) !== null && _b !== void 0 ? _b : [];

    return acronyms.reduce((bitwise, acronym) => {
      let _a;
      const found = this._availableMods.find((m) => m.acronym === acronym);

      return bitwise | ((_a = found === null || found === void 0 ? void 0 : found.bitwise) !== null && _a !== void 0 ? _a : 0);
    }, 0);
  }
  clone() {
    const ModCombination = this.constructor;

    return new ModCombination(this.bitwise);
  }
  equals(other) {
    return this.bitwise === other.bitwise && this.mode === other.mode;
  }
  get _availableMods() {
    return [];
  }
}

let ReplayButtonState;

(function (ReplayButtonState) {
  ReplayButtonState[ReplayButtonState['None'] = 0] = 'None';
  ReplayButtonState[ReplayButtonState['Left1'] = 1] = 'Left1';
  ReplayButtonState[ReplayButtonState['Right1'] = 2] = 'Right1';
  ReplayButtonState[ReplayButtonState['Left2'] = 4] = 'Left2';
  ReplayButtonState[ReplayButtonState['Right2'] = 8] = 'Right2';
  ReplayButtonState[ReplayButtonState['Smoke'] = 16] = 'Smoke';
})(ReplayButtonState || (ReplayButtonState = {}));

class ReplayFrame {
  constructor(startTime, interval) {
    this.startTime = startTime !== null && startTime !== void 0 ? startTime : 0;
    this.interval = interval !== null && interval !== void 0 ? interval : 0;
  }
  clone() {
    const ReplayFrame = this.constructor;
    const cloned = new ReplayFrame();

    cloned.startTime = this.startTime;
    cloned.interval = this.interval;

    return cloned;
  }
}

class LegacyReplayFrame extends ReplayFrame {
  constructor(startTime, interval, position, buttonState) {
    super(startTime, interval);
    this.position = position !== null && position !== void 0 ? position : new Vector2(0, 0);
    this.buttonState = buttonState !== null && buttonState !== void 0 ? buttonState : ReplayButtonState.None;
  }
  get mouseX() {
    return this.position.x;
  }
  get mouseY() {
    return this.position.y;
  }
  get mousePosition() {
    let _a, _b;

    return new Vector2((_a = this.mouseX) !== null && _a !== void 0 ? _a : 0, (_b = this.mouseY) !== null && _b !== void 0 ? _b : 0);
  }
  get mouseLeft() {
    return this.mouseLeft1 || this.mouseLeft2;
  }
  get mouseRight() {
    return this.mouseRight1 || this.mouseRight2;
  }
  get mouseLeft1() {
    return (this.buttonState & ReplayButtonState.Left1) > 0;
  }
  get mouseRight1() {
    return (this.buttonState & ReplayButtonState.Right1) > 0;
  }
  get mouseLeft2() {
    return (this.buttonState & ReplayButtonState.Left2) > 0;
  }
  get mouseRight2() {
    return (this.buttonState & ReplayButtonState.Right2) > 0;
  }
  get smoke() {
    return (this.buttonState & ReplayButtonState.Smoke) > 0;
  }
  clone() {
    const cloned = super.clone();

    cloned.buttonState = this.buttonState;
    cloned.position = this.position.clone();

    return cloned;
  }
}

class LifeBarFrame {
  constructor(startTime, health) {
    this.startTime = startTime !== null && startTime !== void 0 ? startTime : 0;
    this.health = health !== null && health !== void 0 ? health : 0;
  }
  clone() {
    const LifeBarFrame = this.constructor;
    const cloned = new LifeBarFrame();

    cloned.startTime = this.startTime;
    cloned.health = this.health;

    return cloned;
  }
}

class Replay {
  constructor() {
    this.gameVersion = 0;
    this.mode = 0;
    this.hashMD5 = '';
    this.frames = [];
    this.lifeBar = [];
  }
  get length() {
    let _a;

    if (!((_a = this.frames) === null || _a === void 0 ? void 0 : _a.length)) {
      return 0;
    }

    const startTime = this.frames[0].startTime;
    const endTime = this.frames[this.frames.length - 1].startTime;

    return endTime - startTime;
  }
  clone() {
    const Replay = this.constructor;
    const cloned = new Replay();

    cloned.gameVersion = this.gameVersion;
    cloned.mode = this.mode;
    cloned.hashMD5 = this.hashMD5;
    cloned.frames = this.frames.map((f) => f.clone());

    return cloned;
  }
  equals(other) {
    return this.hashMD5 === other.hashMD5;
  }
}

class ReplayConverter {
  convertReplay(original, beatmap) {
    const converted = this.createReplay();

    converted.gameVersion = original.gameVersion;
    converted.mode = original.mode;
    converted.hashMD5 = original.hashMD5;
    converted.lifeBar = original.lifeBar;

    for (const frame of this.convertFrames(original.frames, beatmap)) {
      converted.frames.push(frame);
    }

    return converted;
  }
  createReplay() {
    return new Replay();
  }
  *convertFrames(frames, beatmap) {
    let lastFrame = null;

    for (const frame of frames) {
      const convertedFrame = this._convertFrame(frame, lastFrame, beatmap);

      yield convertedFrame;
      lastFrame = convertedFrame;
    }
  }
  _convertFrame(frame, lastFrame, beatmap) {
    if (this._isConvertedReplayFrame(frame)) {
      return frame;
    }

    const convertedFrame = this._createConvertibleReplayFrame();

    if (convertedFrame && frame instanceof LegacyReplayFrame) {
      return convertedFrame.fromLegacy(frame, lastFrame, beatmap);
    }

    throw new Error('Replay can not be converted to this ruleset!');
  }
}

class Ruleset {
  applyToBeatmap(beatmap) {
    const originalMods = beatmap.mods;
    const bitwise = originalMods ? originalMods.bitwise : 0;
    const mods = this.createModCombination(bitwise);

    return this.applyToBeatmapWithMods(beatmap, mods);
  }
  applyToBeatmapWithMods(beatmap, mods) {
    if (!mods) {
      mods = this.createModCombination(0);
    }

    if (this.id !== mods.mode) {
      mods = this.createModCombination(mods.bitwise);
    }

    const converter = this._createBeatmapConverter();

    if (beatmap.hitObjects.length > 0 && !converter.canConvert(beatmap)) {
      throw new Error('Beatmap can not be converted to this ruleset!');
    }

    mods.converterMods.forEach((m) => m.applyToConverter(converter));

    const converted = converter.convertBeatmap(beatmap);

    converted.mods = mods;
    mods.difficultyMods.forEach((m) => {
      m.applyToDifficulty(converted.difficulty);
    });

    const processor = this._createBeatmapProcessor();

    processor.preProcess(converted);
    converted.hitObjects.forEach((hitObject) => {
      hitObject.applyDefaults(converted.controlPoints, converted.difficulty);
    });

    mods.hitObjectMods.forEach((m) => {
      m.applyToHitObjects(converted.hitObjects);
    });

    processor.postProcess(converted);
    mods.beatmapMods.forEach((m) => m.applyToBeatmap(converted));

    return converted;
  }
  applyToReplay(replay, beatmap) {
    if (beatmap && replay.mode !== beatmap.mode) {
      throw new Error('Replay and beatmap mode does not match!');
    }

    const converter = this._createReplayConverter();

    return converter.convertReplay(replay, beatmap);
  }
  resetMods(beatmap) {
    const mods = this.createModCombination(0);

    return this.applyToBeatmapWithMods(beatmap, mods);
  }
}

let ScoreRank;

(function (ScoreRank) {
  ScoreRank[ScoreRank['F'] = -1] = 'F';
  ScoreRank[ScoreRank['D'] = 0] = 'D';
  ScoreRank[ScoreRank['C'] = 1] = 'C';
  ScoreRank[ScoreRank['B'] = 2] = 'B';
  ScoreRank[ScoreRank['A'] = 3] = 'A';
  ScoreRank[ScoreRank['S'] = 4] = 'S';
  ScoreRank[ScoreRank['SH'] = 5] = 'SH';
  ScoreRank[ScoreRank['X'] = 6] = 'X';
  ScoreRank[ScoreRank['XH'] = 7] = 'XH';
})(ScoreRank || (ScoreRank = {}));

class HitStatistics extends Map {
  get(key) {
    if (!super.has(key)) {
      super.set(key, 0);
    }

    return super.get(key);
  }
  toJSON() {
    const result = {};

    this.forEach((value, key) => {
      result[HitStatistics._getJsonableKeyFromHitResult(key)] = value;
    });

    return result;
  }
  static fromJSON(json) {
    const statistics = new HitStatistics();
    const entries = Object.entries(json);

    entries.forEach((entry) => {
      const key = entry[0];
      const value = entry[1];

      statistics.set(this._getHitResultFromJsonableKey(key), value);
    });

    return statistics;
  }
  static _getJsonableKeyFromHitResult(result) {
    switch (result) {
      case HitResult.None: return 'none';
      case HitResult.Miss: return 'miss';
      case HitResult.Meh: return 'meh';
      case HitResult.Ok: return 'ok';
      case HitResult.Good: return 'good';
      case HitResult.Great: return 'great';
      case HitResult.Perfect: return 'perfect';
      case HitResult.SmallTickMiss: return 'smallTickMiss';
      case HitResult.SmallTickHit: return 'smallTickHit';
      case HitResult.LargeTickMiss: return 'largeTickMiss';
      case HitResult.LargeTickHit: return 'largeTickHit';
      case HitResult.SmallBonus: return 'smallBonus';
      case HitResult.LargeBonus: return 'largeBonus';
      case HitResult.IgnoreMiss: return 'ignoreMiss';
      case HitResult.IgnoreHit: return 'ignoreHit';
    }
  }
  static _getHitResultFromJsonableKey(key) {
    switch (key) {
      case 'none': return HitResult.None;
      case 'miss': return HitResult.Miss;
      case 'meh': return HitResult.Meh;
      case 'ok': return HitResult.Ok;
      case 'good': return HitResult.Good;
      case 'great': return HitResult.Great;
      case 'perfect': return HitResult.Perfect;
      case 'smallTickMiss': return HitResult.SmallTickMiss;
      case 'smallTickHit': return HitResult.SmallTickHit;
      case 'largeTickMiss': return HitResult.LargeTickMiss;
      case 'largeTickHit': return HitResult.LargeTickHit;
      case 'smallBonus': return HitResult.SmallBonus;
      case 'largeBonus': return HitResult.LargeBonus;
      case 'ignoreMiss': return HitResult.IgnoreMiss;
      case 'ignoreHit': return HitResult.IgnoreHit;
    }
  }
}

class LegacyScoreExtensions {
  constructor() {
    this.statistics = new HitStatistics();
    this._legacyCountGeki = 0;
    this._legacyCountKatu = 0;
  }
  get countGeki() {
    if (this.rulesetId === 3) {
      return this.statistics.has(HitResult.Perfect)
        ? this.statistics.get(HitResult.Perfect)
        : this._legacyCountGeki;
    }

    return this._legacyCountGeki;
  }
  set countGeki(value) {
    if (!this.statistics) {
      return;
    }

    if (this.rulesetId === 3) {
      this.statistics.set(HitResult.Perfect, value);
    }

    this._legacyCountGeki = value;
  }
  get count300() {
    return this.statistics.get(HitResult.Great);
  }
  set count300(value) {
    if (!this.statistics) {
      return;
    }

    this.statistics.set(HitResult.Great, value);
  }
  get countKatu() {
    if (this.rulesetId === 2) {
      return this.statistics.has(HitResult.SmallTickMiss)
        ? this.statistics.get(HitResult.SmallTickMiss)
        : this._legacyCountKatu;
    }

    if (this.rulesetId === 3) {
      return this.statistics.has(HitResult.Good)
        ? this.statistics.get(HitResult.Good)
        : this._legacyCountKatu;
    }

    return this._legacyCountKatu;
  }
  set countKatu(value) {
    if (!this.statistics) {
      return;
    }

    if (this.rulesetId === 2) {
      this.statistics.set(HitResult.SmallTickMiss, value);
    }

    if (this.rulesetId === 3) {
      this.statistics.set(HitResult.Good, value);
    }

    this._legacyCountKatu = value;
  }
  get count100() {
    if (this.rulesetId === 2) {
      return this.statistics.get(HitResult.LargeTickHit);
    }

    return this.statistics.get(HitResult.Ok);
  }
  set count100(value) {
    if (!this.statistics) {
      return;
    }

    if (this.rulesetId === 2) {
      this.statistics.set(HitResult.LargeTickHit, value);
    }

    this.statistics.set(HitResult.Ok, value);
  }
  get count50() {
    if (this.rulesetId === 2) {
      return this.statistics.get(HitResult.SmallTickHit);
    }

    return this.statistics.get(HitResult.Meh);
  }
  set count50(value) {
    if (!this.statistics) {
      return;
    }

    if (this.rulesetId === 2) {
      this.statistics.set(HitResult.SmallTickHit, value);
    }

    this.statistics.set(HitResult.Meh, value);
  }
  get countMiss() {
    return this.statistics.get(HitResult.Miss);
  }
  set countMiss(value) {
    if (!this.statistics) {
      return;
    }

    this.statistics.set(HitResult.Miss, value);
  }
  get totalHits() {
    const geki = this.countGeki;
    const katu = this.countKatu;
    const n300 = this.count300;
    const n100 = this.count100;
    const n50 = this.count50;
    const miss = this.countMiss;

    switch (this.rulesetId) {
      case 0: return n300 + n100 + n50 + miss;
      case 1: return n300 + n100 + n50 + miss;
      case 2: return n300 + katu + n100 + n50 + miss;
      case 3: return geki + n300 + katu + n100 + n50 + miss;
    }

    return geki + n300 + katu + n100 + n50 + miss;
  }
}

function calculate$1(scoreInfo) {
  const geki = scoreInfo.countGeki;
  const katu = scoreInfo.countKatu;
  const n300 = scoreInfo.count300;
  const n100 = scoreInfo.count100;
  const n50 = scoreInfo.count50;
  const total = scoreInfo.totalHits;

  if (total <= 0) {
    return 1;
  }

  switch (scoreInfo.rulesetId) {
    case 0:
      return clamp01((n50 / 6 + n100 / 3 + n300) / total);
    case 1:
      return clamp01((n100 / 2 + n300) / total);
    case 2:
      return clamp01((n50 + n100 + n300) / total);
    case 3:
      return clamp01((n50 / 6 + n100 / 3 + katu / 1.5 + (n300 + geki)) / total);
  }

  return 1;
}

let Accuracy = /* #__PURE__*/Object.freeze({
  __proto__: null,
  calculate: calculate$1,
});

function calculate(scoreInfo) {
  if (!scoreInfo.passed) {
    return 'F';
  }

  switch (scoreInfo.rulesetId) {
    case 0: return calculateOsuRank(scoreInfo);
    case 1: return calculateTaikoRank(scoreInfo);
    case 2: return calculateCatchRank(scoreInfo);
    case 3: return calculateManiaRank(scoreInfo);
  }

  return 'F';
}

function calculateOsuRank(scoreInfo) {
  const { count300, count50, countMiss, totalHits } = scoreInfo;
  const ratio300 = Math.fround(count300 / totalHits);
  const ratio50 = Math.fround(count50 / totalHits);

  if (ratio300 === 1) {
    return shouldBeSilverRank(scoreInfo) ? 'XH' : 'X';
  }

  if (ratio300 > 0.9 && ratio50 <= 0.01 && countMiss === 0) {
    return shouldBeSilverRank(scoreInfo) ? 'SH' : 'S';
  }

  if ((ratio300 > 0.8 && countMiss === 0) || ratio300 > 0.9) {
    return 'A';
  }

  if ((ratio300 > 0.7 && countMiss === 0) || ratio300 > 0.8) {
    return 'B';
  }

  return ratio300 > 0.6 ? 'C' : 'D';
}

function calculateTaikoRank(scoreInfo) {
  const { count300, count50, countMiss, totalHits } = scoreInfo;
  const ratio300 = Math.fround(count300 / totalHits);
  const ratio50 = Math.fround(count50 / totalHits);

  if (ratio300 === 1) {
    return shouldBeSilverRank(scoreInfo) ? 'XH' : 'X';
  }

  if (ratio300 > 0.9 && ratio50 <= 0.01 && countMiss === 0) {
    return shouldBeSilverRank(scoreInfo) ? 'SH' : 'S';
  }

  if ((ratio300 > 0.8 && countMiss === 0) || ratio300 > 0.9) {
    return 'A';
  }

  if ((ratio300 > 0.7 && countMiss === 0) || ratio300 > 0.8) {
    return 'B';
  }

  return ratio300 > 0.6 ? 'C' : 'D';
}

function calculateCatchRank(scoreInfo) {
  const accuracy = scoreInfo.accuracy;

  if (accuracy === 1) {
    return shouldBeSilverRank(scoreInfo) ? 'XH' : 'X';
  }

  if (accuracy > 0.98) {
    return shouldBeSilverRank(scoreInfo) ? 'SH' : 'S';
  }

  if (accuracy > 0.94) {
    return 'A';
  }

  if (accuracy > 0.90) {
    return 'B';
  }

  if (accuracy > 0.85) {
    return 'C';
  }

  return 'D';
}

function calculateManiaRank(scoreInfo) {
  const accuracy = scoreInfo.accuracy;

  if (accuracy === 1) {
    return shouldBeSilverRank(scoreInfo) ? 'XH' : 'X';
  }

  if (accuracy > 0.95) {
    return shouldBeSilverRank(scoreInfo) ? 'SH' : 'S';
  }

  if (accuracy > 0.9) {
    return 'A';
  }

  if (accuracy > 0.8) {
    return 'B';
  }

  if (accuracy > 0.7) {
    return 'C';
  }

  return 'D';
}

function shouldBeSilverRank(scoreInfo) {
  let _a, _b;

  if (scoreInfo.mods) {
    return scoreInfo.mods.has('HD') || scoreInfo.mods.has('FL');
  }

  if (typeof scoreInfo.rawMods === 'number') {
    const hasHidden = (scoreInfo.rawMods & ModBitwise.Hidden) > 0;
    const hasFlashlight = (scoreInfo.rawMods & ModBitwise.Flashlight) > 0;

    return hasHidden || hasFlashlight;
  }

  if (typeof scoreInfo.rawMods === 'string') {
    const acronyms = (_b = (_a = scoreInfo.rawMods
      .match(/.{1,2}/g)) === null || _a === void 0 ? void 0 : _a.map((a) => a.toUpperCase())) !== null && _b !== void 0 ? _b : [];

    return acronyms.includes('HD') || acronyms.includes('FL');
  }

  return false;
}

let Rank = /* #__PURE__*/Object.freeze({
  __proto__: null,
  calculate,
});

class ScoreInfo extends LegacyScoreExtensions {
  get accuracy() {
    return calculate$1(this);
  }
  set accuracy(_) {
    return;
  }
  get rank() {
    return calculate(this);
  }
  set rank(value) {
    this.passed = value !== 'F';
  }
  get ruleset() {
    return this._ruleset;
  }
  set ruleset(value) {
    let _a, _b;

    this._ruleset = value;
    this._mods = (_b = (_a = this.ruleset) === null || _a === void 0 ? void 0 : _a.createModCombination(this.rawMods)) !== null && _b !== void 0 ? _b : null;
  }
  get rulesetId() {
    let _a, _b;

    return (_b = (_a = this.ruleset) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : this._rulesetId;
  }
  set rulesetId(value) {
    this._rulesetId = value;
  }
  get mods() {
    return this._mods;
  }
  set mods(value) {
    let _a;

    this._mods = value;
    this._rawMods = (_a = value === null || value === void 0 ? void 0 : value.bitwise) !== null && _a !== void 0 ? _a : 0;
  }
  get rawMods() {
    return this._rawMods;
  }
  set rawMods(value) {
    let _a, _b;

    if (this._rawMods === value) {
      return;
    }

    this._rawMods = value;
    this._mods = (_b = (_a = this.ruleset) === null || _a === void 0 ? void 0 : _a.createModCombination(value)) !== null && _b !== void 0 ? _b : null;
  }
  constructor(options = {}) {
    super();
    this.id = 0;
    this.totalScore = 0;
    this.totalPerformance = null;
    this.maxCombo = 0;
    this.passed = false;
    this.perfect = false;
    this._ruleset = null;
    this._rulesetId = 0;
    this._mods = null;
    this._rawMods = 0;
    this.username = '';
    this.userId = 0;
    this.beatmap = null;
    this.beatmapId = 0;
    this.date = new Date();
    this.beatmapHashMD5 = '';
    Object.assign(this, options);
  }
  clone() {
    const ScoreInfo = this.constructor;
    const cloned = new ScoreInfo();

    Object.assign(cloned, this);
    cloned.statistics = new HitStatistics(this.statistics);

    return cloned;
  }
  equals(other) {
    if (!other) {
      return false;
    }

    if (this.id !== 0 && other.id !== 0) {
      return this.id === other.id;
    }

    return false;
  }
  toJSON() {
    let _a, _b, _c, _d;
    const partial = {};
    const deselect = ['beatmap', 'ruleset', 'rawMods', 'mods'];

    for (const key in this) {
      if (key.startsWith('_')) {
        continue;
      }

      if (deselect.includes(key)) {
        continue;
      }

      partial[key] = this[key];
    }

    return {
      ...partial,
      statistics: this.statistics.toJSON(),
      beatmap: (_b = (_a = this.beatmap) === null || _a === void 0 ? void 0 : _a.toJSON()) !== null && _b !== void 0 ? _b : null,
      mods: (_d = (_c = this.mods) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : 'NM',
      date: this.date.getTime() / 1000,
      accuracy: this.accuracy,
      rank: this.rank,
      rulesetId: this.rulesetId,
      countGeki: this.countGeki,
      count300: this.count300,
      countKatu: this.countKatu,
      count100: this.count100,
      count50: this.count50,
      countMiss: this.countMiss,
      totalHits: this.totalHits,
    };
  }
  static fromJSON(json) {
    return new ScoreInfo({
      ...json,
      rawMods: json.mods,
      beatmap: json.beatmap ? BeatmapInfo.fromJSON(json.beatmap) : null,
      statistics: HitStatistics.fromJSON(json.statistics),
      date: new Date(json.date * 1000),
    });
  }
}

class Score {
  constructor(info, replay) {
    this.info = new ScoreInfo();
    this.replay = null;

    if (info) {
      this.info = info;
    }

    if (replay) {
      this.replay = replay;
    }
  }
  clone() {
    let _a, _b;
    const Score = this.constructor;
    const cloned = new Score();

    cloned.info = this.info.clone();
    cloned.replay = (_b = (_a = this.replay) === null || _a === void 0 ? void 0 : _a.clone()) !== null && _b !== void 0 ? _b : null;

    return cloned;
  }
  equals(other) {
    if (!other) {
      return false;
    }

    const equalScores = this.info.equals(other.info);

    if (this.replay === null && other.replay === null) {
      return equalScores;
    }

    if (this.replay !== null && other.replay !== null) {
      return equalScores && this.replay.equals(other.replay);
    }

    return false;
  }
}

let CountryCode;

(function (CountryCode) {
  CountryCode[CountryCode['Unknown'] = 0] = 'Unknown';
  CountryCode[CountryCode['BD'] = 1] = 'BD';
  CountryCode[CountryCode['BE'] = 2] = 'BE';
  CountryCode[CountryCode['BF'] = 3] = 'BF';
  CountryCode[CountryCode['BG'] = 4] = 'BG';
  CountryCode[CountryCode['BA'] = 5] = 'BA';
  CountryCode[CountryCode['BB'] = 6] = 'BB';
  CountryCode[CountryCode['WF'] = 7] = 'WF';
  CountryCode[CountryCode['BL'] = 8] = 'BL';
  CountryCode[CountryCode['BM'] = 9] = 'BM';
  CountryCode[CountryCode['BN'] = 10] = 'BN';
  CountryCode[CountryCode['BO'] = 11] = 'BO';
  CountryCode[CountryCode['BH'] = 12] = 'BH';
  CountryCode[CountryCode['BI'] = 13] = 'BI';
  CountryCode[CountryCode['BJ'] = 14] = 'BJ';
  CountryCode[CountryCode['BT'] = 15] = 'BT';
  CountryCode[CountryCode['JM'] = 16] = 'JM';
  CountryCode[CountryCode['BV'] = 17] = 'BV';
  CountryCode[CountryCode['BW'] = 18] = 'BW';
  CountryCode[CountryCode['WS'] = 19] = 'WS';
  CountryCode[CountryCode['BQ'] = 20] = 'BQ';
  CountryCode[CountryCode['BR'] = 21] = 'BR';
  CountryCode[CountryCode['BS'] = 22] = 'BS';
  CountryCode[CountryCode['JE'] = 23] = 'JE';
  CountryCode[CountryCode['BY'] = 24] = 'BY';
  CountryCode[CountryCode['BZ'] = 25] = 'BZ';
  CountryCode[CountryCode['RU'] = 26] = 'RU';
  CountryCode[CountryCode['RW'] = 27] = 'RW';
  CountryCode[CountryCode['RS'] = 28] = 'RS';
  CountryCode[CountryCode['TL'] = 29] = 'TL';
  CountryCode[CountryCode['RE'] = 30] = 'RE';
  CountryCode[CountryCode['TM'] = 31] = 'TM';
  CountryCode[CountryCode['TJ'] = 32] = 'TJ';
  CountryCode[CountryCode['RO'] = 33] = 'RO';
  CountryCode[CountryCode['TK'] = 34] = 'TK';
  CountryCode[CountryCode['GW'] = 35] = 'GW';
  CountryCode[CountryCode['GU'] = 36] = 'GU';
  CountryCode[CountryCode['GT'] = 37] = 'GT';
  CountryCode[CountryCode['GS'] = 38] = 'GS';
  CountryCode[CountryCode['GR'] = 39] = 'GR';
  CountryCode[CountryCode['GQ'] = 40] = 'GQ';
  CountryCode[CountryCode['GP'] = 41] = 'GP';
  CountryCode[CountryCode['JP'] = 42] = 'JP';
  CountryCode[CountryCode['GY'] = 43] = 'GY';
  CountryCode[CountryCode['GG'] = 44] = 'GG';
  CountryCode[CountryCode['GF'] = 45] = 'GF';
  CountryCode[CountryCode['GE'] = 46] = 'GE';
  CountryCode[CountryCode['GD'] = 47] = 'GD';
  CountryCode[CountryCode['GB'] = 48] = 'GB';
  CountryCode[CountryCode['GA'] = 49] = 'GA';
  CountryCode[CountryCode['SV'] = 50] = 'SV';
  CountryCode[CountryCode['GN'] = 51] = 'GN';
  CountryCode[CountryCode['GM'] = 52] = 'GM';
  CountryCode[CountryCode['GL'] = 53] = 'GL';
  CountryCode[CountryCode['GI'] = 54] = 'GI';
  CountryCode[CountryCode['GH'] = 55] = 'GH';
  CountryCode[CountryCode['OM'] = 56] = 'OM';
  CountryCode[CountryCode['TN'] = 57] = 'TN';
  CountryCode[CountryCode['JO'] = 58] = 'JO';
  CountryCode[CountryCode['HR'] = 59] = 'HR';
  CountryCode[CountryCode['HT'] = 60] = 'HT';
  CountryCode[CountryCode['HU'] = 61] = 'HU';
  CountryCode[CountryCode['HK'] = 62] = 'HK';
  CountryCode[CountryCode['HN'] = 63] = 'HN';
  CountryCode[CountryCode['HM'] = 64] = 'HM';
  CountryCode[CountryCode['VE'] = 65] = 'VE';
  CountryCode[CountryCode['PR'] = 66] = 'PR';
  CountryCode[CountryCode['PS'] = 67] = 'PS';
  CountryCode[CountryCode['PW'] = 68] = 'PW';
  CountryCode[CountryCode['PT'] = 69] = 'PT';
  CountryCode[CountryCode['SJ'] = 70] = 'SJ';
  CountryCode[CountryCode['PY'] = 71] = 'PY';
  CountryCode[CountryCode['IQ'] = 72] = 'IQ';
  CountryCode[CountryCode['PA'] = 73] = 'PA';
  CountryCode[CountryCode['PF'] = 74] = 'PF';
  CountryCode[CountryCode['PG'] = 75] = 'PG';
  CountryCode[CountryCode['PE'] = 76] = 'PE';
  CountryCode[CountryCode['PK'] = 77] = 'PK';
  CountryCode[CountryCode['PH'] = 78] = 'PH';
  CountryCode[CountryCode['PN'] = 79] = 'PN';
  CountryCode[CountryCode['PL'] = 80] = 'PL';
  CountryCode[CountryCode['PM'] = 81] = 'PM';
  CountryCode[CountryCode['ZM'] = 82] = 'ZM';
  CountryCode[CountryCode['EH'] = 83] = 'EH';
  CountryCode[CountryCode['EE'] = 84] = 'EE';
  CountryCode[CountryCode['EG'] = 85] = 'EG';
  CountryCode[CountryCode['ZA'] = 86] = 'ZA';
  CountryCode[CountryCode['EC'] = 87] = 'EC';
  CountryCode[CountryCode['IT'] = 88] = 'IT';
  CountryCode[CountryCode['VN'] = 89] = 'VN';
  CountryCode[CountryCode['SB'] = 90] = 'SB';
  CountryCode[CountryCode['ET'] = 91] = 'ET';
  CountryCode[CountryCode['SO'] = 92] = 'SO';
  CountryCode[CountryCode['ZW'] = 93] = 'ZW';
  CountryCode[CountryCode['SA'] = 94] = 'SA';
  CountryCode[CountryCode['ES'] = 95] = 'ES';
  CountryCode[CountryCode['ER'] = 96] = 'ER';
  CountryCode[CountryCode['ME'] = 97] = 'ME';
  CountryCode[CountryCode['MD'] = 98] = 'MD';
  CountryCode[CountryCode['MG'] = 99] = 'MG';
  CountryCode[CountryCode['MF'] = 100] = 'MF';
  CountryCode[CountryCode['MA'] = 101] = 'MA';
  CountryCode[CountryCode['MC'] = 102] = 'MC';
  CountryCode[CountryCode['UZ'] = 103] = 'UZ';
  CountryCode[CountryCode['MM'] = 104] = 'MM';
  CountryCode[CountryCode['ML'] = 105] = 'ML';
  CountryCode[CountryCode['MO'] = 106] = 'MO';
  CountryCode[CountryCode['MN'] = 107] = 'MN';
  CountryCode[CountryCode['MH'] = 108] = 'MH';
  CountryCode[CountryCode['MK'] = 109] = 'MK';
  CountryCode[CountryCode['MU'] = 110] = 'MU';
  CountryCode[CountryCode['MT'] = 111] = 'MT';
  CountryCode[CountryCode['MW'] = 112] = 'MW';
  CountryCode[CountryCode['MV'] = 113] = 'MV';
  CountryCode[CountryCode['MQ'] = 114] = 'MQ';
  CountryCode[CountryCode['MP'] = 115] = 'MP';
  CountryCode[CountryCode['MS'] = 116] = 'MS';
  CountryCode[CountryCode['MR'] = 117] = 'MR';
  CountryCode[CountryCode['IM'] = 118] = 'IM';
  CountryCode[CountryCode['UG'] = 119] = 'UG';
  CountryCode[CountryCode['TZ'] = 120] = 'TZ';
  CountryCode[CountryCode['MY'] = 121] = 'MY';
  CountryCode[CountryCode['MX'] = 122] = 'MX';
  CountryCode[CountryCode['IL'] = 123] = 'IL';
  CountryCode[CountryCode['FR'] = 124] = 'FR';
  CountryCode[CountryCode['IO'] = 125] = 'IO';
  CountryCode[CountryCode['SH'] = 126] = 'SH';
  CountryCode[CountryCode['FI'] = 127] = 'FI';
  CountryCode[CountryCode['FJ'] = 128] = 'FJ';
  CountryCode[CountryCode['FK'] = 129] = 'FK';
  CountryCode[CountryCode['FM'] = 130] = 'FM';
  CountryCode[CountryCode['FO'] = 131] = 'FO';
  CountryCode[CountryCode['NI'] = 132] = 'NI';
  CountryCode[CountryCode['NL'] = 133] = 'NL';
  CountryCode[CountryCode['NO'] = 134] = 'NO';
  CountryCode[CountryCode['NA'] = 135] = 'NA';
  CountryCode[CountryCode['VU'] = 136] = 'VU';
  CountryCode[CountryCode['NC'] = 137] = 'NC';
  CountryCode[CountryCode['NE'] = 138] = 'NE';
  CountryCode[CountryCode['NF'] = 139] = 'NF';
  CountryCode[CountryCode['NG'] = 140] = 'NG';
  CountryCode[CountryCode['NZ'] = 141] = 'NZ';
  CountryCode[CountryCode['NP'] = 142] = 'NP';
  CountryCode[CountryCode['NR'] = 143] = 'NR';
  CountryCode[CountryCode['NU'] = 144] = 'NU';
  CountryCode[CountryCode['CK'] = 145] = 'CK';
  CountryCode[CountryCode['XK'] = 146] = 'XK';
  CountryCode[CountryCode['CI'] = 147] = 'CI';
  CountryCode[CountryCode['CH'] = 148] = 'CH';
  CountryCode[CountryCode['CO'] = 149] = 'CO';
  CountryCode[CountryCode['CN'] = 150] = 'CN';
  CountryCode[CountryCode['CM'] = 151] = 'CM';
  CountryCode[CountryCode['CL'] = 152] = 'CL';
  CountryCode[CountryCode['CC'] = 153] = 'CC';
  CountryCode[CountryCode['CA'] = 154] = 'CA';
  CountryCode[CountryCode['CG'] = 155] = 'CG';
  CountryCode[CountryCode['CF'] = 156] = 'CF';
  CountryCode[CountryCode['CD'] = 157] = 'CD';
  CountryCode[CountryCode['CZ'] = 158] = 'CZ';
  CountryCode[CountryCode['CY'] = 159] = 'CY';
  CountryCode[CountryCode['CX'] = 160] = 'CX';
  CountryCode[CountryCode['CR'] = 161] = 'CR';
  CountryCode[CountryCode['CW'] = 162] = 'CW';
  CountryCode[CountryCode['CV'] = 163] = 'CV';
  CountryCode[CountryCode['CU'] = 164] = 'CU';
  CountryCode[CountryCode['SZ'] = 165] = 'SZ';
  CountryCode[CountryCode['SY'] = 166] = 'SY';
  CountryCode[CountryCode['SX'] = 167] = 'SX';
  CountryCode[CountryCode['KG'] = 168] = 'KG';
  CountryCode[CountryCode['KE'] = 169] = 'KE';
  CountryCode[CountryCode['SS'] = 170] = 'SS';
  CountryCode[CountryCode['SR'] = 171] = 'SR';
  CountryCode[CountryCode['KI'] = 172] = 'KI';
  CountryCode[CountryCode['KH'] = 173] = 'KH';
  CountryCode[CountryCode['KN'] = 174] = 'KN';
  CountryCode[CountryCode['KM'] = 175] = 'KM';
  CountryCode[CountryCode['ST'] = 176] = 'ST';
  CountryCode[CountryCode['SK'] = 177] = 'SK';
  CountryCode[CountryCode['KR'] = 178] = 'KR';
  CountryCode[CountryCode['SI'] = 179] = 'SI';
  CountryCode[CountryCode['KP'] = 180] = 'KP';
  CountryCode[CountryCode['KW'] = 181] = 'KW';
  CountryCode[CountryCode['SN'] = 182] = 'SN';
  CountryCode[CountryCode['SM'] = 183] = 'SM';
  CountryCode[CountryCode['SL'] = 184] = 'SL';
  CountryCode[CountryCode['SC'] = 185] = 'SC';
  CountryCode[CountryCode['KZ'] = 186] = 'KZ';
  CountryCode[CountryCode['KY'] = 187] = 'KY';
  CountryCode[CountryCode['SG'] = 188] = 'SG';
  CountryCode[CountryCode['SE'] = 189] = 'SE';
  CountryCode[CountryCode['SD'] = 190] = 'SD';
  CountryCode[CountryCode['DO'] = 191] = 'DO';
  CountryCode[CountryCode['DM'] = 192] = 'DM';
  CountryCode[CountryCode['DJ'] = 193] = 'DJ';
  CountryCode[CountryCode['DK'] = 194] = 'DK';
  CountryCode[CountryCode['VG'] = 195] = 'VG';
  CountryCode[CountryCode['DE'] = 196] = 'DE';
  CountryCode[CountryCode['YE'] = 197] = 'YE';
  CountryCode[CountryCode['DZ'] = 198] = 'DZ';
  CountryCode[CountryCode['US'] = 199] = 'US';
  CountryCode[CountryCode['UY'] = 200] = 'UY';
  CountryCode[CountryCode['YT'] = 201] = 'YT';
  CountryCode[CountryCode['UM'] = 202] = 'UM';
  CountryCode[CountryCode['LB'] = 203] = 'LB';
  CountryCode[CountryCode['LC'] = 204] = 'LC';
  CountryCode[CountryCode['LA'] = 205] = 'LA';
  CountryCode[CountryCode['TV'] = 206] = 'TV';
  CountryCode[CountryCode['TW'] = 207] = 'TW';
  CountryCode[CountryCode['TT'] = 208] = 'TT';
  CountryCode[CountryCode['TR'] = 209] = 'TR';
  CountryCode[CountryCode['LK'] = 210] = 'LK';
  CountryCode[CountryCode['LI'] = 211] = 'LI';
  CountryCode[CountryCode['LV'] = 212] = 'LV';
  CountryCode[CountryCode['TO'] = 213] = 'TO';
  CountryCode[CountryCode['LT'] = 214] = 'LT';
  CountryCode[CountryCode['LU'] = 215] = 'LU';
  CountryCode[CountryCode['LR'] = 216] = 'LR';
  CountryCode[CountryCode['LS'] = 217] = 'LS';
  CountryCode[CountryCode['TH'] = 218] = 'TH';
  CountryCode[CountryCode['TF'] = 219] = 'TF';
  CountryCode[CountryCode['TG'] = 220] = 'TG';
  CountryCode[CountryCode['TD'] = 221] = 'TD';
  CountryCode[CountryCode['TC'] = 222] = 'TC';
  CountryCode[CountryCode['LY'] = 223] = 'LY';
  CountryCode[CountryCode['VA'] = 224] = 'VA';
  CountryCode[CountryCode['VC'] = 225] = 'VC';
  CountryCode[CountryCode['AE'] = 226] = 'AE';
  CountryCode[CountryCode['AD'] = 227] = 'AD';
  CountryCode[CountryCode['AG'] = 228] = 'AG';
  CountryCode[CountryCode['AF'] = 229] = 'AF';
  CountryCode[CountryCode['AI'] = 230] = 'AI';
  CountryCode[CountryCode['VI'] = 231] = 'VI';
  CountryCode[CountryCode['IS'] = 232] = 'IS';
  CountryCode[CountryCode['IR'] = 233] = 'IR';
  CountryCode[CountryCode['AM'] = 234] = 'AM';
  CountryCode[CountryCode['AL'] = 235] = 'AL';
  CountryCode[CountryCode['AO'] = 236] = 'AO';
  CountryCode[CountryCode['AQ'] = 237] = 'AQ';
  CountryCode[CountryCode['AS'] = 238] = 'AS';
  CountryCode[CountryCode['AR'] = 239] = 'AR';
  CountryCode[CountryCode['AU'] = 240] = 'AU';
  CountryCode[CountryCode['AT'] = 241] = 'AT';
  CountryCode[CountryCode['AW'] = 242] = 'AW';
  CountryCode[CountryCode['IN'] = 243] = 'IN';
  CountryCode[CountryCode['AX'] = 244] = 'AX';
  CountryCode[CountryCode['AZ'] = 245] = 'AZ';
  CountryCode[CountryCode['IE'] = 246] = 'IE';
  CountryCode[CountryCode['ID'] = 247] = 'ID';
  CountryCode[CountryCode['UA'] = 248] = 'UA';
  CountryCode[CountryCode['QA'] = 249] = 'QA';
  CountryCode[CountryCode['MZ'] = 250] = 'MZ';
})(CountryCode || (CountryCode = {}));

class Grades extends Map {
  get(key) {
    if (!super.has(key)) {
      super.set(key, 0);
    }

    return super.get(key);
  }
  get hasZeroGrades() {
    return this.size === 0 || [...this.values()].reduce((p, c) => p + c) === 0;
  }
  toJSON() {
    const result = {};

    this.forEach((value, key) => {
      result[key] = value;
    });

    return result;
  }
  static fromJSON(json) {
    const statistics = new Grades();
    const entries = Object.entries(json);

    entries.forEach((entry) => {
      const key = entry[0];
      const value = entry[1];

      statistics.set(key, value);
    });

    return statistics;
  }
}

class HighestRank {
  constructor(options) {
    let _a, _b;

    this.rank = (_a = options === null || options === void 0 ? void 0 : options.rank) !== null && _a !== void 0 ? _a : 0;
    this.updatedAt = (_b = options === null || options === void 0 ? void 0 : options.updatedAt) !== null && _b !== void 0 ? _b : new Date();
  }
  clone() {
    return new HighestRank(this);
  }
  toJSON() {
    return {
      rank: this.rank,
      updatedAt: this.updatedAt.getTime() / 1000,
    };
  }
  static fromJSON(json) {
    return new HighestRank({
      rank: json.rank,
      updatedAt: json.updatedAt ? new Date(json.updatedAt * 1000) : new Date(),
    });
  }
}

class LevelInfo {
  constructor(options) {
    let _a, _b;

    this.current = (_a = options === null || options === void 0 ? void 0 : options.current) !== null && _a !== void 0 ? _a : 0;
    this.progress = (_b = options === null || options === void 0 ? void 0 : options.progress) !== null && _b !== void 0 ? _b : 0;
  }
  clone() {
    return new LevelInfo(this);
  }
  toString() {
    this.progress;

    return `${this.current + this.progress}`;
  }
}

class RankHistory {
  constructor(options) {
    let _a, _b;

    this.mode = (_a = options === null || options === void 0 ? void 0 : options.mode) !== null && _a !== void 0 ? _a : RankHistory.DEFAULT_MODE;
    this.data = (_b = options === null || options === void 0 ? void 0 : options.data) !== null && _b !== void 0 ? _b : [];
  }
  get hasEnoughData() {
    return this.mode !== RankHistory.DEFAULT_MODE && this.data.length > 1;
  }
  clone() {
    return new RankHistory({
      mode: this.mode,
      data: [...this.data],
    });
  }
}
RankHistory.DEFAULT_MODE = 'Unknown';

class UserInfo {
  constructor(options = {}) {
    this.id = 0;
    this.username = '';
    this.previousUsernames = [];
    this.countryCode = 'Unknown';
    this.playmode = 0;
    this.totalPerformance = 0;
    this.globalRank = null;
    this.countryRank = null;
    this.highestRank = null;
    this.level = new LevelInfo();
    this.rankedScore = 0;
    this.totalScore = 0;
    this.accuracy = 0;
    this.playcount = 0;
    this.playtime = 0;
    this.totalHits = 0;
    this.maxCombo = 0;
    this.replaysWatched = 0;
    this.followersCount = 0;
    this.grades = new Grades();
    this.rankHistory = null;
    this.isActive = true;
    this.isBot = false;
    this.isDeleted = false;
    this.isOnline = false;
    this.isSupporter = false;
    this.lastVisitAt = null;
    this.joinedAt = new Date();
    Object.assign(this, options);
  }
  clone() {
    let _a, _b, _c, _d;
    const UserInfo = this.constructor;
    const cloned = new UserInfo();

    Object.assign(cloned, this);
    cloned.grades = new Grades(this.grades);
    cloned.level = this.level.clone();
    cloned.highestRank = (_b = (_a = this.highestRank) === null || _a === void 0 ? void 0 : _a.clone()) !== null && _b !== void 0 ? _b : null;
    cloned.rankHistory = (_d = (_c = this.rankHistory) === null || _c === void 0 ? void 0 : _c.clone()) !== null && _d !== void 0 ? _d : null;
    cloned.lastVisitAt = this.lastVisitAt ? new Date(this.lastVisitAt) : null;
    cloned.previousUsernames = [...this.previousUsernames];

    return cloned;
  }
  equals(other) {
    if (!other) {
      return false;
    }

    return this.id === other.id && this.username === other.username;
  }
  toJSON() {
    let _a, _b;

    return {
      ...this,
      highestRank: (_b = (_a = this.highestRank) === null || _a === void 0 ? void 0 : _a.toJSON()) !== null && _b !== void 0 ? _b : null,
      grades: this.grades.toJSON(),
      joinedAt: this.joinedAt.getTime() / 1000,
      lastVisitAt: this.lastVisitAt ? this.lastVisitAt.getTime() / 1000 : null,
    };
  }
  static fromJSON(json) {
    return new UserInfo({
      ...json,
      highestRank: json.highestRank ? HighestRank.fromJSON(json.highestRank) : null,
      rankHistory: json.rankHistory ? new RankHistory(json.rankHistory) : null,
      grades: Grades.fromJSON(json.grades),
      level: new LevelInfo(json.level),
      joinedAt: new Date(json.joinedAt * 1000),
      lastVisitAt: json.lastVisitAt ? new Date(json.lastVisitAt * 1000) : null,
    });
  }
}

export { Accuracy, Anchor, Autoplay, Beatmap, BeatmapBreakEvent, BeatmapColorSection, BeatmapConverter, BeatmapDifficultySection, BeatmapEditorSection, BeatmapEventSection, BeatmapGeneralSection, BeatmapInfo, BeatmapMetadataSection, BeatmapProcessor, BinarySearch, BlendingMode, BlendingParameters, Cinema, CircularArcProperties, Color4, Command, CommandLoop, CommandTimeline, CommandTimelineGroup, CommandTrigger, CommandType, CompoundType, ControlPoint, ControlPointGroup, ControlPointInfo, ControlPointType, CountryCode, DifficultyAttributes, DifficultyCalculator, DifficultyHitObject, DifficultyPoint, DifficultyRange, DoubleTime, Easing, EasingType, Easy, EffectPoint, EffectType, EventGenerator, EventType, FastRandom, Flashlight, Grades, HalfTime, HardRock, Hidden, HighestRank, HitObject, HitResult, HitSample, HitSound, HitStatistics, HitType, HitWindows, Interpolation, LayerType, LegacyReplayFrame, LegacyScoreExtensions, LevelInfo, LifeBarFrame, LimitedCapacityQueue, LoopType, MathUtils, ModBitwise, ModCombination, ModType, Nightcore, NoFail, NoMod, Origins, ParameterType, PathApproximator, PathPoint, PathType, Perfect, PerformanceAttributes, PerformanceCalculator, ProgressiveCalculationBeatmap, Rank, RankHistory, Relax, Replay, ReplayButtonState, ReplayConverter, ReplayFrame, ReverseQueue, RoundHelper, Ruleset, RulesetBeatmap, SampleBank, SamplePoint, SampleSet, Score, ScoreInfo, ScoreRank, Skill, SliderEventType, SliderPath, SortHelper, Storyboard, StoryboardAnimation, StoryboardLayer, StoryboardSample, StoryboardSprite, StoryboardVideo, StrainDecaySkill, StrainSkill, SuddenDeath, TimeSignature, TimedDifficultyAttributes, TimingPoint, UserInfo, Vector2 };
