import { useEffect, useRef, useState, type ReactNode } from "react";
import { Text, View, useColorScheme } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  Easing,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { StatusRow, ThinkingBlock } from "nami-motion/chat";
import { Skeleton } from "nami-motion/feedback";
import {
  DrawerReveal,
  SwipeActions,
  SwipeActionsGroup,
  type SwipeActionsHandle,
} from "nami-motion/gestures";
import { ShimmerBand } from "nami-motion/gradient";
import { MatrixOrb, RemainingRing, VoiceWave, type MatrixOrbState } from "nami-motion/skia";
import { ShimmerText } from "nami-motion/text";

const ORB_STATES: MatrixOrbState[] = ["idle", "listening", "thinking"];

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

function useTicker(interval: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((value) => value + 1), interval);
    return () => clearInterval(id);
  }, [interval]);
  return tick;
}

function Card({ children }: { children: ReactNode }) {
  const palette = usePalette();
  return (
    <View
      style={{
        width: "100%",
        padding: 20,
        gap: 16,
        borderRadius: 24,
        borderCurve: "continuous",
        backgroundColor: palette.card,
      }}
    >
      {children}
    </View>
  );
}

const STREAM_ANSWER =
  "The paper shows that small models trained on carefully filtered data can match much larger ones on reasoning tasks. Most of the gain comes from the filtering step, not from extra compute.";
const STREAM_WORDS = STREAM_ANSWER.split(" ");
const STREAM_READING_MS = 2400;
const STREAM_WORD_MS = 130;
const STREAM_HOLD_MS = 3000;

function useStreamingCycle() {
  const [words, setWords] = useState(-1);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    setWords(-1);
    timers.push(setTimeout(() => setWords(0), STREAM_READING_MS));
    STREAM_WORDS.forEach((_, index) => {
      timers.push(setTimeout(() => setWords(index + 1), STREAM_READING_MS + (index + 1) * STREAM_WORD_MS));
    });
    const total = STREAM_READING_MS + STREAM_WORDS.length * STREAM_WORD_MS + STREAM_HOLD_MS;
    timers.push(setTimeout(() => setCycle((value) => value + 1), total));
    return () => timers.forEach(clearTimeout);
  }, [cycle]);

  if (words < 0) return { phase: "reading" as const, text: "" };
  if (words < STREAM_WORDS.length) return { phase: "streaming" as const, text: STREAM_WORDS.slice(0, words).join(" ") };
  return { phase: "done" as const, text: STREAM_ANSWER };
}

function ShimmerTextShowcase() {
  const palette = usePalette();
  const { phase, text } = useStreamingCycle();
  const doneSeconds = Math.round((STREAM_READING_MS + STREAM_WORDS.length * STREAM_WORD_MS) / 1000);

  return (
    <View
      style={{
        width: "100%",
        height: 330,
        padding: 20,
        gap: 18,
        borderRadius: 24,
        borderCurve: "continuous",
        backgroundColor: palette.card,
      }}
    >
      <View
        style={{
          alignSelf: "flex-end",
          maxWidth: "80%",
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 20,
          borderCurve: "continuous",
          backgroundColor: palette.surface,
        }}
      >
        <Text style={{ fontSize: 16, lineHeight: 21, color: palette.text }}>Summarize this paper in two sentences.</Text>
      </View>
      <View style={{ gap: 8 }}>
        {phase === "done" ? (
          <Text style={{ fontSize: 17, lineHeight: 22, fontWeight: "600", color: palette.tertiary }}>
            {`Finished in ${doneSeconds}s`}
          </Text>
        ) : (
          <ShimmerText
            text={phase === "reading" ? "Reading the paper" : "Generating a response"}
            activeColor={palette.text}
            mutedColor={palette.tertiary}
            textStyle={{ fontSize: 17, lineHeight: 22, fontWeight: "600" }}
          />
        )}
        {text ? <Text style={{ fontSize: 17, lineHeight: 24, color: palette.text }}>{text}</Text> : null}
      </View>
    </View>
  );
}

function SkeletonShowcase() {
  const palette = usePalette();
  return (
    <Card>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <Skeleton color={palette.surface} width={44} height={44} borderRadius={22} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton color={palette.surface} width="60%" />
          <Skeleton color={palette.surface} width="35%" />
        </View>
      </View>
      <Skeleton color={palette.surface} width="100%" />
      <Skeleton color={palette.surface} width="90%" />
      <Skeleton color={palette.surface} width="70%" />
    </Card>
  );
}

function ShimmerBandShowcase() {
  const palette = usePalette();
  return (
    <ShimmerBand
      backgroundColor={palette.surface}
      highlightColor={palette.text}
      style={{ width: "100%", height: 320, borderRadius: 24 }}
    />
  );
}

function StatusRowShowcase() {
  const palette = usePalette();
  const tick = useTicker(2500);
  const labels = ["Searching the web", "Reading 4 sources", "Writing the answer"];
  return (
    <Card>
      <StatusRow
        label={labels[tick % labels.length]}
        color={palette.secondary}
        icon={<View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: palette.text }} />}
      />
    </Card>
  );
}

function ThinkingBlockShowcase() {
  const palette = usePalette();
  const tick = useTicker(3500);
  return (
    <Card>
      <ThinkingBlock
        reasoning="The user wants a summary of the paper, so I should start with the abstract and then list the key findings."
        isStreaming={tick % 2 === 0}
        thinkingLabel="Thinking"
        formatDoneLabel={(seconds) => (seconds ? `Thought for ${seconds}s` : "Thought")}
        colors={{ text: palette.text, textSecondary: palette.secondary, textTertiary: palette.tertiary, pressed: palette.surface }}
      />
    </Card>
  );
}

function VoiceWaveShowcase() {
  const level = useSharedValue(0);
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
    <Card>
      <VoiceWave level={level} colors={["#7C5CFF", "#4CC9F0", "#F72585"]} />
    </Card>
  );
}

function RemainingRingShowcase() {
  const palette = usePalette();
  const tick = useTicker(1200);
  const steps = [0.1, 0.35, 0.6, 0.85, 1];
  return (
    <View style={{ alignItems: "center" }}>
      <RemainingRing size={160} strokeWidth={12} progress={steps[tick % steps.length]} trackColor={palette.surface} color={palette.text} />
    </View>
  );
}

function MatrixOrbShowcase() {
  const palette = usePalette();
  const tick = useTicker(3300);
  const state = ORB_STATES[tick % ORB_STATES.length];
  return (
    <View style={{ alignItems: "center", gap: 20 }}>
      <MatrixOrb state={state} size={260} color={palette.text} />
      <Text style={{ fontSize: 15, color: palette.secondary }}>{state}</Text>
    </View>
  );
}

function DrawerRevealShowcase() {
  const palette = usePalette();
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(1, { duration: 900 }),
        withTiming(0, { duration: 600 }),
        withTiming(0, { duration: 500 }),
      ),
      -1,
    );
  }, [progress]);
  return (
    <Card>
      <DrawerReveal progress={progress} style={{ gap: 14 }}>
        {["New chat", "Projects", "Library", "All chats"].map((label) => (
          <Text key={label} style={{ fontSize: 17, color: palette.text }}>
            {label}
          </Text>
        ))}
      </DrawerReveal>
    </Card>
  );
}

function SwipeActionsShowcase() {
  const palette = usePalette();
  const first = useRef<SwipeActionsHandle>(null);
  const second = useRef<SwipeActionsHandle>(null);
  const tick = useTicker(1400);

  useEffect(() => {
    const step = tick % 4;
    if (step === 0) first.current?.open("right");
    if (step === 1) second.current?.open("left");
    if (step === 2) second.current?.close();
  }, [tick]);

  const label = (text: string) => <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>{text}</Text>;

  return (
    <SwipeActionsGroup>
      <View style={{ width: "100%", borderRadius: 18, borderCurve: "continuous", overflow: "hidden", gap: 1 }}>
        {[first, second].map((ref, index) => (
          <SwipeActions
            key={index}
            ref={ref}
            leftActions={[{ key: "pin", accessibilityLabel: "Pin", backgroundColor: "#FF9F0A", onPress: () => {}, children: label("Pin") }]}
            rightActions={[
              { key: "delete", accessibilityLabel: "Delete", backgroundColor: "#FF3B30", onPress: () => {}, children: label("Delete") },
              { key: "archive", accessibilityLabel: "Archive", backgroundColor: "#8E8E93", onPress: () => {}, children: label("Archive") },
            ]}
            contentStyle={{ backgroundColor: palette.card }}
          >
            <View style={{ padding: 18 }}>
              <Text style={{ fontSize: 17, color: palette.text }}>{index === 0 ? "Trip planning" : "Paper summary"}</Text>
              <Text style={{ fontSize: 14, color: palette.secondary }}>Swipe for actions</Text>
            </View>
          </SwipeActions>
        ))}
      </View>
    </SwipeActionsGroup>
  );
}

const SHOWCASES: Record<string, { title: string; render: () => ReactNode }> = {
  "shimmer-text": { title: "Shimmer Text", render: () => <ShimmerTextShowcase /> },
  skeleton: { title: "Skeleton", render: () => <SkeletonShowcase /> },
  "shimmer-band": { title: "Shimmer Band", render: () => <ShimmerBandShowcase /> },
  "status-row": { title: "Status Row", render: () => <StatusRowShowcase /> },
  "thinking-block": { title: "Thinking Block", render: () => <ThinkingBlockShowcase /> },
  "voice-wave": { title: "Voice Wave", render: () => <VoiceWaveShowcase /> },
  "remaining-ring": { title: "Remaining Ring", render: () => <RemainingRingShowcase /> },
  "matrix-orb": { title: "Matrix Orb", render: () => <MatrixOrbShowcase /> },
  "drawer-reveal": { title: "Drawer Reveal", render: () => <DrawerRevealShowcase /> },
  "swipe-actions": { title: "Swipe Actions", render: () => <SwipeActionsShowcase /> },
};

export default function ShowcaseScreen() {
  const palette = usePalette();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const showcase = SHOWCASES[slug ?? ""];

  return (
    <View style={{ flex: 1, backgroundColor: palette.background, padding: 24 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={{ marginTop: 72, fontSize: 28, fontWeight: "700", color: palette.text }}>
        {showcase?.title ?? "Unknown component"}
      </Text>
      <Text style={{ marginTop: 4, fontSize: 15, color: palette.secondary }}>nami-motion</Text>
      <View style={{ flex: 1, justifyContent: "center", paddingBottom: 96 }}>{showcase ? showcase.render() : null}</View>
    </View>
  );
}
