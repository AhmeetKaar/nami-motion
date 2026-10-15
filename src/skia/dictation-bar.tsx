import type { ReactNode } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { CheckGlyph, CrossGlyph } from "../internal/glyphs";
import { withAlpha } from "../internal/color";
import { useMotionPalette } from "../theme/provider";
import type { MotionPalette } from "../theme/palette";
import { RemainingRing } from "./remaining-ring";
import { VoiceWave } from "./voice-wave";

export type DictationBarProps = {
  level: SharedValue<number>;
  elapsedSeconds: number;
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelIcon?: ReactNode;
  confirmIcon?: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  caption?: string;
  limitProgress?: number;
  limitWarningAt?: number;
  disabled?: boolean;
  waveColors?: [string, string, string];
  waveVariant?: "wave" | "bars";
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

function formatElapsed(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

export function DictationBar({
  level,
  elapsedSeconds,
  onCancel,
  onConfirm,
  cancelIcon,
  confirmIcon,
  cancelLabel = "Cancel recording",
  confirmLabel = "Use recording",
  caption,
  limitProgress,
  limitWarningAt = 0.85,
  disabled = false,
  waveColors,
  waveVariant = "wave",
  colors,
  style,
}: DictationBarProps) {
  const palette = useMotionPalette(colors);
  const confirm = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={confirmLabel}
      disabled={disabled}
      onPress={onConfirm}
      style={({ pressed }) => ({
        width: limitProgress === undefined ? 40 : 36,
        height: limitProgress === undefined ? 40 : 36,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: palette.text,
        opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
      })}
    >
      {confirmIcon ?? <CheckGlyph size={14} color={palette.card} />}
    </Pressable>
  );
  const button = { width: 40, height: 40, borderRadius: 20, alignItems: "center" as const, justifyContent: "center" as const };

  return (
    <View
      style={[
        { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 8, height: 56, borderRadius: 28, backgroundColor: palette.surface },
        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={cancelLabel}
        disabled={disabled}
        onPress={onCancel}
        style={({ pressed }) => [button, { backgroundColor: palette.card, opacity: disabled ? 0.5 : pressed ? 0.6 : 1 }]}
      >
        {cancelIcon ?? <CrossGlyph size={13} color={palette.text} />}
      </Pressable>
      <VoiceWave
        level={level}
        variant={waveVariant}
        colors={waveColors ?? (waveVariant === "bars" ? [palette.textSecondary, palette.textSecondary, palette.text] : [palette.accent, "#3FC1F5", "#88C9F7"])}
      />
      <Text style={{ fontSize: 15, fontVariant: ["tabular-nums"], color: palette.textSecondary }}>{caption ?? formatElapsed(elapsedSeconds)}</Text>
      {limitProgress === undefined ? confirm : (
        <RemainingRing
          size={48}
          strokeWidth={3}
          progress={limitProgress}
          trackColor={withAlpha(palette.text, 0.08)}
          color={limitProgress >= limitWarningAt ? palette.danger : palette.accent}
        >
          {confirm}
        </RemainingRing>
      )}
    </View>
  );
}
