import { useEffect, type ReactNode } from "react";
import { Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { formatElapsed, useElapsed } from "../internal/use-elapsed";
import { ShimmerText } from "../text/shimmer-text";
import { type MotionPalette } from "../theme/palette";
import { useMotionPalette } from "../theme/provider";

const DEFAULT_TEXT_STYLE: TextStyle = { fontSize: 14, lineHeight: 20, fontWeight: "500" };

export type StatusRowIconMotion = "pulse" | "spin" | "none";

export type StatusRowProps = {
  label: string;
  icon?: ReactNode;
  iconMotion?: StatusRowIconMotion;
  iconSize?: number;
  active?: boolean;
  startedAt?: number;
  showTimer?: boolean;
  formatTimer?: (seconds: number) => string;
  textStyle?: StyleProp<TextStyle>;
  timerStyle?: StyleProp<TextStyle>;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

export function StatusRow({
  label,
  icon,
  iconMotion = "pulse",
  iconSize = 18,
  active = true,
  startedAt,
  showTimer = true,
  formatTimer = formatElapsed,
  textStyle = DEFAULT_TEXT_STYLE,
  timerStyle,
  colors,
  style,
}: StatusRowProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const seconds = useElapsed(startedAt, active);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: active }}
      style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, style]}
    >
      <StatusIcon size={iconSize} motion={active && !reduceMotion ? iconMotion : "none"}>
        {icon ?? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: palette.accent }} />}
      </StatusIcon>
      <View style={{ flexShrink: 1, overflow: "hidden" }}>
        <Animated.View
          key={label}
          entering={reduceMotion ? undefined : FadeInDown.duration(240)}
          exiting={reduceMotion ? undefined : FadeOutUp.duration(180)}
        >
          {active ? (
            <ShimmerText
              text={label}
              activeColor={palette.text}
              mutedColor={palette.textTertiary}
              textStyle={textStyle}
            />
          ) : (
            <Text style={[textStyle, { color: palette.textSecondary }]}>{label}</Text>
          )}
        </Animated.View>
      </View>
      {showTimer && startedAt !== undefined && (
        <Text style={[textStyle, { color: palette.textTertiary, fontVariant: ["tabular-nums"] }, timerStyle]}>
          {formatTimer(seconds)}
        </Text>
      )}
    </View>
  );
}

function StatusIcon({ size, motion, children }: { size: number; motion: StatusRowIconMotion; children: ReactNode }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(progress);
    progress.value = 0;
    if (motion === "pulse") {
      const curve = Easing.inOut(Easing.sin);
      progress.value = withRepeat(
        withSequence(withTiming(1, { duration: 700, easing: curve }), withTiming(0, { duration: 700, easing: curve })),
        -1,
        false,
      );
    } else if (motion === "spin") {
      progress.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.linear }), -1, false);
    }
    return () => cancelAnimation(progress);
  }, [motion, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    if (motion === "pulse") {
      return { opacity: 0.45 + progress.value * 0.55, transform: [{ scale: 0.88 + progress.value * 0.12 }] };
    }
    if (motion === "spin") return { opacity: 1, transform: [{ rotate: `${progress.value * 360}deg` }] };
    return { opacity: 1, transform: [] };
  });

  return (
    <Animated.View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
