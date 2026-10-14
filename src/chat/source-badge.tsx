import type { ReactNode } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useMotionPalette } from "../theme/provider";
import type { MotionPalette } from "../theme/palette";

export type SourceBadgeProps = {
  label: string;
  icon?: ReactNode;
  onPress?: () => void;
  baselineOffset?: number;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

export function SourceBadge({ label, icon, onPress, baselineOffset = 3, colors, style }: SourceBadgeProps) {
  const palette = useMotionPalette(colors);
  return (
    <Pressable
      accessibilityRole={onPress ? "link" : "text"}
      accessibilityLabel={`Source ${label}`}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          transform: [{ translateY: baselineOffset }],
          paddingHorizontal: 7,
          paddingVertical: 2,
          borderRadius: 8,
          backgroundColor: pressed ? palette.raised : palette.surface,
        },
        style,
      ]}
    >
      {icon ? <View>{icon}</View> : null}
      <Text style={{ fontSize: 12, lineHeight: 15, fontWeight: "600", color: palette.textSecondary }}>{label}</Text>
    </Pressable>
  );
}
