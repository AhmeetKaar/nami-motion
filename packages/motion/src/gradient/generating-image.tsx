import type { ReactNode } from "react";
import { Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";
import { ShimmerText } from "../text/shimmer-text";
import { useMotionPalette } from "../theme/provider";
import type { MotionPalette } from "../theme/palette";
import { ShimmerBand } from "./shimmer-band";

export type GeneratingImageProps = {
  generating: boolean;
  label: string;
  doneLabel?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  placeholderIcon?: ReactNode;
  labelAccessory?: ReactNode;
  duration?: number;
  labelStyle?: StyleProp<TextStyle>;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

const DEFAULT_LABEL_STYLE: TextStyle = { fontSize: 16, lineHeight: 21, fontWeight: "600" };

export function GeneratingImage({
  generating,
  label,
  doneLabel,
  width = 220,
  height = 220,
  borderRadius = 20,
  placeholderIcon,
  labelAccessory,
  duration = 1400,
  labelStyle = DEFAULT_LABEL_STYLE,
  colors,
  style,
  children,
}: GeneratingImageProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();

  return (
    <View style={[{ gap: 10 }, style]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      {generating ? (
        <ShimmerText
          text={label}
          activeColor={palette.text}
          mutedColor={palette.textTertiary}
          textStyle={labelStyle}
          duration={duration}
        />
      ) : doneLabel ? (
        <Text style={[labelStyle, { color: palette.textTertiary }]}>{doneLabel}</Text>
      ) : null}
      {labelAccessory}
      </View>
      {generating ? (
        <ShimmerBand
          backgroundColor={palette.surface}
          highlightColor={palette.card}
          highlightOpacity={0.9}
          duration={duration}
          style={{ width, height, borderRadius, alignItems: "center", justifyContent: "center" }}
        >
          {placeholderIcon}
        </ShimmerBand>
      ) : (
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(450)}
          style={{ width, height, borderRadius, overflow: "hidden", backgroundColor: palette.surface }}
        >
          {children}
        </Animated.View>
      )}
    </View>
  );
}
