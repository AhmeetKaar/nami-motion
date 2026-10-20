import { processColor } from "react-native";

export function withAlpha(color: string, alpha: number): string {
  const processed = processColor(color);
  if (typeof processed !== "number") return color;
  const argb = processed >>> 0;
  const red = (argb >>> 16) & 255;
  const green = (argb >>> 8) & 255;
  const blue = argb & 255;
  const source = (argb >>> 24) / 255;
  const value = Math.round(source * alpha * 1000) / 1000;
  return `rgba(${red}, ${green}, ${blue}, ${value})`;
}
