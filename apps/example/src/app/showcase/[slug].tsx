import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, Text, View, type DimensionValue } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SymbolView, type SFSymbol } from "expo-symbols";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  FadeIn,
  FadeInDown,
  LinearTransition,
  ZoomIn,
  ZoomOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  FollowUpChips,
  MessageActions,
  SourceBadge,
  SourceChips,
  StatusRow,
  ThinkingBlock,
  ThinkingTrace,
  TraceSteps,
} from "nami-motion/chat";
import { Skeleton } from "nami-motion/feedback";
import {
  DrawerReveal,
  SwipeActions,
  SwipeActionsGroup,
  type SwipeActionsHandle,
} from "nami-motion/gestures";
import { GeneratingImage } from "nami-motion/gradient";
import { AttachmentTile, AttachmentTray, DictationBar, MatrixOrb, type MatrixOrbState } from "nami-motion/skia";
import { useMotionPalette } from "nami-motion/theme";
import { ShimmerText } from "nami-motion/text";

type ShowcaseProps = { manual: boolean };

function usePalette() {
  const palette = useMotionPalette();
  return {
    background: palette.background,
    card: palette.card,
    surface: palette.surface,
    text: palette.text,
    secondary: palette.textSecondary,
    tertiary: palette.textTertiary,
    skeleton: palette.raised,
    accent: palette.accent,
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

type StreamToken = { kind: "word"; text: string } | { kind: "source"; text: string };

const STREAM_TOKENS: StreamToken[] = [
  ..."Small models trained on filtered data match much larger ones on reasoning."
    .split(" ")
    .map((text) => ({ kind: "word" as const, text })),
  { kind: "source", text: "arxiv.org" },
  ..."Most of the gain comes from filtering, not extra compute."
    .split(" ")
    .map((text) => ({ kind: "word" as const, text })),
  { kind: "source", text: "nature.com" },
];
const STREAM_READING_MS = 1800;
const STREAM_TOKEN_MS = 120;
const STREAM_HOLD_MS = 4200;
const STREAM_DONE_SECONDS = Math.round((STREAM_READING_MS + STREAM_TOKENS.length * STREAM_TOKEN_MS) / 1000);
const FOLLOW_UPS = ["How was data filtered?", "Which tasks?"];
const ANSWER_ACTIONS: SFSymbol[] = ["doc.on.doc", "hand.thumbsup", "hand.thumbsdown", "arrow.clockwise", "speaker.wave.2"];

function useStreamingCycle() {
  const [tokens, setTokens] = useState(-1);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    setTokens(-1);
    timers.push(setTimeout(() => setTokens(0), STREAM_READING_MS));
    STREAM_TOKENS.forEach((_, index) => {
      timers.push(setTimeout(() => setTokens(index + 1), STREAM_READING_MS + (index + 1) * STREAM_TOKEN_MS));
    });
    const total = STREAM_READING_MS + STREAM_TOKENS.length * STREAM_TOKEN_MS + STREAM_HOLD_MS;
    timers.push(setTimeout(() => setCycle((value) => value + 1), total));
    return () => timers.forEach(clearTimeout);
  }, [cycle]);

  if (tokens < 0) return { phase: "reading" as const, visible: [] as StreamToken[] };
  if (tokens < STREAM_TOKENS.length) return { phase: "streaming" as const, visible: STREAM_TOKENS.slice(0, tokens) };
  return { phase: "done" as const, visible: STREAM_TOKENS };
}

function ShimmerTextShowcase() {
  const palette = usePalette();
  const { phase, visible } = useStreamingCycle();

  return (
    <Card height={340}>
      <UserBubble text="Summarize this paper in two sentences." />
      <View style={{ gap: 8 }}>
        {phase === "done" ? (
          <Text style={{ fontSize: 17, lineHeight: 22, fontWeight: "600", color: palette.tertiary }}>
            {`Finished in ${STREAM_DONE_SECONDS}s`}
          </Text>
        ) : (
          <ShimmerText
            text={phase === "reading" ? "Reading the paper" : "Generating a response"}
            activeColor={palette.text}
            mutedColor={palette.tertiary}
            textStyle={{ fontSize: 17, lineHeight: 22, fontWeight: "600" }}
          />
        )}
        {visible.length ? (
          <Text style={{ fontSize: 17, lineHeight: 25, color: palette.text }}>
            {visible.map((token, index) =>
              token.kind === "word" ? (
                <Text key={index}>{index ? ` ${token.text}` : token.text}</Text>
              ) : (
                <Text key={index}>
                  {" "}
                  <SourceBadge label={token.text} />
                </Text>
              ),
            )}
          </Text>
        ) : null}
        {phase === "done" ? (
          <View style={{ gap: 12, marginTop: 4 }}>
            <MessageActions
              actions={ANSWER_ACTIONS.map((name) => ({
                key: name,
                accessibilityLabel: name,
                icon: <Glyph name={name} size={16} color={palette.secondary} />,
              }))}
            />
            <FollowUpChips delay={350} items={FOLLOW_UPS.map((label) => ({ key: label, label }))} />
          </View>
        ) : null}
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

function SkeletonLine({ width, lineHeight, height }: { width: DimensionValue; lineHeight: number; height?: number }) {
  const palette = usePalette();
  return (
    <View style={{ height: lineHeight, justifyContent: "center" }}>
      <Skeleton color={palette.skeleton} width={width} height={height ?? Math.round(lineHeight * 0.62)} borderRadius={4} />
    </View>
  );
}

function UsageRow({ label, value, ratio, loading }: { label: string; value: string; ratio: number; loading: boolean }) {
  const palette = usePalette();
  if (loading) {
    return (
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <SkeletonLine width={84} lineHeight={18} />
          <SkeletonLine width={72} lineHeight={18} />
        </View>
        <Skeleton color={palette.skeleton} height={8} borderRadius={4} />
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
              <Skeleton color={palette.skeleton} width={48} height={48} borderRadius={24} />
              <View style={{ flex: 1, gap: 2 }}>
                <SkeletonLine width="48%" lineHeight={22} />
                <SkeletonLine width="28%" lineHeight={18} />
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
          <SkeletonLine width={86} lineHeight={16} height={10} />
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
      <GeneratingImage
        generating={generating}
        label="Creating image"
        doneLabel="Image created"
        width={210}
        height={210}
        placeholderIcon={<Glyph name="photo" size={34} color={palette.tertiary} />}
      >
        <LinearGradient colors={["#1F8A70", "#5FC7B0", "#F5D48A"]} style={{ flex: 1 }}>
          <View style={{ position: "absolute", left: 120, top: 96, width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFD447" }} />
          <View style={{ position: "absolute", left: 38, top: 62, width: 18, height: 88, backgroundColor: "#F3F4F5" }} />
          <View style={{ position: "absolute", left: 38, top: 86, width: 18, height: 12, backgroundColor: "#F2705B" }} />
          <View style={{ position: "absolute", left: 38, top: 116, width: 18, height: 12, backgroundColor: "#F2705B" }} />
          <View style={{ position: "absolute", left: 34, top: 48, width: 26, height: 14, borderRadius: 4, backgroundColor: "#FFD447" }} />
          <LinearGradient colors={["#1B2327", "#0B0E10"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 62 }} />
          <View style={{ position: "absolute", left: 18, bottom: 54, width: 70, height: 12, borderRadius: 6, backgroundColor: "#141A1D" }} />
        </LinearGradient>
      </GeneratingImage>
    </Card>
  );
}

function BrandMark({ size = 18 }: { size?: number }) {
  const breath = useSharedValue(0);
  useEffect(() => {
    breath.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [breath]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(breath.value, [0, 1], [0.86, 1]) }, { rotate: `${interpolate(breath.value, [0, 1], [0, 90])}deg` }],
  }));
  return (
    <Animated.View style={[{ width: size, height: size }, style]}>
      <LinearGradient
        colors={["#1F8A70", "#5FC7B0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, borderRadius: size * 0.3, alignItems: "center", justifyContent: "center" }}
      >
        <View style={{ width: size * 0.32, height: size * 0.32, borderRadius: size, backgroundColor: "#FFFFFF" }} />
      </LinearGradient>
    </Animated.View>
  );
}

const TOOL_LABELS = ["Searching the web", "Reading 3 sources", "Writing the answer"];
const TOOL_DURATIONS = [2000, 2400, 1600, 4000];
const TOOL_SOURCES = [
  { key: "ipma", label: "ipma.pt" },
  { key: "meteo", label: "meteo.pt" },
  { key: "lisboa", label: "lisboa.pt" },
];

function StatusRowShowcase() {
  const palette = usePalette();
  const step = useSequence(TOOL_DURATIONS);
  const label = TOOL_LABELS[step];

  return (
    <Card height={260}>
      <UserBubble text="What's the weather in Lisbon this weekend?" />
      {label ? (
        <View style={{ gap: 12 }}>
          <StatusRow
            label={label}
            iconSize={20}
            labelStyle={{ fontSize: 16, lineHeight: 22, fontWeight: "500" }}
            icon={<BrandMark size={20} />}
          />
          {step >= 1 ? <SourceChips sources={TOOL_SOURCES} stagger={step === 1 ? 260 : 0} /> : null}
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <Answer text={"Sunny on Saturday, around 24°C. Light rain is likely on Sunday afternoon, so pack a jacket."} />
          <SourceChips
            sources={TOOL_SOURCES}
            stagger={0}
            renderIcon={() => <Glyph name="globe" size={14} color={palette.secondary} />}
          />
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
const TRACE_TABS = ["Steps", "Reasoning", "Search", "Coding"] as const;
type TraceTab = (typeof TRACE_TABS)[number];
const TRACE_STEPS = ["Spot the Mersenne form", "Pick the Lucas-Lehmer test", "Run it for p = 61", "Residue is zero"];
const TRACE_SEARCH = [
  { title: "List of known Mersenne primes", domain: "mersenne.org" },
  { title: "Lucas-Lehmer primality test", domain: "wikipedia.org" },
];
const TRACE_CODE = "def is_mersenne_prime(p):\n    s, m = 4, 2**p - 1\n    for _ in range(p - 2):\n        s = (s * s - 2) % m\n    return s == 0";
const THINKING_STEPS = [1400, 1400, 1400, 1400, 1200, 1500, 1500, 1500, 1600];
const THINKING_AUTO_TABS: (TraceTab | null)[] = [null, null, null, null, null, "Steps", "Search", "Coding", null];

function TracePanel({ tab }: { tab: TraceTab }) {
  const palette = usePalette();
  if (tab === "Steps") {
    return (
      <TraceSteps
        steps={TRACE_STEPS.map((label, index) => ({
          key: label,
          label,
          status: index === TRACE_STEPS.length - 1 ? "active" : "done",
        }))}
      />
    );
  }
  if (tab === "Reasoning") {
    return (
      <View style={{ gap: 6 }}>
        {REASONING.map((line) => (
          <Text key={line} style={{ fontSize: 14, lineHeight: 19, color: palette.secondary }}>
            {line}
          </Text>
        ))}
      </View>
    );
  }
  if (tab === "Search") {
    return (
      <View style={{ gap: 10 }}>
        {TRACE_SEARCH.map((result) => (
          <View key={result.domain} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Glyph name="globe" size={14} color={palette.secondary} />
            <View>
              <Text style={{ fontSize: 14, lineHeight: 18, color: palette.text }}>{result.title}</Text>
              <Text style={{ fontSize: 12, lineHeight: 16, color: palette.tertiary }}>{result.domain}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  }
  return (
    <View style={{ padding: 10, borderRadius: 10, backgroundColor: palette.background }}>
      <Text style={{ fontFamily: "Menlo", fontSize: 11.5, lineHeight: 16, color: palette.text }}>{TRACE_CODE}</Text>
    </View>
  );
}

function ThinkingBlockShowcase({ manual }: ShowcaseProps) {
  const palette = usePalette();
  const step = useSequence(THINKING_STEPS, !manual);
  const [manualTab, setManualTab] = useState<TraceTab | null>(null);
  const streaming = step < 4;
  const reasoning = REASONING.slice(0, Math.min(step, REASONING.length)).join("\n\n");
  const tab = manual ? manualTab : THINKING_AUTO_TABS[step];

  return (
    <Card height={350}>
      <UserBubble text="Is 2^61 - 1 prime?" />
      <Animated.View layout={LinearTransition.duration(260)}>
        <ThinkingBlock
          key={step === 0 ? "start" : "run"}
          reasoning={reasoning}
          isStreaming={streaming}
          thinkingLabel="Thinking"
          formatDoneLabel={(seconds) => (seconds ? `Thought for ${seconds}s` : "Thought")}
          textStyle={{ fontSize: 16, lineHeight: 21, fontWeight: "500" }}
          colors={{ text: palette.text, textSecondary: palette.secondary, textTertiary: palette.tertiary, pressed: palette.surface }}
          trailingIcon={streaming ? null : <Glyph name={tab ? "chevron.up" : "chevron.down"} size={12} color={palette.secondary} />}
          onPress={() => setManualTab((value) => (value ? null : "Steps"))}
        />
        {tab && !streaming ? (
          <ThinkingTrace
            style={{ marginBottom: 12 }}
            contentHeight={96}
            selectedKey={tab}
            onSelect={(key) => setManualTab(key as TraceTab)}
            tabs={TRACE_TABS.map((key) => ({ key, label: key, content: <TracePanel tab={key} /> }))}
          />
        ) : null}
        {streaming ? null : (
          <Animated.Text entering={FadeIn.duration(350)} style={{ fontSize: 16, lineHeight: 22, color: palette.text }}>
            Yes. It is the ninth Mersenne prime, found by Pervushin in 1883.
          </Animated.Text>
        )}
      </Animated.View>
    </Card>
  );
}

const DICTATION = "Book a table for two at eight tonight, somewhere quiet near the river.";
const DICTATION_WORDS = DICTATION.split(" ");
const VOICE_STEPS = [1400, 4800, 3400];

function RoundButton({ icon, filled }: { icon: SFSymbol; filled?: boolean }) {
  const palette = usePalette();
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: filled ? palette.text : palette.card,
      }}
    >
      <Glyph name={icon} size={14} color={filled ? palette.card : palette.text} />
    </View>
  );
}

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
      level.value = withTiming(0, { duration: 300 });
      return;
    }
    const start = Date.now();
    const id = setInterval(() => {
      setWords(Math.min(DICTATION_WORDS.length, Math.floor((Date.now() - start) / 330) + 1));
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
  const recording = step < 2;

  return (
    <Card height={230}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        {recording ? (
          transcript ? (
            <Text style={{ fontSize: 20, lineHeight: 27, fontWeight: "500", color: palette.text }}>{transcript}</Text>
          ) : (
            <ShimmerText
              text="Listening"
              activeColor={palette.text}
              mutedColor={palette.tertiary}
              textStyle={{ fontSize: 20, lineHeight: 27, fontWeight: "500" }}
            />
          )
        ) : null}
      </View>
      {recording ? (
        <DictationBar
          level={level}
          elapsedSeconds={seconds}
          cancelIcon={<Glyph name="xmark" size={14} color={palette.text} />}
          confirmIcon={<Glyph name="checkmark" size={14} color={palette.card} />}
        />
      ) : (
        <Animated.View
          entering={FadeInDown.duration(320)}
          style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, padding: 8, paddingLeft: 16, borderRadius: 28, backgroundColor: palette.surface }}
        >
          <Text style={{ flex: 1, paddingVertical: 8, fontSize: 16, lineHeight: 22, color: palette.text }}>{DICTATION}</Text>
          <RoundButton icon="arrow.up" filled />
        </Animated.View>
      )}
    </Card>
  );
}

type Attachment = { id: string; kind: "image" | "pdf"; progress: number };
const ATTACH_TIMELINE: { items: Attachment[]; duration: number }[] = [
  { items: [], duration: 1000 },
  { items: [{ id: "photo", kind: "image", progress: 0.15 }], duration: 700 },
  { items: [{ id: "photo", kind: "image", progress: 0.45 }, { id: "paper", kind: "pdf", progress: 0.1 }], duration: 700 },
  { items: [{ id: "photo", kind: "image", progress: 0.8 }, { id: "paper", kind: "pdf", progress: 0.35 }], duration: 700 },
  { items: [{ id: "photo", kind: "image", progress: 1 }, { id: "paper", kind: "pdf", progress: 0.6 }], duration: 700 },
  { items: [{ id: "photo", kind: "image", progress: 1 }, { id: "paper", kind: "pdf", progress: 0.85 }], duration: 700 },
  { items: [{ id: "photo", kind: "image", progress: 1 }, { id: "paper", kind: "pdf", progress: 1 }], duration: 1600 },
  { items: [{ id: "paper", kind: "pdf", progress: 1 }], duration: 2600 },
];
const ATTACH_DURATIONS = ATTACH_TIMELINE.map((frame) => frame.duration);

function RemainingRingShowcase() {
  const palette = usePalette();
  const step = useSequence(ATTACH_DURATIONS);
  const items = ATTACH_TIMELINE[step].items;
  const ready = items.length > 0 && items.every((item) => item.progress >= 1);

  return (
    <Card height={200}>
      <AttachmentTray
        scroll={false}
        style={{ height: 76 }}
        items={items}
        keyExtractor={(item) => item.id}
        renderItem={(item) =>
          item.kind === "image" ? (
            <AttachmentTile
              kind="image"
              name="lighthouse.jpg"
              progress={item.progress}
              onRemove={() => {}}
              preview={<LinearGradient colors={["#1F8A70", "#5FC7B0", "#F5D48A"]} style={{ flex: 1 }} />}
            />
          ) : (
            <AttachmentTile
              kind="file"
              name="paper.pdf"
              progress={item.progress}
              detail={item.progress >= 1 ? "PDF - 2.4 MB" : `Uploading ${Math.round(item.progress * 100)}%`}
              fileIcon={<Text style={{ fontSize: 10, fontWeight: "800", color: "#FFFFFF" }}>PDF</Text>}
              onRemove={() => {}}
            />
          )
        }
      />
      <View style={{ flex: 1 }} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 8, paddingRight: 8, height: 52, borderRadius: 26, borderWidth: 1, borderColor: palette.surface }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: palette.background }}>
          <Glyph name="plus" size={14} color={palette.text} />
        </View>
        <Text style={{ flex: 1, fontSize: 17, color: palette.tertiary }}>Ask anything</Text>
        <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: ready ? palette.text : palette.surface }}>
          <Glyph name="arrow.up" size={14} color={ready ? palette.card : palette.tertiary} />
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

function BackButton() {
  const palette = usePalette();
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={12}
      onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: palette.card,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Glyph name="chevron.left" size={16} color={palette.text} />
    </Pressable>
  );
}

export default function ShowcaseScreen() {
  const palette = usePalette();
  const { slug, driver } = useLocalSearchParams<{ slug: string; driver?: string }>();
  const showcase = SHOWCASES[slug ?? ""];

  return (
    <View style={{ flex: 1, backgroundColor: palette.background, padding: 24 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ marginTop: 36 }}>
        <BackButton />
      </View>
      <Text style={{ marginTop: 8, fontSize: 28, fontWeight: "700", color: palette.text }}>
        {showcase?.title ?? "Unknown component"}
      </Text>
      <Text style={{ marginTop: 4, fontSize: 15, color: palette.secondary }}>nami-motion</Text>
      <View style={{ flex: 1, justifyContent: "center", paddingBottom: 96 }}>
        {showcase ? showcase.render({ manual: driver === "maestro" }) : null}
      </View>
    </View>
  );
}
