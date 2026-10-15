import { useEffect, useState, type ReactNode } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  ZoomIn,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useMotionPalette } from "../theme/provider";
import type { MotionPalette } from "../theme/palette";

export type AttachmentPickerSource = {
  key: string;
  label: string;
  icon: ReactNode;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
};

export type AttachmentPickerPhoto = {
  key: string;
  preview: ReactNode;
  accessibilityLabel?: string;
};

export type AttachmentPickerProps = {
  open: boolean;
  sources: AttachmentPickerSource[];
  photos?: AttachmentPickerPhoto[];
  selectedKeys?: string[];
  onTogglePhoto?: (key: string) => void;
  columns?: number;
  bottomInset?: number;
  header?: ReactNode;
  footer?: ReactNode;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

const OPEN_DURATION = 420;
const CLOSE_DURATION = 300;
const PHOTO_GAP = 4;

export function AttachmentPicker({
  open,
  sources,
  photos = [],
  selectedKeys = [],
  onTogglePhoto,
  columns = 4,
  bottomInset = 12,
  header,
  footer,
  colors,
  style,
}: AttachmentPickerProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const [height, setHeight] = useState(0);
  const [gridWidth, setGridWidth] = useState(0);
  const progress = useSharedValue(open ? 1 : 0);

  useEffect(() => {
    const target = open ? 1 : 0;
    progress.value = reduceMotion
      ? target
      : withTiming(target, { duration: open ? OPEN_DURATION : CLOSE_DURATION, easing: Easing.out(Easing.cubic) });
  }, [open, progress, reduceMotion]);

  const outerStyle = useAnimatedStyle(() => ({ height: progress.value * height }));
  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(progress.value, [0, 1], [40, 0]) }],
  }));
  const tileSize = gridWidth > 0 ? (gridWidth - PHOTO_GAP * (columns - 1)) / columns : 0;

  return (
    <Animated.View
      pointerEvents={open ? "auto" : "none"}
      accessibilityElementsHidden={!open}
      importantForAccessibility={open ? "auto" : "no-hide-descendants"}
      style={[{ overflow: "hidden" }, outerStyle]}
    >
      <Animated.View
        onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            paddingTop: 14,
            paddingHorizontal: 12,
            paddingBottom: bottomInset,
            gap: 12,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderCurve: "continuous",
            backgroundColor: palette.card,
          },
          innerStyle,
          style,
        ]}
      >
        {header}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {sources.map((source) => (
            <Pressable
              key={source.key}
              accessibilityRole="button"
              accessibilityLabel={source.label}
              accessibilityState={{ disabled: source.disabled }}
              disabled={source.disabled}
              onPress={source.onPress}
              style={({ pressed }) => ({
                flex: 1,
                height: 64,
                gap: 6,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 16,
                borderCurve: "continuous",
                opacity: source.disabled ? 0.4 : 1,
                backgroundColor: source.active || pressed ? palette.raised : palette.surface,
              })}
            >
              {source.icon}
              <Text style={{ fontSize: 13, fontWeight: "500", color: palette.text }}>{source.label}</Text>
            </Pressable>
          ))}
        </View>
        {photos.length ? (
          <View
            onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}
            style={{ flexDirection: "row", flexWrap: "wrap", gap: PHOTO_GAP }}
          >
            {tileSize > 0
              ? photos.map((photo) => {
                  const order = selectedKeys.indexOf(photo.key);
                  return (
                    <Pressable
                      key={photo.key}
                      accessibilityRole="button"
                      accessibilityLabel={photo.accessibilityLabel}
                      accessibilityState={{ selected: order >= 0 }}
                      onPress={() => onTogglePhoto?.(photo.key)}
                      style={{
                        width: tileSize,
                        height: tileSize,
                        borderRadius: 10,
                        overflow: "hidden",
                        backgroundColor: palette.surface,
                      }}
                    >
                      {photo.preview}
                      {order >= 0 ? (
                        <Animated.View
                          entering={reduceMotion ? undefined : ZoomIn.duration(200)}
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 2,
                            borderColor: "#FFFFFF",
                            backgroundColor: palette.accent,
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: "700", color: palette.accentContrast }}>
                            {order + 1}
                          </Text>
                        </Animated.View>
                      ) : null}
                    </Pressable>
                  );
                })
              : null}
          </View>
        ) : null}
        {footer}
      </Animated.View>
    </Animated.View>
  );
}

export type PlusToggleProps = {
  open: boolean;
  children: ReactNode;
  onPress?: () => void;
  onPressIn?: () => void;
  size?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function PlusToggle({
  open,
  children,
  onPress,
  onPressIn,
  size = 40,
  accessibilityLabel,
  style,
}: PlusToggleProps) {
  const reduceMotion = useReducedMotion();
  const turn = useSharedValue(open ? 1 : 0);

  useEffect(() => {
    turn.value = reduceMotion ? (open ? 1 : 0) : withTiming(open ? 1 : 0, { duration: 300, easing: Easing.out(Easing.cubic) });
  }, [open, reduceMotion, turn]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 45}deg` }] }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ expanded: open }}
      onPress={onPress}
      onPressIn={onPressIn}
      hitSlop={6}
      style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}
    >
      <Animated.View style={iconStyle}>{children}</Animated.View>
    </Pressable>
  );
}
