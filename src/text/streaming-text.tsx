import { isValidElement, memo, useEffect, useMemo, type ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { type MotionPalette } from "../theme/palette";
import { useMotionPalette } from "../theme/provider";

const DEFAULT_TEXT_STYLE: TextStyle = { fontSize: 16, lineHeight: 24 };
const DEFAULT_FADE = 360;
const DEFAULT_RISE = 6;
const CARET_BLINK = 530;

export type StreamingTextProps = {
  text: string;
  streaming: boolean;
  textStyle?: StyleProp<TextStyle>;
  paragraphGap?: number;
  fadeDuration?: number;
  rise?: number;
  caret?: boolean | ReactNode;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

type Token = { value: string; key: number };

function tokenize(paragraph: string): Token[] {
  const parts = paragraph.match(/\S+\s*/g) ?? [];
  return parts.map((value, key) => ({ value, key }));
}

export function StreamingText({
  text,
  streaming,
  textStyle = DEFAULT_TEXT_STYLE,
  paragraphGap = 12,
  fadeDuration = DEFAULT_FADE,
  rise = DEFAULT_RISE,
  caret = true,
  colors,
  style,
}: StreamingTextProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const paragraphs = useMemo(() => text.split(/\n{2,}/), [text]);
  const animate = streaming && !reduceMotion;
  const color = palette.text;
  const caretNode = caret === false ? null : isValidElement(caret) ? caret : <Caret color={color} blink={!reduceMotion} textStyle={textStyle} />;

  return (
    <View style={[{ gap: paragraphGap }, style]}>
      {paragraphs.map((paragraph, index) => {
        const last = index === paragraphs.length - 1;
        if (!animate || !last) {
          return (
            <Text key={index} style={[textStyle, { color }]}>
              {paragraph}
              {last && streaming && caretNode}
            </Text>
          );
        }
        return (
          <View
            key={index}
            accessible
            accessibilityRole="text"
            accessibilityLabel={paragraph}
            style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end" }}
          >
            {tokenize(paragraph).map((token) => (
              <StreamingWord
                key={token.key}
                value={token.value}
                textStyle={textStyle}
                color={color}
                fadeDuration={fadeDuration}
                rise={rise}
              />
            ))}
            {caretNode}
          </View>
        );
      })}
    </View>
  );
}

type StreamingWordProps = {
  value: string;
  textStyle: StyleProp<TextStyle>;
  color: string;
  fadeDuration: number;
  rise: number;
};

const StreamingWord = memo(function StreamingWord({ value, textStyle, color, fadeDuration, rise }: StreamingWordProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: fadeDuration, easing: Easing.out(Easing.cubic) });
  }, [fadeDuration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: rise * (1 - progress.value) }],
  }));

  return <Animated.Text style={[textStyle, { color }, animatedStyle]}>{value}</Animated.Text>;
});

function Caret({ color, blink, textStyle }: { color: string; blink: boolean; textStyle: StyleProp<TextStyle> }) {
  const opacity = useSharedValue(1);
  const flat = StyleSheet.flatten(textStyle);
  const height = Math.round((flat?.fontSize ?? 16) * 1.05);

  useEffect(() => {
    if (!blink) return;
    opacity.value = withRepeat(
      withSequence(withTiming(0, { duration: CARET_BLINK }), withTiming(1, { duration: CARET_BLINK })),
      -1,
      false,
    );
    return () => cancelAnimation(opacity);
  }, [blink, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width: 2, height, borderRadius: 1, backgroundColor: color, marginLeft: 2, marginBottom: 3 },
        animatedStyle,
      ]}
    />
  );
}
