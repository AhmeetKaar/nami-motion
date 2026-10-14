import type { ReactNode } from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useMotionPalette } from "../theme/provider";
import type { MotionPalette } from "../theme/palette";

export type TraceStep = {
  key: string;
  label: string;
  detail?: string;
  status?: "done" | "active" | "pending";
  icon?: ReactNode;
};

export type TraceStepsProps = {
  steps: TraceStep[];
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

export function TraceSteps({ steps, colors, style }: TraceStepsProps) {
  const palette = useMotionPalette(colors);

  return (
    <View style={style}>
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        const dot =
          step.status === "active" ? palette.accent : step.status === "pending" ? palette.surface : palette.textTertiary;
        return (
          <View key={step.key} style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ width: 14, alignItems: "center" }}>
              <View style={{ height: 18, justifyContent: "center" }}>
                {step.icon ?? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} />}
              </View>
              {last ? null : <View style={{ flex: 1, width: 1, minHeight: 6, backgroundColor: palette.surface }} />}
            </View>
            <View style={{ flex: 1, paddingBottom: last ? 0 : 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 18,
                  color: step.status === "pending" ? palette.textTertiary : palette.textSecondary,
                }}
              >
                {step.label}
              </Text>
              {step.detail ? (
                <Text style={{ fontSize: 12, lineHeight: 16, color: palette.textTertiary }}>{step.detail}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
