// Accepts your DB record shape and returns the computed color.

export type EmotionLabel =
  | "surprise"
  | "disgust"
  | "anger"
  | "fear"
  | "neutral"
  | "sadness"
  | "joy";

type NonNeutralEmotion = Exclude<EmotionLabel, "neutral">;

// Hues (in degrees) for each non-neutral emotion on the wheel
const HUES: Record<NonNeutralEmotion, number> = {
  anger: 0, // red
  joy: 60, // yellow
  disgust: 120, // green
  surprise: 180, // cyan / teal
  sadness: 240, // blue
  fear: 300, // purple
};

export interface EmotionColorResult {
  hueDeg: number; // 0..360
  saturation: number; // 0..1
  lightness: number; // 0..1
  rgb: [number, number, number]; // 0..255
  hex: string; // "#rrggbb"
}

// Your DB record (or API payload) can have extra fields; we only care about emotion keys.
export type EmotionDbRow = Partial<Record<EmotionLabel, number>> & {
  entry_id?: number;
  analyzed_at?: string;
  [k: string]: unknown;
};

function isEmotionLabel(label: string): label is EmotionLabel {
  return (
    label === "surprise" ||
    label === "disgust" ||
    label === "anger" ||
    label === "fear" ||
    label === "neutral" ||
    label === "sadness" ||
    label === "joy"
  );
}

// ---- Math helpers for the color wheel ----

// Normalize non-neutral scores so they sum to 1
function normalizeNonNeutral(
  scores: Partial<Record<EmotionLabel, number>>
): Record<NonNeutralEmotion, number> {
  const labels = Object.keys(HUES) as NonNeutralEmotion[];
  let total = 0;

  for (const l of labels) total += scores[l] ?? 0;

  const weights = {} as Record<NonNeutralEmotion, number>;
  for (const l of labels) weights[l] = total > 0 ? (scores[l] ?? 0) / total : 0;

  return weights;
}

// Compute weighted vector on unit circle
function weightedVector(weights: Record<NonNeutralEmotion, number>): {
  x: number;
  y: number;
} {
  let x = 0;
  let y = 0;

  for (const [label, w] of Object.entries(weights) as [
    NonNeutralEmotion,
    number
  ][]) {
    const theta = (HUES[label] * Math.PI) / 180;
    x += w * Math.cos(theta);
    y += w * Math.sin(theta);
  }

  return { x, y };
}

// Convert vector to hue in degrees 0..360
function vectorToHueDeg(x: number, y: number): number {
  let deg = (Math.atan2(y, x) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
}

// Vector magnitude (0..1)
function vectorMagnitude(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

// Compute saturation from vector length and neutral weight
function computeSaturation(
  vecLength: number,
  neutralWeight: number,
  maxSat = 0.9
): number {
  return maxSat * vecLength * (1 - neutralWeight);
}

// Convert HSL (0..1) to RGB [0..255]
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const t = [h + 1 / 3, h, h - 1 / 3];

  const rgb = t.map((tc) => {
    let tChannel = tc;
    if (tChannel < 0) tChannel += 1;
    if (tChannel > 1) tChannel -= 1;

    if (tChannel < 1 / 6) return p + (q - p) * 6 * tChannel;
    if (tChannel < 1 / 2) return q;
    if (tChannel < 2 / 3) return p + (q - p) * (2 / 3 - tChannel) * 6;
    return p;
  });

  return rgb.map((v) => Math.round(v * 255)) as [number, number, number];
}

// ---- Core: EmotionLabel score map -> color ----
export function emotionScoresToColor(
  scores: Partial<Record<EmotionLabel, number>>
): EmotionColorResult {
  const weights = normalizeNonNeutral(scores);
  const { x, y } = weightedVector(weights);

  const hueDeg = vectorToHueDeg(x, y);
  const hue = hueDeg / 360;

  const allValues = (Object.values(scores) as unknown[]).filter(
    (v): v is number => typeof v === "number"
  );
  const totalAll = allValues.reduce((a, b) => a + b, 0);
  const neutralWeight = totalAll > 0 ? (scores.neutral ?? 0) / totalAll : 0;

  const vecLength = vectorMagnitude(x, y);
  const saturation = computeSaturation(vecLength, neutralWeight, 0.9);
  const lightness = 0.5;

  const [r, g, b] = hslToRgb(hue, saturation, lightness);
  const hex =
    "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");

  return { hueDeg, saturation, lightness, rgb: [r, g, b], hex };
}

// ---- New: DB row -> color ----
export function emotionRowToColor(row: EmotionDbRow): EmotionColorResult {
  const scores: Partial<Record<EmotionLabel, number>> = {};

  for (const [k, v] of Object.entries(row)) {
    if (isEmotionLabel(k) && typeof v === "number") {
      scores[k] = v;
    }
  }

  return emotionScoresToColor(scores);
}
