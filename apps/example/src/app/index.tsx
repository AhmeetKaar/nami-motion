import { useEffect, useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View, useColorScheme } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  FadeOut,
  LinearTransition,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { StatusRow, ThinkingBlock } from "nami-motion/chat";
import { Skeleton } from "nami-motion/feedback";
import { DrawerReveal, SwipeActions, SwipeActionsGroup, type SwipeAction } from "nami-motion/gestures";
import { ShimmerBand } from "nami-motion/gradient";
import { MatrixOrb, RemainingRing, VoiceWave, type MatrixOrbState } from "nami-motion/skia";
import { ShimmerText } from "nami-motion/text";

const ORB_STATES: MatrixOrbState[] = ["idle", "listening", "thinking"];
const CHATS = ["Trip planning", "Paper summary", "Weekly groceries", "Bug triage"];

function usePalette() {
  const dark = useColorScheme() === "dark";
  return {
    background: dark ? "#000000" : "#F2F2F7",
    card: dark ? "#1C1C1E" : "#FFFFFF",
    surface: dark ? "#2C2C2E" : "#E5E5EA",
    text: dark ? "#FFFFFF" : "#000000",
    secondary: dark ? "#A1A1A6" : "#6C6C70",
    tertiary: dark ? "#636366" : "#AEAEB2",
  };
}

function Demo({ title, children, onPress, hint }: { title: string; children: ReactNode; onPress?: () => void; hint?: string }) {
  const palette = usePalette();
  return (
    <Pressable
      onPress={onPress}
      style={{ padding: 16, gap: 14, borderRadius: 20, borderCurve: "continuous", backgroundColor: palette.card }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: palette.text }}>{title}</Text>
        {hint ? <Text style={{ fontSize: 13, color: palette.secondary }}>{hint}</Text> : null}
      </View>
      {children}
    </Pressable>
  );
}

function ActionLabel({ label }: { label: string }) {
  return <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "600" }}>{label}</Text>;
}

function SwipeActionsDemo() {
  const palette = usePalette();
  const [chats, setChats] = useState(CHATS);
  const [pinned, setPinned] = useState<string[]>([]);

  const remove = (title: string) => setChats((items) => items.filter((item) => item !== title));
  const togglePin = (title: string) =>
    setPinned((items) => (items.includes(title) ? items.filter((item) => item !== title) : [...items, title]));

  return (
    <Demo title="Swipe Actions" hint="Tap to reset" onPress={() => setChats(CHATS)}>
      <SwipeActionsGroup>
        <View style={{ borderRadius: 14, borderCurve: "continuous", overflow: "hidden" }}>
          {chats.map((title) => {
            const leftActions: SwipeAction[] = [
              {
                key: "pin",
                accessibilityLabel: pinned.includes(title) ? "Unpin" : "Pin",
                backgroundColor: "#FF9F0A",
                onPress: () => togglePin(title),
                children: <ActionLabel label={pinned.includes(title) ? "Unpin" : "Pin"} />,
              },
            ];
            const rightActions: SwipeAction[] = [
              {
                key: "delete",
                accessibilityLabel: "Delete",
                backgroundColor: "#FF3B30",
                onPress: () => remove(title),
                children: <ActionLabel label="Delete" />,
              },
              {
                key: "archive",
                accessibilityLabel: "Archive",
                backgroundColor: "#8E8E93",
                onPress: () => remove(title),
                children: <ActionLabel label="Archive" />,
              },
            ];
            return (
              <Animated.View key={title} exiting={FadeOut.duration(160)} layout={LinearTransition}>
                <SwipeActions
                  leftActions={leftActions}
                  rightActions={rightActions}
                  onThreshold={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                  contentStyle={{ backgroundColor: palette.surface }}
                >
                  <View style={{ paddingHorizontal: 14, paddingVertical: 14, flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 15, color: palette.text }}>{title}</Text>
                    {pinned.includes(title) ? <Text style={{ fontSize: 13, color: palette.secondary }}>Pinned</Text> : null}
                  </View>
                </SwipeActions>
              </Animated.View>
            );
          })}
        </View>
      </SwipeActionsGroup>
    </Demo>
  );
}

export default function GalleryScreen() {
  const palette = usePalette();
  const [streaming, setStreaming] = useState(true);
  const [orbIndex, setOrbIndex] = useState(0);
  const [progress, setProgress] = useState(0.35);
  const level = useSharedValue(0);
  const drawer = useSharedValue(0);

  useEffect(() => {
    level.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 420, easing: Easing.out(Easing.quad) }),
        withTiming(0.15, { duration: 520, easing: Easing.in(Easing.quad) }),
      ),
      -1,
    );
  }, [level]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
    >
      <Demo title="Shimmer Text">
        <ShimmerText text="Generating a response" activeColor={palette.text} mutedColor={palette.tertiary} />
      </Demo>
      <Demo title="Skeleton">
        <View style={{ gap: 8 }}>
          <Skeleton color={palette.surface} width="80%" />
          <Skeleton color={palette.surface} width="55%" />
        </View>
      </Demo>
      <Demo title="Shimmer Band">
        <ShimmerBand
          backgroundColor={palette.surface}
          highlightColor={palette.text}
          style={{ height: 160, borderRadius: 16 }}
        />
      </Demo>
      <Demo title="Status Row">
        <StatusRow
          label="Searching the web"
          color={palette.secondary}
          icon={<View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: palette.text }} />}
        />
      </Demo>
      <Demo title="Thinking Block" hint="Tap to toggle" onPress={() => setStreaming((value) => !value)}>
        <ThinkingBlock
          reasoning="The user wants a summary of the paper, so I should start with the abstract."
          isStreaming={streaming}
          thinkingLabel="Thinking"
          formatDoneLabel={(seconds) => (seconds ? `Thought for ${seconds}s` : "Thought")}
          colors={{ text: palette.text, textSecondary: palette.secondary, textTertiary: palette.tertiary, pressed: palette.surface }}
        />
      </Demo>
      <Demo title="Voice Wave">
        <VoiceWave level={level} colors={["#7C5CFF", "#4CC9F0", "#F72585"]} />
      </Demo>
      <Demo title="Remaining Ring" hint="Tap to change" onPress={() => setProgress((value) => (value > 0.8 ? 0.1 : value + 0.25))}>
        <RemainingRing size={44} progress={progress} trackColor={palette.surface} color={palette.text} />
      </Demo>
      <Demo title="Matrix Orb" hint={ORB_STATES[orbIndex]} onPress={() => setOrbIndex((value) => (value + 1) % ORB_STATES.length)}>
        <View style={{ alignItems: "center" }}>
          <MatrixOrb state={ORB_STATES[orbIndex]} size={140} color={palette.text} />
        </View>
      </Demo>
      <Demo
        title="Drawer Reveal"
        hint="Tap to toggle"
        onPress={() => {
          drawer.value = withTiming(drawer.value > 0.5 ? 0 : 1, { duration: 360 });
        }}
      >
        <DrawerReveal progress={drawer} style={{ gap: 8 }}>
          <Skeleton color={palette.surface} width="70%" />
          <Skeleton color={palette.surface} width="45%" />
          <Skeleton color={palette.surface} width="60%" />
        </DrawerReveal>
      </Demo>
      <SwipeActionsDemo />
    </ScrollView>
  );
}
