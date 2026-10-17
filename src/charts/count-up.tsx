import { useEffect, useRef, useState } from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { type MotionPalette } from "../theme/palette";
import { useMotionPalette } from "../theme/provider";

const DEFAULT_TEXT_STYLE: TextStyle = { fontSize: 34, lineHeight: 40, fontWeight: "600" };

export type CountUpProps = {
  value: number;
  from?: number;
  duration?: number;
  delay?: number;
  format?: (value: number) => string;
  textStyle?: StyleProp<TextStyle>;
  colors?: Partial<MotionPalette>;
};

const defaultFormat = (value: number) => Math.round(value).toLocaleString();

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

export function CountUp({
  value,
  from = 0,
  duration = 900,
  delay = 0,
  format = defaultFormat,
  textStyle = DEFAULT_TEXT_STYLE,
  colors,
}: CountUpProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : from);
  const shown = useRef(reduceMotion ? value : from);

  useEffect(() => {
    if (reduceMotion || duration <= 0) {
      shown.current = value;
      setDisplay(value);
      return;
    }
    const start = shown.current;
    let frame = 0;
    let begin = 0;
    const timer = setTimeout(() => {
      const step = (now: number) => {
        if (!begin) begin = now;
        const t = Math.min(1, (now - begin) / duration);
        const next = start + (value - start) * easeOut(t);
        shown.current = next;
        setDisplay(next);
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [delay, duration, reduceMotion, value]);

  return (
    <Text
      accessibilityLabel={format(value)}
      style={[textStyle, { color: palette.text, fontVariant: ["tabular-nums"] }]}
    >
      {format(display)}
    </Text>
  );
}
