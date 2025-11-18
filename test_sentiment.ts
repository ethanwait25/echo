import { pipeline } from '@huggingface/transformers';
import chalk from "chalk";

async function analyzeSentiment(text: string) {
    const sentimentAnalyzer = await pipeline(
        'sentiment-analysis',
        'Xenova/bert-base-multilingual-uncased-sentiment',
        { dtype: 'fp32' }
    );
    const result = await sentimentAnalyzer(text, { top_k: 5 });
    return result;
}

async function analyzeEmotion(text: string) {
    const emotionAnalyzer = await pipeline(
        'text-classification',
        'MicahB/emotion_text_classifier',
        { dtype: 'fp32' }
    );
    const result = await emotionAnalyzer(text, { top_k: 7 });
    return result;
}

async function analyzeText(text: string) {
    const sentiment = await analyzeSentiment(text);
    const emotion = await analyzeEmotion(text);
    // console.log(`'${text}'`);
    // console.log(sentiment);
    console.log(emotion);
    return {
        sentiment: sentiment,
        emotion: emotion
    }
}

function analyzeParagraphs(input: string[]) {
    var result: any[] = [];
    input.forEach(async x => {
        const res = await analyzeText(x);
        result.push(res);
    });
    return result;
}

async function analyzeFullText(input: string[]) {
    const full_text = input.join(' ');
    return await analyzeText(full_text);
}

const mixed_but_pleasant = [
    "I ate some Domino's pizza tonight. I had been feeling sad, but then my wife bought me a pizza to cheer me up. It was delicious and just what I needed.",
    "But after dinner, I didn't feel especially well. The pizza had made me sick. So I went to bed early.",
    "I went to bed, and awoke in the morning feeling perfectly fine. I was energized and ready for a new day. All in all, today was pretty great."
]

// -------------------------------------------------------------
// Emotion → Color mapping for HF TextClassificationOutput
// -------------------------------------------------------------

import type { TextClassificationOutput } from '@huggingface/transformers';

// ---- Emotion / color types ----

export type EmotionLabel =
  | 'surprise'
  | 'disgust'
  | 'anger'
  | 'fear'
  | 'neutral'
  | 'sadness'
  | 'joy';

type NonNeutralEmotion = Exclude<EmotionLabel, 'neutral'>;

// Map of label -> score (what emotionScoresToColor expects)
export type EmotionScores = Partial<Record<EmotionLabel, number>>;

// Hues (in degrees) for each non-neutral emotion on the wheel
const HUES: Record<NonNeutralEmotion, number> = {
  anger: 0,        // red
  joy: 60,         // yellow
  disgust: 120,    // green
  surprise: 180,   // cyan / teal
  sadness: 240,    // blue
  fear: 300        // purple
};

export interface EmotionColorResult {
  hueDeg: number;                 // 0..360
  saturation: number;             // 0..1
  lightness: number;              // 0..1
  rgb: [number, number, number];  // 0..255 per channel
  hex: string;                    // "#rrggbb"
}

// ---- Helper: label → EmotionLabel type guard ----

function isEmotionLabel(label: string): label is EmotionLabel {
  return (
    label === 'surprise' ||
    label === 'disgust' ||
    label === 'anger' ||
    label === 'fear' ||
    label === 'neutral' ||
    label === 'sadness' ||
    label === 'joy'
  );
}

// ---- Adapter: HF outputs → EmotionScores ----
//
// NOTE: we use the HF TextClassificationOutput directly here.
// No local TextClassificationOutput interface!
// -------------------------------------------------------------

export function classificationOutputToEmotionScores(
  output: TextClassificationOutput | TextClassificationOutput[]
): EmotionScores {
  const arr = Array.isArray(output) ? output : [output];
  const scores: EmotionScores = {};

  for (const { label, score } of arr) {
    if (isEmotionLabel(label)) {
      scores[label] = score;
    }
  }

  return scores;
}

// ---- Math helpers for the color wheel ----

// Normalize non-neutral scores so they sum to 1
function normalizeNonNeutral(scores: EmotionScores): Record<NonNeutralEmotion, number> {
  const labels = Object.keys(HUES) as NonNeutralEmotion[];
  let total = 0;

  for (const l of labels) {
    total += scores[l] ?? 0;
  }

  const weights: Record<NonNeutralEmotion, number> = {} as Record<NonNeutralEmotion, number>;

  for (const l of labels) {
    weights[l] = total > 0 ? (scores[l] ?? 0) / total : 0;
  }

  return weights;
}

// Compute weighted vector on unit circle
function weightedVector(weights: Record<NonNeutralEmotion, number>): { x: number; y: number } {
  let x = 0;
  let y = 0;

  for (const [label, w] of Object.entries(weights) as [NonNeutralEmotion, number][]) {
    const theta = (HUES[label] * Math.PI) / 180;
    x += w * Math.cos(theta);
    y += w * Math.sin(theta);
  }

  return { x, y };
}

// Convert vector to hue in degrees 0..360
function vectorToHueDeg(x: number, y: number): number {
  let deg = (Math.atan2(y, x) * 180) / Math.PI; // -180..180
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
  // More neutral → more desaturated
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

// ---- Main: convert EmotionScores → color ----

export function emotionScoresToColor(scores: EmotionScores): EmotionColorResult {
  const weights = normalizeNonNeutral(scores);
  const { x, y } = weightedVector(weights);
  const hueDeg = vectorToHueDeg(x, y); // 0..360
  const hue = hueDeg / 360;            // 0..1

  const allScores = Object.values(scores).filter(
    (v): v is number => typeof v === 'number'
  );
  const totalAll = allScores.reduce((a, b) => a + b, 0);
  const neutralWeight =
    totalAll > 0 ? (scores.neutral ?? 0) / totalAll : 0;

  const vecLength = vectorMagnitude(x, y);
  const saturation = computeSaturation(vecLength, neutralWeight, 0.9);
  const lightness = 0.5;

  const [r, g, b] = hslToRgb(hue, saturation, lightness);
  const hex =
    '#' +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('');

  return {
    hueDeg,
    saturation,
    lightness,
    rgb: [r, g, b],
    hex
  };
}

const frustrated = [
    "I just can't get over how horrible Bill has been to us at the office. His treatment has been cruel and I can't stand him.",
    "Why should I have to stay late when he gets to go home early? That doesn't seem fair to me. It's astonishing that he can look me in the eyes when he asks me to work hours after he does.",
    "I think I might go job searching soon. I know I'm worth more than this. I'm a great worker, and I'm sure plenty of companies would want to have me there!"
]

const anger = [
    "I HATE little mac. All he does is punch me in the face. I want him to stop it, but he won't, he just keeps punching me in the hecking face.",
    "I don't know what to do at this point! I just can't win!"
]

const disgust = [
    "Pineapple on pizza isn't even a real thing. People just made it up without really thinking about the consequences.",
    "You can't put fruit on top of cow juice and tomato sauce. It's unnatural."
]

const reynolds = [
    "My day was pretty melancholy, but also lackluster. It is, however, steadily improving. But I think it's going to end great."
]

// const pg_res = analyzeParagraphs(frustrated);
const res = await analyzeFullText(anger);

const scores = classificationOutputToEmotionScores(res.emotion);
const color = emotionScoresToColor(scores);
console.log(color);
console.log(chalk.bgHex(color.hex)("     "));