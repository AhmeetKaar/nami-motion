import { moodstoneSwatches, type MotionPalette } from "../theme/palette";

export type ChartTone = "normal" | "warn" | "danger";

export type ChartToneColors = Partial<Record<ChartTone, string>>;

export function toneFor(fraction: number, warnAt?: number, dangerAt?: number): ChartTone {
  if (dangerAt !== undefined && fraction >= dangerAt) return "danger";
  if (warnAt !== undefined && fraction >= warnAt) return "warn";
  return "normal";
}

export function toneColor(tone: ChartTone, palette: MotionPalette, fill: string, overrides?: ChartToneColors) {
  if (overrides?.[tone]) return overrides[tone] as string;
  if (tone === "danger") return palette.danger;
  if (tone === "warn") return moodstoneSwatches.tangerine;
  return fill;
}
