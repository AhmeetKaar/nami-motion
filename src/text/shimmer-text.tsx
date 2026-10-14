import { useEffect, useMemo } from "react";
import { Text, View, type StyleProp, type TextStyle } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const DEFAULT_DURATION = 1400;
const DEFAULT_HIGHLIGHT_WIDTH = 0.22;
const GLYPH_BLEED: TextStyle = { paddingHorizontal: 2, marginHorizontal: -2 };

const DEFAULT_TEXT_STYLE: TextStyle = {
  fontSize: 14,
  fontWeight: "500",
  lineHeight: 20,
};

export type ShimmerTextProps = {
  text: string;
  activeColor: string;
  mutedColor: string;
  textStyle?: StyleProp<TextStyle>;
  duration?: number;
  highlightWidth?: number;
  pause?: number;
  direction?: "ltr" | "rtl";
};

type Glyph = { char: string; index: number };

export function ShimmerText({
  text,
  activeColor,
  mutedColor,
  textStyle = DEFAULT_TEXT_STYLE,
  duration = DEFAULT_DURATION,
  highlightWidth = DEFAULT_HIGHLIGHT_WIDTH,
  pause = 0,
  direction = "ltr",
}: ShimmerTextProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const { words, total } = useMemo(() => {
    const characters = Array.from(text);
    const groups: Glyph[][] = [];
    let current: Glyph[] = [];
    characters.forEach((char, index) => {
      current.push({ char, index });
      if (char === " ") {
        groups.push(current);
        current = [];
      }
    });
    if (current.length) groups.push(current);
    return { words: groups, total: characters.length };
  }, [text]);

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = 0;
    const sweep = withTiming(1, { duration, easing: Easing.linear });
    progress.value = withRepeat(
      pause > 0 ? withSequence(sweep, withDelay(pause, withTiming(0, { duration: 0 }))) : sweep,
      -1,
      false,
    );
  }, [duration, pause, progress, reduceMotion]);

  if (reduceMotion) {
    return <Text style={[textStyle, { color: activeColor }]}>{text}</Text>;
  }

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={text}
      style={{ flexDirection: "row", flexWrap: "wrap" }}
    >
      {words.map((word, wordIndex) => (
        <View key={wordIndex} style={{ flexDirection: "row" }}>
          {word.map((glyph) => (
            <ShimmerChar
              key={glyph.index}
              char={glyph.char}
              index={direction === "rtl" ? total - 1 - glyph.index : glyph.index}
              total={total}
              progress={progress}
              activeColor={activeColor}
              mutedColor={mutedColor}
              textStyle={textStyle}
              highlightWidth={highlightWidth}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function ShimmerChar({
  char,
  index,
  total,
  progress,
  activeColor,
  mutedColor,
  textStyle,
  highlightWidth,
}: {
  char: string;
  index: number;
  total: number;
  progress: SharedValue<number>;
  activeColor: string;
  mutedColor: string;
  textStyle: StyleProp<TextStyle>;
  highlightWidth: number;
}) {
  const style = useAnimatedStyle(() => {
    const phase = total > 1 ? index / (total - 1) : 0;
    const position = -highlightWidth + progress.value * (1 + highlightWidth * 2);
    const distance = Math.abs(position - phase);
    const linear = interpolate(distance, [0, highlightWidth], [0, 1], Extrapolation.CLAMP);
    const t = linear * linear * (3 - 2 * linear);
    return { color: interpolateColor(t, [0, 1], [activeColor, mutedColor]) };
  });

  return <Animated.Text style={[textStyle, GLYPH_BLEED, style]}>{char}</Animated.Text>;
}
