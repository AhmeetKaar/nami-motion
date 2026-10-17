import {
  BlurMask,
  Canvas,
  type DataSourceParam,
  Group,
  matchFont,
  type SkFont,
  Skia,
  Text as SkiaText,
  useFont,
} from "@shopify/react-native-skia";
import { useEffect, useMemo, useRef, useState } from "react";
import { type LayoutChangeEvent, Text, type TextStyle, View, type StyleProp, type ViewStyle } from "react-native";
import {
  Easing,
  type SharedValue,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useMotionPalette } from "../theme/provider";

const DEFAULTS = {
  fontSize: 32,
  blurMax: 8,
  stagger: 28,
  duration: 520,
  rise: 10,
  interval: 2800,
  overlap: 0.35,
};

export type BlurTextSplit = "character" | "word";

export type BlurTextProps = {
  text?: string;
  texts?: string[];
  interval?: number;
  font?: SkFont | null;
  fontSource?: DataSourceParam;
  fontFamily?: string;
  fontWeight?: TextStyle["fontWeight"];
  fontSize?: number;
  color?: string;
  align?: "left" | "center" | "right";
  split?: BlurTextSplit;
  blurMax?: number;
  stagger?: number;
  duration?: number;
  rise?: number;
  autoFit?: boolean;
  onCycle?: (index: number) => void;
  style?: StyleProp<ViewStyle>;
};

type Piece = { value: string; x: number; index: number };

type Layer = { key: number; text: string };

function splitPieces(text: string, split: BlurTextSplit) {
  if (split === "word") return text.split(/(\s+)/).filter((part) => part.length > 0);
  return Array.from(text);
}

function measure(font: SkFont, value: string) {
  if (!value) return 0;
  const ids = font.getGlyphIDs(value);
  return font.getGlyphWidths(ids).reduce((sum, width) => sum + width, 0);
}

function layoutPieces(font: SkFont, text: string, split: BlurTextSplit) {
  const pieces: Piece[] = [];
  let x = 0;
  splitPieces(text, split).forEach((value, index) => {
    pieces.push({ value, x, index });
    x += measure(font, value);
  });
  return { pieces, width: x };
}

function useResolvedFont({
  font,
  fontSource,
  fontFamily,
  fontWeight,
  fontSize,
}: Pick<BlurTextProps, "font" | "fontSource" | "fontFamily" | "fontWeight"> & { fontSize: number }) {
  const loaded = useFont(font ? null : fontSource, fontSize);
  return useMemo(() => {
    if (font) return font;
    if (fontSource) return loaded;
    return matchFont({ fontFamily, fontSize, fontWeight: fontWeight as never });
  }, [font, fontFamily, fontSize, fontSource, fontWeight, loaded]);
}

function resize(font: SkFont, size: number) {
  if (Math.abs(font.getSize() - size) < 0.5) return font;
  const typeface = font.getTypeface();
  return typeface ? Skia.Font(typeface, size) : font;
}

export function BlurText({
  text,
  texts,
  interval = DEFAULTS.interval,
  font,
  fontSource,
  fontFamily,
  fontWeight,
  fontSize = DEFAULTS.fontSize,
  color,
  align = "center",
  split = "character",
  blurMax = DEFAULTS.blurMax,
  stagger = DEFAULTS.stagger,
  duration = DEFAULTS.duration,
  rise = DEFAULTS.rise,
  autoFit = true,
  onCycle,
  style,
}: BlurTextProps) {
  const palette = useMotionPalette();
  const reduceMotion = useReducedMotion();
  const tint = color ?? palette.text;
  const [width, setWidth] = useState(0);
  const [cycleIndex, setCycleIndex] = useState(0);
  const baseFont = useResolvedFont({ font, fontSource, fontFamily, fontWeight, fontSize });

  const phrases = texts && texts.length > 0 ? texts : [text ?? ""];
  const current = text ?? phrases[cycleIndex % phrases.length] ?? "";

  useEffect(() => {
    if (text !== undefined || !texts || texts.length < 2) return;
    const id = setInterval(() => setCycleIndex((value) => (value + 1) % texts.length), interval);
    return () => clearInterval(id);
  }, [interval, text, texts]);

  const onCycleRef = useRef(onCycle);
  onCycleRef.current = onCycle;
  useEffect(() => {
    if (text === undefined && texts && texts.length > 1) onCycleRef.current?.(cycleIndex);
  }, [cycleIndex, text, texts]);

  const fittedFont = useMemo(() => {
    if (!baseFont || !autoFit || width === 0) return baseFont;
    const candidates = [current, ...(texts ?? [])];
    const widest = Math.max(...candidates.map((value) => measure(baseFont, value)));
    return widest > width ? resize(baseFont, (baseFont.getSize() * width) / widest) : baseFont;
  }, [autoFit, baseFont, current, texts, width]);

  const [layers, setLayers] = useState<{ previous: Layer | null; current: Layer }>({
    previous: null,
    current: { key: 0, text: current },
  });
  const enter = useSharedValue(reduceMotion ? 1 : 0);
  const exit = useSharedValue(0);

  useEffect(() => {
    setLayers((state) =>
      state.current.text === current
        ? state
        : { previous: state.current, current: { key: state.current.key + 1, text: current } },
    );
  }, [current]);

  const metrics = fittedFont?.getMetrics();
  const ascent = metrics ? -metrics.ascent : fontSize;
  const descent = metrics ? metrics.descent : fontSize * 0.25;
  const padding = rise + blurMax;
  const height = Math.ceil(ascent + descent + padding * 2);
  const baseline = padding + ascent;

  const currentLayout = useMemo(
    () => (fittedFont ? layoutPieces(fittedFont, layers.current.text, split) : null),
    [fittedFont, layers.current.text, split],
  );
  const previousLayout = useMemo(
    () => (fittedFont && layers.previous ? layoutPieces(fittedFont, layers.previous.text, split) : null),
    [fittedFont, layers.previous, split],
  );

  const span = (count: number) => duration + stagger * Math.max(0, count - 1);
  const enterSpan = span(currentLayout?.pieces.length ?? 1);
  const exitSpan = span(previousLayout?.pieces.length ?? 1);

  useEffect(() => {
    if (reduceMotion) {
      enter.value = 1;
      exit.value = 1;
      return;
    }
    const linear = Easing.linear;
    if (layers.previous) {
      exit.value = 0;
      exit.value = withTiming(1, { duration: exitSpan, easing: linear });
      enter.value = 0;
      enter.value = withDelay(exitSpan * DEFAULTS.overlap, withTiming(1, { duration: enterSpan, easing: linear }));
    } else {
      enter.value = 0;
      enter.value = withTiming(1, { duration: enterSpan, easing: linear });
    }
  }, [layers.current.key]);

  const offsetFor = (textWidth: number) => {
    if (align === "left") return 0;
    if (align === "right") return width - textWidth;
    return (width - textWidth) / 2;
  };

  const handleLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={current}
      accessibilityLiveRegion="polite"
      onLayout={handleLayout}
      style={[{ alignSelf: "stretch", height }, style]}
    >
      {!fittedFont || width === 0 ? (
        <Text
          numberOfLines={1}
          style={{
            color: tint,
            fontSize,
            fontFamily,
            fontWeight,
            textAlign: align,
            lineHeight: height,
          }}
        >
          {current}
        </Text>
      ) : (
        <Canvas style={{ width, height }}>
          {previousLayout && layers.previous && (
            <Group key={`p${layers.previous.key}`} transform={[{ translateX: offsetFor(previousLayout.width) }]}>
              {previousLayout.pieces.map((piece) => (
                <BlurPiece
                  key={piece.index}
                  piece={piece}
                  font={fittedFont}
                  color={tint}
                  progress={exit}
                  mode="out"
                  span={exitSpan}
                  stagger={stagger}
                  duration={duration}
                  rise={rise}
                  blurMax={blurMax}
                  baseline={baseline}
                />
              ))}
            </Group>
          )}
          <Group key={`c${layers.current.key}`} transform={[{ translateX: offsetFor(currentLayout?.width ?? 0) }]}>
            {currentLayout?.pieces.map((piece) => (
              <BlurPiece
                key={piece.index}
                piece={piece}
                font={fittedFont}
                color={tint}
                progress={enter}
                mode="in"
                span={enterSpan}
                stagger={stagger}
                duration={duration}
                rise={rise}
                blurMax={blurMax}
                baseline={baseline}
              />
            ))}
          </Group>
        </Canvas>
      )}
    </View>
  );
}

type BlurPieceProps = {
  piece: Piece;
  font: SkFont;
  color: string;
  progress: SharedValue<number>;
  mode: "in" | "out";
  span: number;
  stagger: number;
  duration: number;
  rise: number;
  blurMax: number;
  baseline: number;
};

function BlurPiece({ piece, font, color, progress, mode, span, stagger, duration, rise, blurMax, baseline }: BlurPieceProps) {
  const local = useDerivedValue(() => {
    const elapsed = progress.value * span - piece.index * stagger;
    const linear = Math.min(1, Math.max(0, elapsed / duration));
    const eased = 1 - Math.pow(1 - linear, 3);
    return mode === "in" ? eased : 1 - eased;
  });
  const opacity = useDerivedValue(() => local.value);
  const blur = useDerivedValue(() => Math.max(0.001, blurMax * (1 - local.value)));
  const transform = useDerivedValue(() => [
    { translateY: (mode === "in" ? rise : -rise * 0.8) * (1 - local.value) },
  ]);

  return (
    <Group opacity={opacity} transform={transform}>
      <SkiaText x={piece.x} y={baseline} text={piece.value} font={font} color={color}>
        <BlurMask blur={blur} style="normal" />
      </SkiaText>
    </Group>
  );
}
