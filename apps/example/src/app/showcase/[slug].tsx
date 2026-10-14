import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, Text, View, useColorScheme, type DimensionValue } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SymbolView, type SFSymbol } from "expo-symbols";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
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

type ShowcaseProps = { manual: boolean };

function usePalette() {
  const dark = useColorScheme() === "dark";
  return {
    background: dark ? "#000000" : "#F2F2F7",
    card: dark ? "#1C1C1E" : "#FFFFFF",
    surface: dark ? "#2C2C2E" : "#E5E5EA",
    text: dark ? "#FFFFFF" : "#000000",
    secondary: dark ? "#A1A1A6" : "#6C6C70",
    tertiary: dark ? "#636366" : "#AEAEB2",
    accent: "#0A84FF",
  };
}

function useSequence(durations: number[], loop = true) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const last = step === durations.length - 1;
    if (last && !loop) return;
    const id = setTimeout(() => setStep(last ? 0 : step + 1), durations[step]);
    return () => clearTimeout(id);
  }, [step, durations, loop]);
  return step;
}

function Card({ children, height, padded = true }: { children: ReactNode; height?: number; padded?: boolean }) {
  const palette = usePalette();
  return (
    <View
      style={{
        width: "100%",
        height,
        padding: padded ? 20 : 0,
        gap: 16,
        overflow: "hidden",
        borderRadius: 24,
        borderCurve: "continuous",
        backgroundColor: palette.card,
      }}
    >
      {children}
    </View>
  );
}

function UserBubble({ text }: { text: string }) {
  const palette = usePalette();
  return (
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
      <Text style={{ fontSize: 16, lineHeight: 21, color: palette.text }}>{text}</Text>
    </View>
  );
}

function Glyph({ name, size = 18, color }: { name: SFSymbol; size?: number; color: string }) {
  return <SymbolView name={name} size={size} tintColor={color} style={{ width: size, height: size }} />;
}

function Answer({ text }: { text: string }) {
  const palette = usePalette();
  return (
    <Animated.Text entering={FadeIn.duration(350)} style={{ fontSize: 17, lineHeight: 24, color: palette.text }}>
      {text}
    </Animated.Text>
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
    <Card height={330}>
      <UserBubble text="Summarize this paper in two sentences." />
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
    </Card>
  );
}

const USAGE_ROWS: { label: string; value: string; ratio: number }[] = [
  { label: "Messages", value: "640 / 1,000", ratio: 0.64 },
  { label: "Images", value: "12 / 40", ratio: 0.3 },
  { label: "Voice", value: "18 / 150 min", ratio: 0.12 },
];
const SKELETON_STEPS = [3200, 4200];

function UsageRow({ label, value, ratio, loading }: { label: string; value: string; ratio: number; loading: boolean }) {
  const palette = usePalette();
  if (loading) {
    return (
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Skeleton color={palette.surface} width={90} height={14} />
          <Skeleton color={palette.surface} width={70} height={14} />
        </View>
        <Skeleton color={palette.surface} height={8} borderRadius={4} />
      </View>
    );
  }
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 15, lineHeight: 18, color: palette.text }}>{label}</Text>
        <Text style={{ fontSize: 15, lineHeight: 18, color: palette.secondary }}>{value}</Text>
      </View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: palette.surface, overflow: "hidden" }}>
        <View style={{ width: `${ratio * 100}%` as DimensionValue, height: 8, borderRadius: 4, backgroundColor: palette.text }} />
      </View>
    </View>
  );
}

function SkeletonShowcase() {
  const palette = usePalette();
  const loading = useSequence(SKELETON_STEPS) === 0;

  return (
    <Card height={300}>
      <Animated.View key={loading ? "loading" : "loaded"} entering={FadeIn.duration(300)} style={{ gap: 22 }}>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          {loading ? (
            <>
              <Skeleton color={palette.surface} width={48} height={48} borderRadius={24} />
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton color={palette.surface} width="55%" height={16} />
                <Skeleton color={palette.surface} width="30%" height={13} />
              </View>
            </>
          ) : (
            <>
              <View
                style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#5E5CE6", alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ fontSize: 17, fontWeight: "600", color: "#FFFFFF" }}>AM</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontSize: 17, lineHeight: 22, fontWeight: "600", color: palette.text }}>Alex Morgan</Text>
                <Text style={{ fontSize: 14, lineHeight: 18, color: palette.secondary }}>Plus plan</Text>
              </View>
            </>
          )}
        </View>
        {loading ? (
          <Skeleton color={palette.surface} width={110} height={13} />
        ) : (
          <Text style={{ fontSize: 13, lineHeight: 16, fontWeight: "600", color: palette.secondary }}>THIS MONTH</Text>
        )}
        {USAGE_ROWS.map((row) => (
          <UsageRow key={row.label} {...row} loading={loading} />
        ))}
      </Animated.View>
    </Card>
  );
}

const IMAGE_STEPS = [4800, 4200];

function ShimmerBandShowcase() {
  const palette = usePalette();
  const generating = useSequence(IMAGE_STEPS) === 0;

  return (
    <Card height={340}>
      <UserBubble text="Draw a lighthouse at dusk." />
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 15, lineHeight: 20, fontWeight: "500", color: palette.secondary }}>
          {generating ? "Creating image" : "Image created"}
        </Text>
        {generating ? (
          <ShimmerBand
            backgroundColor={palette.surface}
            highlightColor={palette.card}
            highlightOpacity={0.9}
            style={{ width: 210, height: 210, borderRadius: 20, alignItems: "center", justifyContent: "center" }}
          >
            <Glyph name="photo" size={34} color={palette.tertiary} />
          </ShimmerBand>
        ) : (
          <Animated.View entering={FadeIn.duration(450)} style={{ width: 210, height: 210, borderRadius: 20, overflow: "hidden" }}>
            <LinearGradient colors={["#2B2F77", "#B24F8A", "#F59E6B"]} style={{ flex: 1 }}>
              <View style={{ position: "absolute", left: 120, top: 104, width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFD9A0" }} />
              <View style={{ position: "absolute", left: 38, top: 62, width: 18, height: 88, backgroundColor: "#F4F1EA" }} />
              <View style={{ position: "absolute", left: 38, top: 86, width: 18, height: 12, backgroundColor: "#D9443F" }} />
              <View style={{ position: "absolute", left: 38, top: 116, width: 18, height: 12, backgroundColor: "#D9443F" }} />
              <View style={{ position: "absolute", left: 34, top: 48, width: 26, height: 14, borderRadius: 4, backgroundColor: "#FFE08A" }} />
              <LinearGradient
                colors={["#3A3F8F", "#1C1F4A"]}
                style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 62 }}
              />
              <View style={{ position: "absolute", left: 18, bottom: 54, width: 70, height: 12, borderRadius: 6, backgroundColor: "#262A5C" }} />
            </LinearGradient>
          </Animated.View>
        )}
      </View>
    </Card>
  );
}

const TOOL_STEPS: { label: string; icon: SFSymbol; duration: number }[] = [
  { label: "Searching the web", icon: "globe", duration: 2000 },
  { label: "Reading 4 sources", icon: "doc.text", duration: 2000 },
  { label: "Writing the answer", icon: "pencil", duration: 1600 },
];
const TOOL_DURATIONS = [...TOOL_STEPS.map((step) => step.duration), 4000];

function StatusRowShowcase() {
  const palette = usePalette();
  const step = useSequence(TOOL_DURATIONS);
  const tool = TOOL_STEPS[step];

  return (
    <Card height={250}>
      <UserBubble text="What's the weather in Lisbon this weekend?" />
      {tool ? (
        <StatusRow
          label={tool.label}
          color={palette.text}
          iconSize={18}
          labelStyle={{ fontSize: 16, lineHeight: 21, fontWeight: "500" }}
          icon={<Glyph name={tool.icon} color={palette.text} />}
        />
      ) : (
        <View style={{ gap: 10 }}>
          <Animated.Text entering={FadeIn.duration(300)} style={{ fontSize: 13, lineHeight: 16, color: palette.tertiary }}>
            4 sources
          </Animated.Text>
          <Answer text={"Sunny on Saturday, around 24\u00B0C. Light rain is likely on Sunday afternoon, so pack a jacket."} />
        </View>
      )}
    </Card>
  );
}

const REASONING = [
  "2^61 - 1 is a Mersenne number, so the Lucas-Lehmer test applies.",
  "Running the test for p = 61 leaves a final residue of zero.",
  "That makes it a Mersenne prime, the ninth one found.",
];
const THINKING_STEPS = [1400, 1400, 1400, 1400, 2000, 3600];

function ThinkingBlockShowcase({ manual }: ShowcaseProps) {
  const palette = usePalette();
  const step = useSequence(THINKING_STEPS, !manual);
  const [expanded, setExpanded] = useState(false);
  const streaming = step < 4;
  const reasoning = REASONING.slice(0, Math.min(step, REASONING.length)).join("\n\n");

  useEffect(() => {
    if (manual) return;
    setExpanded(step === 5);
  }, [manual, step]);

  return (
    <Card height={340}>
      <UserBubble text="Is 2^61 - 1 prime?" />
      <View>
        <ThinkingBlock
          key={step === 0 ? "start" : "run"}
          reasoning={reasoning}
          isStreaming={streaming}
          thinkingLabel="Thinking"
          formatDoneLabel={(seconds) => (seconds ? `Thought for ${seconds}s` : "Thought")}
          textStyle={{ fontSize: 16, lineHeight: 21, fontWeight: "500" }}
          colors={{ text: palette.text, textSecondary: palette.secondary, textTertiary: palette.tertiary, pressed: palette.surface }}
          trailingIcon={streaming ? null : <Glyph name={expanded ? "chevron.up" : "chevron.down"} size={12} color={palette.secondary} />}
          onPress={() => setExpanded((value) => !value)}
        />
        {expanded && !streaming ? (
          <Animated.View
            entering={FadeIn.duration(250)}
            style={{ gap: 6, marginBottom: 12, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: palette.surface }}
          >
            {REASONING.map((line) => (
              <Text key={line} style={{ fontSize: 14, lineHeight: 19, color: palette.secondary }}>
                {line}
              </Text>
            ))}
          </Animated.View>
        ) : null}
        {streaming ? null : <Answer text="Yes. 2^61 - 1 is prime: the ninth Mersenne prime, found by Pervushin in 1883." />}
      </View>
    </Card>
  );
}

const DICTATION = "Book a table for two at eight tonight, somewhere quiet near the river.";
const DICTATION_WORDS = DICTATION.split(" ");
const VOICE_STEPS = [1400, 4800, 3200];

function VoiceWaveShowcase() {
  const palette = usePalette();
  const step = useSequence(VOICE_STEPS);
  const level = useSharedValue(0.05);
  const [words, setWords] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (step === 0) {
      setWords(0);
      setSeconds(0);
      level.value = withTiming(0.08, { duration: 300 });
      return;
    }
    if (step === 2) {
      setWords(DICTATION_WORDS.length);
      level.value = withTiming(0, { duration: 400 });
      return;
    }
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      setWords(Math.min(DICTATION_WORDS.length, Math.floor(elapsed / 330) + 1));
      level.value = withTiming(0.35 + Math.random() * 0.65, { duration: 110 });
    }, 120);
    return () => clearInterval(id);
  }, [step, level]);

  useEffect(() => {
    if (step === 2) return;
    const id = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [step]);

  const transcript = DICTATION_WORDS.slice(0, words).join(" ");

  return (
    <Card height={230}>
      <View style={{ flex: 1 }}>
        {transcript ? (
          <Text style={{ fontSize: 20, lineHeight: 27, fontWeight: "500", color: palette.text }}>{transcript}</Text>
        ) : (
          <Text style={{ fontSize: 20, lineHeight: 27, fontWeight: "500", color: palette.tertiary }}>Listening</Text>
        )}
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 8,
          height: 56,
          borderRadius: 28,
          backgroundColor: palette.background,
        }}
      >
        <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: palette.card }}>
          <Glyph name="xmark" size={14} color={palette.text} />
        </View>
        <VoiceWave level={level} colors={["#7C5CFF", "#4CC9F0", "#F72585"]} />
        <Text style={{ fontSize: 15, fontVariant: ["tabular-nums"], color: palette.secondary }}>
          {`0:${String(seconds).padStart(2, "0")}`}
        </Text>
        <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: palette.text }}>
          <Glyph name={step === 2 ? "arrow.up" : "stop.fill"} size={14} color={palette.card} />
        </View>
      </View>
    </Card>
  );
}

const UPLOAD_PROGRESS = [0, 0.08, 0.22, 0.41, 0.58, 0.77, 0.93, 1];
const UPLOAD_STEPS = [900, 700, 700, 700, 700, 700, 700, 3600];

function RemainingRingShowcase() {
  const palette = usePalette();
  const step = useSequence(UPLOAD_STEPS);
  const progress = UPLOAD_PROGRESS[step];
  const done = progress >= 1;

  return (
    <Card height={220}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          padding: 14,
          borderRadius: 18,
          borderCurve: "continuous",
          backgroundColor: palette.background,
        }}
      >
        <View style={{ width: 52, height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#FF453A" }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>PDF</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 17, lineHeight: 22, fontWeight: "600", color: palette.text }}>paper.pdf</Text>
          <Text style={{ fontSize: 14, lineHeight: 18, color: palette.secondary }}>
            {done ? "2.4 MB - Ready" : `Uploading ${Math.round(progress * 100)}%`}
          </Text>
        </View>
        <RemainingRing size={56} strokeWidth={5} progress={progress} trackColor={palette.surface} color={done ? "#30D158" : palette.text}>
          <Glyph name={done ? "checkmark" : "xmark"} size={18} color={done ? "#30D158" : palette.secondary} />
        </RemainingRing>
      </View>
      <View style={{ flex: 1 }} />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingLeft: 18,
          paddingRight: 8,
          height: 52,
          borderRadius: 26,
          borderWidth: 1,
          borderColor: palette.surface,
        }}
      >
        <Text style={{ flex: 1, fontSize: 17, color: palette.tertiary }}>Ask about this file</Text>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: done ? palette.text : palette.surface,
          }}
        >
          <Glyph name="arrow.up" size={14} color={done ? palette.card : palette.tertiary} />
        </View>
      </View>
    </Card>
  );
}

const ORB_SCRIPT: { state: MatrixOrbState; caption: string; duration: number }[] = [
  { state: "idle", caption: "Tap to talk", duration: 1800 },
  { state: "listening", caption: "What should I cook tonight?", duration: 2800 },
  { state: "thinking", caption: "Thinking", duration: 2200 },
  { state: "idle", caption: "Try a lemon garlic pasta. It takes 20 minutes.", duration: 3200 },
];
const ORB_DURATIONS = ORB_SCRIPT.map((line) => line.duration);

function MatrixOrbShowcase() {
  const palette = usePalette();
  const step = useSequence(ORB_DURATIONS);
  const line = ORB_SCRIPT[step];
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (line.state !== "listening") {
      setLevel(0);
      return;
    }
    const id = setInterval(() => setLevel(0.3 + Math.random() * 0.7), 140);
    return () => clearInterval(id);
  }, [line.state]);

  return (
    <View style={{ alignItems: "center", gap: 24, height: 340, justifyContent: "center" }}>
      <MatrixOrb state={line.state} level={line.state === "listening" ? level : undefined} size={230} color={palette.text} />
      <Animated.Text
        key={step}
        entering={FadeIn.duration(300)}
        style={{ minHeight: 48, maxWidth: 300, textAlign: "center", fontSize: 18, lineHeight: 24, fontWeight: "500", color: step === 3 ? palette.text : palette.secondary }}
      >
        {line.caption}
      </Animated.Text>
    </View>
  );
}

const DRAWER_ITEMS: { label: string; icon: SFSymbol }[] = [
  { label: "New chat", icon: "square.and.pencil" },
  { label: "Search", icon: "magnifyingglass" },
  { label: "Projects", icon: "folder" },
  { label: "Library", icon: "photo.on.rectangle" },
];
const DRAWER_RECENTS = ["Trip planning", "Paper summary", "Weekly groceries"];
const DRAWER_WIDTH = 250;

function DrawerRevealShowcase({ manual }: ShowcaseProps) {
  const palette = usePalette();
  const progress = useSharedValue(0);
  const start = useSharedValue(0);
  const step = useSequence([1200, 2600, 1400]);

  useEffect(() => {
    if (manual) return;
    if (step === 1) progress.value = withSpring(1, { damping: 22, stiffness: 180 });
    if (step === 2) progress.value = withTiming(0, { duration: 420 });
  }, [manual, step, progress]);

  const pan = Gesture.Pan()
    .enabled(manual)
    .onBegin(() => {
      start.value = progress.value;
    })
    .onUpdate((event) => {
      progress.value = Math.min(1, Math.max(0, start.value + event.translationX / DRAWER_WIDTH));
    })
    .onEnd((event) => {
      const open = progress.value + event.velocityX / 3000 > 0.5;
      progress.value = withSpring(open ? 1 : 0, { damping: 22, stiffness: 180 });
    });

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-DRAWER_WIDTH, 0], Extrapolation.CLAMP) }],
  }));
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [0, DRAWER_WIDTH], Extrapolation.CLAMP) }],
  }));
  const dimStyle = useAnimatedStyle(() => ({ opacity: progress.value * 0.18 }));

  return (
    <GestureDetector gesture={pan}>
      <View style={{ width: "100%", height: 330, overflow: "hidden", borderRadius: 24, borderCurve: "continuous", backgroundColor: palette.background }}>
        <Animated.View style={[{ flex: 1, padding: 18, gap: 14, backgroundColor: palette.card }, contentStyle]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Glyph name="line.3.horizontal" size={20} color={palette.text} />
            <Text style={{ fontSize: 17, fontWeight: "600", color: palette.text }}>Paper summary</Text>
          </View>
          <UserBubble text="Summarize this paper in two sentences." />
          <Text style={{ fontSize: 16, lineHeight: 22, color: palette.text }}>
            Small models trained on filtered data can match much larger ones on reasoning tasks.
          </Text>
          <Animated.View pointerEvents="none" style={[{ position: "absolute", inset: 0, backgroundColor: "#000000" }, dimStyle]} />
        </Animated.View>
        <Animated.View
          style={[{ position: "absolute", top: 0, bottom: 0, left: 0, width: DRAWER_WIDTH, padding: 18, backgroundColor: palette.background }, panelStyle]}
        >
          <DrawerReveal progress={progress} style={{ gap: 16 }}>
            {DRAWER_ITEMS.map((item) => (
              <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Glyph name={item.icon} size={18} color={palette.text} />
                <Text style={{ fontSize: 17, color: palette.text }}>{item.label}</Text>
              </View>
            ))}
            <Text style={{ marginTop: 6, fontSize: 13, fontWeight: "600", color: palette.secondary }}>RECENT</Text>
            {DRAWER_RECENTS.map((label) => (
              <Text key={label} style={{ fontSize: 16, color: palette.text }}>
                {label}
              </Text>
            ))}
          </DrawerReveal>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const CHATS = [
  { id: "trip", title: "Trip planning", preview: "Day 2: Sintra and the coast", time: "9:41" },
  { id: "paper", title: "Paper summary", preview: "Small models, filtered data", time: "Yesterday" },
  { id: "groceries", title: "Weekly groceries", preview: "Oat milk, lemons, basil", time: "Mon" },
];

function ActionLabel({ icon, text }: { icon: SFSymbol; text: string }) {
  return (
    <View style={{ alignItems: "center", gap: 4 }}>
      <Glyph name={icon} size={18} color="#FFFFFF" />
      <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>{text}</Text>
    </View>
  );
}

function SwipeActionsShowcase({ manual }: ShowcaseProps) {
  const palette = usePalette();
  const refs = useRef<Record<string, SwipeActionsHandle | null>>({});
  const [chats, setChats] = useState(CHATS);
  const [pinned, setPinned] = useState<string[]>([]);
  const step = useSequence([1400, 1600, 1600, 1600]);

  useEffect(() => {
    if (manual) return;
    if (step === 1) refs.current.trip?.open("right");
    if (step === 2) refs.current.paper?.open("left");
    if (step === 3) refs.current.paper?.close();
  }, [manual, step]);

  const remove = (id: string) => setChats((list) => list.filter((chat) => chat.id !== id));
  const togglePin = (id: string) =>
    setPinned((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));

  return (
    <SwipeActionsGroup>
      <View style={{ width: "100%", borderRadius: 24, borderCurve: "continuous", overflow: "hidden", gap: 1, backgroundColor: palette.surface }}>
        {chats.map((chat) => (
          <SwipeActions
            key={chat.id}
            ref={(handle) => {
              refs.current[chat.id] = handle;
            }}
            actionWidth={78}
            leftActions={[
              {
                key: "pin",
                accessibilityLabel: "Pin",
                backgroundColor: "#FF9F0A",
                onPress: () => togglePin(chat.id),
                children: <ActionLabel icon="pin.fill" text="Pin" />,
              },
            ]}
            rightActions={[
              {
                key: "delete",
                accessibilityLabel: "Delete",
                backgroundColor: "#FF3B30",
                onPress: () => remove(chat.id),
                children: <ActionLabel icon="trash.fill" text="Delete" />,
              },
              {
                key: "archive",
                accessibilityLabel: "Archive",
                backgroundColor: "#8E8E93",
                onPress: () => {},
                children: <ActionLabel icon="archivebox.fill" text="Archive" />,
              },
            ]}
            contentStyle={{ backgroundColor: palette.card }}
          >
            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, height: 76 }}>
              <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  {pinned.includes(chat.id) ? <Glyph name="pin.fill" size={12} color="#FF9F0A" /> : null}
                  <Text style={{ fontSize: 17, fontWeight: "600", color: palette.text }}>{chat.title}</Text>
                </View>
                <Text style={{ fontSize: 15, color: palette.secondary }}>{chat.preview}</Text>
              </View>
              <Text style={{ fontSize: 14, color: palette.tertiary }}>{chat.time}</Text>
            </Pressable>
          </SwipeActions>
        ))}
      </View>
    </SwipeActionsGroup>
  );
}

const SHOWCASES: Record<string, { title: string; render: (props: ShowcaseProps) => ReactNode }> = {
  "shimmer-text": { title: "Shimmer Text", render: () => <ShimmerTextShowcase /> },
  skeleton: { title: "Skeleton", render: () => <SkeletonShowcase /> },
  "shimmer-band": { title: "Shimmer Band", render: () => <ShimmerBandShowcase /> },
  "status-row": { title: "Status Row", render: () => <StatusRowShowcase /> },
  "thinking-block": { title: "Thinking Block", render: (props) => <ThinkingBlockShowcase {...props} /> },
  "voice-wave": { title: "Voice Wave", render: () => <VoiceWaveShowcase /> },
  "remaining-ring": { title: "Remaining Ring", render: () => <RemainingRingShowcase /> },
  "matrix-orb": { title: "Matrix Orb", render: () => <MatrixOrbShowcase /> },
  "drawer-reveal": { title: "Drawer Reveal", render: (props) => <DrawerRevealShowcase {...props} /> },
  "swipe-actions": { title: "Swipe Actions", render: (props) => <SwipeActionsShowcase {...props} /> },
};

export default function ShowcaseScreen() {
  const palette = usePalette();
  const { slug, driver } = useLocalSearchParams<{ slug: string; driver?: string }>();
  const showcase = SHOWCASES[slug ?? ""];

  return (
    <View style={{ flex: 1, backgroundColor: palette.background, padding: 24 }}>
      <Stack.Screen
        options={{ title: "", headerTransparent: true, headerLargeTitle: false, headerShadowVisible: false, headerBackButtonDisplayMode: "minimal" }}
      />
      <Text style={{ marginTop: 72, fontSize: 28, fontWeight: "700", color: palette.text }}>
        {showcase?.title ?? "Unknown component"}
      </Text>
      <Text style={{ marginTop: 4, fontSize: 15, color: palette.secondary }}>nami-motion</Text>
      <View style={{ flex: 1, justifyContent: "center", paddingBottom: 96 }}>
        {showcase ? showcase.render({ manual: driver === "maestro" }) : null}
      </View>
    </View>
  );
}
