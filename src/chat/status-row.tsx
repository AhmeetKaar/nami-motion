import { useEffect, type ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  FadeOutUp,
  LinearTransition,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { CheckGlyph } from "../internal/glyphs";
import { ShimmerText } from "../text/shimmer-text";
import { useMotionPalette } from "../theme/provider";
import type { MotionPalette } from "../theme/palette";

const PULSE_MIN = 0.4;
const DEFAULT_DURATION = 700;
const SHIMMER_DURATION = 1600;
const DEFAULT_ICON_SIZE = 16;
const DEFAULT_LOGO = require("../assets/nami-logo.png");
const LABEL_OPACITY = 0.7;

const DEFAULT_LABEL_STYLE: TextStyle = {
  fontSize: 16,
  lineHeight: 24,
};

export type StatusRowProps = {
  label: string;
  color?: string;
  icon?: ReactNode | null;
  iconSize?: number;
  labelStyle?: StyleProp<TextStyle>;
  duration?: number;
  effect?: "shimmer" | "pulse";
  variant?: "inline" | "card";
  trailing?: ReactNode;
  history?: string[];
  historyIcon?: ReactNode;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

function lineHeightOf(style: StyleProp<TextStyle>) {
  const flat = StyleSheet.flatten(style) ?? {};
  return flat.lineHeight ?? Math.round((flat.fontSize ?? 16) * 1.4);
}

export function StatusRow({
  label,
  color,
  icon,
  iconSize = DEFAULT_ICON_SIZE,
  labelStyle = DEFAULT_LABEL_STYLE,
  duration,
  effect = "shimmer",
  variant = "inline",
  trailing,
  history,
  historyIcon,
  colors,
  style,
}: StatusRowProps) {
  const palette = useMotionPalette(colors);
  const labelColor = color ?? palette.text;
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(effect === "pulse" ? PULSE_MIN : 1);
  const lineHeight = lineHeightOf(labelStyle);
  const card = variant === "card";
  const resolvedIcon =
    icon === undefined ? (
      <Image
        source={DEFAULT_LOGO}
        accessibilityIgnoresInvertColors
        style={{ width: iconSize, height: iconSize, borderRadius: iconSize * 0.25 }}
      />
    ) : (
      icon
    );

  useEffect(() => {
    if (effect !== "pulse" || reduceMotion) {
      opacity.value = 1;
      return;
    }
    opacity.value = PULSE_MIN;
    opacity.value = withRepeat(
      withTiming(1, { duration: duration ?? DEFAULT_DURATION, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [duration, effect, opacity, reduceMotion]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const enter = reduceMotion ? undefined : FadeInUp.duration(260);
  const historyEnter = reduceMotion ? undefined : FadeInDown.duration(240);
  const exit = reduceMotion ? undefined : FadeOutUp.duration(180);
  const layout = reduceMotion ? undefined : LinearTransition.duration(220);
  const flatLabel = StyleSheet.flatten(labelStyle) ?? {};

  const current = (
    <Animated.View
      accessible
      accessibilityRole="text"
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: card ? 10 : 8,
          paddingVertical: card ? 12 : 4,
          paddingHorizontal: card ? 14 : 0,
        },
        card && {
          borderRadius: 14,
          borderCurve: "continuous",
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: palette.surface,
          backgroundColor: palette.card,
        },
        effect === "pulse" ? pulseStyle : null,
      ]}
    >
      {resolvedIcon ? <View style={{ width: iconSize, height: iconSize }}>{resolvedIcon}</View> : null}
      <View style={{ flexGrow: card ? 1 : 0, flexShrink: card ? 1 : 0, minHeight: lineHeight, justifyContent: "center" }}>
        <Animated.View
          key={label}
          entering={enter}
          exiting={exit}
        >
          {effect === "shimmer" ? (
            <ShimmerText
              text={label}
              activeColor={labelColor}
              mutedColor={palette.textTertiary}
              textStyle={labelStyle}
              duration={duration ?? SHIMMER_DURATION}
            />
          ) : (
            <Text numberOfLines={1} style={[labelStyle, { color: labelColor, opacity: LABEL_OPACITY }]}>
              {label}
            </Text>
          )}
        </Animated.View>
      </View>
      {card ? (trailing ?? <ActivityIndicator size="small" color={palette.textSecondary} />) : trailing}
    </Animated.View>
  );

  if (!history || history.length === 0) {
    return <View style={style}>{current}</View>;
  }

  const rowSize = Math.max(iconSize, 14);
  const historyLine = Math.round((flatLabel.fontSize ?? 16) * 1.3);

  return (
    <Animated.View layout={layout} style={style}>
      {history.map((step, index) => (
        <Animated.View
          key={`${index}-${step}`}
          entering={historyEnter}
          layout={layout}
          style={{ flexDirection: "row", gap: card ? 10 : 8, paddingHorizontal: card ? 14 : 0 }}
        >
          <View style={{ width: rowSize, alignItems: "center" }}>
            <View style={{ height: historyLine, justifyContent: "center" }}>
              {historyIcon ?? <CheckGlyph size={12} color={palette.textTertiary} />}
            </View>
            <View style={{ flex: 1, width: StyleSheet.hairlineWidth * 2, minHeight: 6, backgroundColor: palette.surface }} />
          </View>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              paddingBottom: 6,
              fontSize: (flatLabel.fontSize ?? 16) - 2,
              lineHeight: historyLine,
              fontFamily: flatLabel.fontFamily,
              color: palette.textSecondary,
            }}
          >
            {step}
          </Text>
        </Animated.View>
      ))}
      {current}
    </Animated.View>
  );
}
