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
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const DEFAULT_DURATION = 1400;
const HIGHLIGHT_WIDTH = 0.22;

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
};

export function ShimmerText({
  text,
  activeColor,
  mutedColor,
  textStyle = DEFAULT_TEXT_STYLE,
  duration = DEFAULT_DURATION,
}: ShimmerTextProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const characters = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.linear }),
      -1,
      false,
    );
  }, [duration, progress, reduceMotion]);

  if (reduceMotion) {
    return <Text style={[textStyle, { color: activeColor }]}>{text}</Text>;
  }

  return (
    <View style={{ flexDirection: "row" }}>
      {characters.map((char, index) => (
        <ShimmerChar
          key={index}
          char={char}
          index={index}
          total={characters.length}
          progress={progress}
          activeColor={activeColor}
          mutedColor={mutedColor}
          textStyle={textStyle}
        />
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
}: {
  char: string;
  index: number;
  total: number;
  progress: SharedValue<number>;
  activeColor: string;
  mutedColor: string;
  textStyle: StyleProp<TextStyle>;
}) {
  const style = useAnimatedStyle(() => {
    const phase = index / total;
    const distance = Math.abs(((progress.value - phase + 1.5) % 1) - 0.5);
    const t = interpolate(
      distance,
      [0, HIGHLIGHT_WIDTH],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { color: interpolateColor(t, [0, 1], [activeColor, mutedColor]) };
  });

  return <Animated.Text style={[textStyle, style]}>{char}</Animated.Text>;
}
