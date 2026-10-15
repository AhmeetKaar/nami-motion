import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { CrossGlyph } from "../internal/glyphs";
import { useMotionPalette } from "../theme/provider";
import type { MotionPalette } from "../theme/palette";
import { RemainingRing } from "./remaining-ring";

export type AttachmentTileProps = {
  kind: "image" | "file";
  name: string;
  progress?: number;
  uploading?: boolean;
  detail?: string;
  preview?: ReactNode;
  fileIcon?: ReactNode;
  fileColor?: string;
  onRemove?: () => void;
  removeIcon?: ReactNode;
  removeLabel?: string;
  size?: number;
  variant?: "card" | "chip";
  progressPlacement?: "center" | "corner";
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

export function AttachmentTile({
  kind,
  name,
  progress,
  uploading: uploadingProp,
  detail,
  preview,
  fileIcon,
  fileColor,
  onRemove,
  removeIcon,
  removeLabel,
  size = 64,
  variant = "card",
  progressPlacement = "center",
  colors,
  style,
}: AttachmentTileProps) {
  const palette = useMotionPalette(colors);
  const uploading = uploadingProp ?? (progress !== undefined && progress < 1);
  const indicator = (ringSize: number, track: string) =>
    progress === undefined ? (
      <ActivityIndicator color="#FFFFFF" />
    ) : (
      <RemainingRing size={ringSize} strokeWidth={3} progress={progress} trackColor={track} color="#FFFFFF" />
    );
  const remove = onRemove ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={removeLabel ?? `Remove ${name}`}
      hitSlop={8}
      onPress={onRemove}
      style={{
        position: "absolute",
        top: -6,
        right: -6,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: palette.text,
        borderWidth: 2,
        borderColor: palette.card,
      }}
    >
      {removeIcon ?? <CrossGlyph size={8} color={palette.card} />}
    </Pressable>
  ) : null;

  if (kind === "image") {
    return (
      <View accessible accessibilityLabel={name} style={[{ width: size, height: size }, style]}>
        <View style={{ flex: 1, borderRadius: 14, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: palette.surface }}>
          <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}>{preview}</View>
          {uploading && progressPlacement === "center" ? (
            <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0,0,0,0.35)" }} />
          ) : null}
          {uploading && progressPlacement === "center" ? indicator(size * 0.44, "rgba(255,255,255,0.3)") : null}
          {uploading && progressPlacement === "corner" ? (
            <View
              style={{
                position: "absolute",
                right: 5,
                bottom: 5,
                width: size * 0.36,
                height: size * 0.36,
                borderRadius: size,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.55)",
              }}
            >
              {indicator(size * 0.28, "rgba(255,255,255,0.3)")}
            </View>
          ) : null}
        </View>
        {remove}
      </View>
    );
  }

  const tint = fileColor ?? palette.danger;
  if (variant === "chip") {
    return (
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            height: 36,
            paddingLeft: 6,
            paddingRight: onRemove ? 6 : 12,
            borderRadius: 18,
            backgroundColor: palette.surface,
          },
          style,
        ]}
      >
        <View style={{ width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: tint }}>
          {uploading ? indicator(20, "rgba(255,255,255,0.35)") : fileIcon}
        </View>
        <Text numberOfLines={1} style={{ maxWidth: 160, fontSize: 14, fontWeight: "500", color: palette.text }}>
          {name}
        </Text>
        {detail ? <Text style={{ fontSize: 12, color: palette.textSecondary }}>{detail}</Text> : null}
        {onRemove ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={removeLabel ?? `Remove ${name}`}
            hitSlop={8}
            onPress={onRemove}
            style={{ width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" }}
          >
            {removeIcon ?? <CrossGlyph size={9} color={palette.textSecondary} />}
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[{ height: size, width: size * 2.7 }, style]}>
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, borderRadius: 14, backgroundColor: palette.surface }}>
        <View style={{ width: size * 0.56, height: size * 0.56, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: tint }}>
          {uploading ? (
            indicator(size * 0.38, "rgba(255,255,255,0.35)")
          ) : (
            fileIcon
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontSize: 14, lineHeight: 18, fontWeight: "600", color: palette.text }}>
            {name}
          </Text>
          {detail ? (
            <Text numberOfLines={1} style={{ fontSize: 12, lineHeight: 16, color: palette.textSecondary }}>
              {detail}
            </Text>
          ) : null}
        </View>
      </View>
      {remove}
    </View>
  );
}
