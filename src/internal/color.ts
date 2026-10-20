import { processColor } from "react-native";

type Rgba = [number, number, number, number];

export function parseColor(color: string): Rgba | null {
  const processed = processColor(color);
  if (typeof processed !== "number") return null;
  const argb = processed >>> 0;
  return [(argb >>> 16) & 255, (argb >>> 8) & 255, argb & 255, (argb >>> 24) / 255];
}

function roundAlpha(value: number) {
  return Math.round(value * 1000) / 1000;
}

export function withAlpha(color: string, alpha: number): string {
  const parsed = parseColor(color);
  if (!parsed) return color;
  const [red, green, blue, source] = parsed;
  return `rgba(${red}, ${green}, ${blue}, ${roundAlpha(source * alpha)})`;
}

export function mixColors(from: string, to: string, t: number): string {
  const a = parseColor(from);
  const b = parseColor(to);
  if (!a || !b) return t < 0.5 ? from : to;
  const [red, green, blue, alpha] = a.map((value, index) => value + (b[index] - value) * t);
  if (alpha >= 1) {
    const hex = (value: number) => Math.round(value).toString(16).padStart(2, "0");
    return `#${hex(red)}${hex(green)}${hex(blue)}`;
  }
  return `rgba(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)}, ${roundAlpha(alpha)})`;
}
