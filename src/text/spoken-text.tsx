import { memo, useEffect, useMemo } from "react";
import { Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import { type MotionPalette } from "../theme/palette";
import { useMotionPalette } from "../theme/provider";

const DEFAULT_TEXT_STYLE: TextStyle = { fontSize: 22, lineHeight: 30, fontWeight: "600" };

export type SpokenTextProps = {
  text: string;
  spoken: number;
  textStyle?: StyleProp<TextStyle>;
  activeColor?: string;
  spokenColor?: string;
  upcomingColor?: string;
  align?: "left" | "center";
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

export function SpokenText({
  text,
  spoken,
  textStyle = DEFAULT_TEXT_STYLE,
  activeColor,
  spokenColor,
  upcomingColor,
  align = "center",
  colors,
  style,
}: SpokenTextProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const words = useMemo(() => text.match(/\S+\s*/g) ?? [], [text]);
  const active = activeColor ?? palette.text;
  const done = spokenColor ?? palette.textSecondary;
  const upcoming = upcomingColor ?? palette.textTertiary;
  const current = Math.min(words.length, Math.max(0, Math.floor(spoken)));

  if (reduceMotion) {
    return (
      <Text accessibilityLabel={text} style={[textStyle, { color: active, textAlign: align }, style as StyleProp<TextStyle>]}>
        {text}
      </Text>
    );
  }

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={text}
      style={[{ flexDirection: "row", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start" }, style]}
    >
      {words.map((word, index) => (
        <SpokenWord
          key={index}
          word={word}
          phase={index < current ? 2 : index === current ? 1 : 0}
          textStyle={textStyle}
          active={active}
          done={done}
          upcoming={upcoming}
        />
      ))}
    </View>
  );
}

type SpokenWordProps = { word: string; phase: number; textStyle: StyleProp<TextStyle>; active: string; done: string; upcoming: string };

const SpokenWord = memo(function SpokenWord({ word, phase, textStyle, active, done, upcoming }: SpokenWordProps) {
  const value = useSharedValue(phase);
  useEffect(() => {
    value.value = withTiming(phase, { duration: 180 });
  }, [phase, value]);
  const style = useAnimatedStyle(() => ({
    color: interpolateColor(value.value, [0, 1, 2], [upcoming, active, done]),
    transform: [{ translateY: -2 * Math.max(0, 1 - Math.abs(value.value - 1)) }],
  }));
  return <Animated.Text style={[textStyle, style]}>{word}</Animated.Text>;
});
