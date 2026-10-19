import { isValidElement, memo, useEffect, useMemo, useState, type ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { withAlpha } from "../internal/color";
import { type MotionPalette } from "../theme/palette";
import { useMotionPalette } from "../theme/provider";

const DEFAULT_TEXT_STYLE: TextStyle = { fontSize: 16, lineHeight: 24 };
const DEFAULT_FADE = 360;
const FRAME_MS = 32;
const CARET_BLINK = 530;

export type StreamingTextProps = {
  text: string;
  streaming: boolean;
  textStyle?: StyleProp<TextStyle>;
  paragraphGap?: number;
  fadeDuration?: number;
  caret?: boolean | ReactNode;
  selectable?: boolean;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

type Chunk = { start: number; end: number; born: number };

type Reveal = { text: string; settled: number; chunks: Chunk[] };

type Range = { start: number; end: number };

type Piece = Range & { alpha: number };

function easeOut(progress: number) {
  const clamped = Math.min(1, Math.max(0, progress));
  return 1 - (1 - clamped) ** 3;
}

function commonPrefix(a: string, b: string) {
  const limit = Math.min(a.length, b.length);
  let index = 0;
  while (index < limit && a.charCodeAt(index) === b.charCodeAt(index)) index += 1;
  return index;
}

function paragraphRanges(text: string): Range[] {
  const ranges: Range[] = [];
  const breaks = /\n{2,}/g;
  let start = 0;
  let match = breaks.exec(text);
  while (match) {
    ranges.push({ start, end: match.index });
    start = match.index + match[0].length;
    match = breaks.exec(text);
  }
  ranges.push({ start, end: text.length });
  return ranges;
}

function settledReveal(text: string): Reveal {
  return { text, settled: text.length, chunks: [] };
}

function nextReveal(previous: Reveal, text: string, born: number): Reveal {
  if (text === previous.text) return previous;
  const common = commonPrefix(previous.text, text);
  const chunks = previous.chunks
    .filter((chunk) => chunk.start < common)
    .map((chunk) => (chunk.end > common ? { ...chunk, end: common } : chunk));
  if (text.length > common) chunks.push({ start: common, end: text.length, born });
  return { text, settled: Math.min(previous.settled, common), chunks };
}

function revealPieces(reveal: Reveal, length: number, now: number, fadeDuration: number): Piece[] {
  const pieces: Piece[] = [];
  if (reveal.settled > 0) pieces.push({ start: 0, end: reveal.settled, alpha: 1 });
  let cursor = reveal.settled;
  for (const chunk of reveal.chunks) {
    const end = Math.min(chunk.end, length);
    if (end > cursor) pieces.push({ start: cursor, end, alpha: easeOut((now - chunk.born) / fadeDuration) });
    cursor = Math.max(cursor, end);
  }
  if (cursor < length) pieces.push({ start: cursor, end: length, alpha: 0 });
  return pieces;
}

export function StreamingText({
  text,
  streaming,
  textStyle = DEFAULT_TEXT_STYLE,
  paragraphGap = 12,
  fadeDuration = DEFAULT_FADE,
  caret = true,
  selectable = false,
  colors,
  style,
}: StreamingTextProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion && fadeDuration > 0;
  const [reveal, setReveal] = useState<Reveal>(() => (streaming && animate ? settledReveal("") : settledReveal(text)));
  const [now, setNow] = useState(() => Date.now());
  const fading = reveal.chunks.length > 0;
  const color = palette.text;

  useEffect(() => {
    if (!streaming || !animate) {
      setReveal((previous) => (previous.text === text ? previous : settledReveal(text)));
      return;
    }
    const born = Date.now();
    setNow(born);
    setReveal((previous) => nextReveal(previous, text, born));
  }, [text, streaming, animate]);

  useEffect(() => {
    if (!fading) return;
    const timer = setInterval(() => {
      const time = Date.now();
      setNow(time);
      setReveal((previous) => {
        const live = previous.chunks.filter((chunk) => time - chunk.born < fadeDuration);
        if (live.length === previous.chunks.length) return previous;
        const done = previous.chunks[previous.chunks.length - live.length - 1];
        return { ...previous, settled: Math.max(previous.settled, done.end), chunks: live };
      });
    }, FRAME_MS);
    return () => clearInterval(timer);
  }, [fading, fadeDuration]);

  const current = streaming ? nextReveal(reveal, text, Number.POSITIVE_INFINITY) : reveal.text === text ? reveal : settledReveal(text);
  const pieces = animate ? revealPieces(current, text.length, now, fadeDuration) : [{ start: 0, end: text.length, alpha: 1 }];
  const paragraphs = useMemo(() => paragraphRanges(text), [text]);
  const caretNode =
    !streaming || caret === false ? null : isValidElement(caret) ? caret : <Caret color={color} blink={!reduceMotion} textStyle={textStyle} />;

  return (
    <View style={[{ gap: paragraphGap }, style]}>
      {paragraphs.map((range, index) => {
        const last = index === paragraphs.length - 1;
        const inside = pieces.filter((piece) => piece.end > range.start && piece.start < range.end);
        const plain = inside.length <= 1 && (inside[0]?.alpha ?? 1) >= 1;
        if (plain && !last) {
          return (
            <PlainParagraph
              key={index}
              value={text.slice(range.start, range.end)}
              textStyle={textStyle}
              color={color}
              selectable={selectable}
            />
          );
        }
        return (
          <Text key={index} style={[textStyle, { color }]} selectable={selectable}>
            {inside.map((piece) => {
              const value = text.slice(Math.max(piece.start, range.start), Math.min(piece.end, range.end));
              if (piece.alpha >= 1) return value;
              return (
                <Text key={piece.start} style={{ color: withAlpha(color, piece.alpha) }}>
                  {value}
                </Text>
              );
            })}
            {last && caretNode}
          </Text>
        );
      })}
    </View>
  );
}

type PlainParagraphProps = {
  value: string;
  textStyle: StyleProp<TextStyle>;
  color: string;
  selectable: boolean;
};

const PlainParagraph = memo(function PlainParagraph({ value, textStyle, color, selectable }: PlainParagraphProps) {
  return (
    <Text style={[textStyle, { color }]} selectable={selectable}>
      {value}
    </Text>
  );
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
