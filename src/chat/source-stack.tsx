import type { ReactNode } from "react";
import { Pressable, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import Animated, { FadeIn, ZoomIn, useReducedMotion } from "react-native-reanimated";
import { useMotionPalette } from "../theme/provider";
import type { MotionPalette } from "../theme/palette";

export type SourceStackItem = {
  key: string;
  label: string;
  icon?: ReactNode;
};

export type SourceStackProps = {
  sources: SourceStackItem[];
  label: string;
  renderIcon?: (source: SourceStackItem) => ReactNode;
  onPress?: () => void;
  onPressIn?: () => void;
  limit?: number;
  size?: number;
  overlap?: number;
  ringColor?: string;
  stagger?: number;
  labelStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

export function SourceStack({
  sources,
  label,
  renderIcon,
  onPress,
  onPressIn,
  limit = 4,
  size = 14,
  overlap = 5,
  ringColor,
  stagger = 70,
  labelStyle,
  accessibilityLabel,
  colors,
  style,
}: SourceStackProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const ring = ringColor ?? palette.background;
  const visible = sources.slice(0, limit);

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={!onPress}
      onPress={onPress}
      onPressIn={onPressIn}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "flex-start",
          gap: 6,
          marginLeft: -6,
          paddingHorizontal: 6,
          paddingVertical: 4,
          borderRadius: 8,
          backgroundColor: pressed ? palette.surface : "transparent",
        },
        style,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {visible.map((source, index) => (
          <Animated.View
            key={source.key}
            entering={reduceMotion ? undefined : ZoomIn.delay(index * stagger).springify().damping(16)}
            style={{
              width: size + 3,
              height: size + 3,
              marginLeft: index === 0 ? 0 : -overlap,
              borderRadius: (size + 3) / 2,
              borderWidth: 1.5,
              borderColor: ring,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: palette.card,
              zIndex: visible.length - index,
            }}
          >
            {source.icon ?? renderIcon?.(source) ?? (
              <Text style={{ fontSize: size * 0.6, fontWeight: "700", color: palette.textSecondary }}>
                {source.label.slice(0, 1).toUpperCase()}
              </Text>
            )}
          </Animated.View>
        ))}
      </View>
      <Animated.Text
        entering={reduceMotion ? undefined : FadeIn.delay(visible.length * stagger).duration(220)}
        style={[{ fontSize: 13, lineHeight: 18, color: palette.textSecondary }, labelStyle]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}
