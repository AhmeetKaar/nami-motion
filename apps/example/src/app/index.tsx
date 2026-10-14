import { useEffect, useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { SymbolView, type SFSymbol } from "expo-symbols";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  FadeIn,
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
import { MatrixOrb, RemainingRing, VoiceWave } from "nami-motion/skia";
import { ShimmerText } from "nami-motion/text";

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

function Demo({ title, slug, children }: { title: string; slug: string; children: ReactNode }) {
  const palette = usePalette();
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Opens the full showcase"
      onPress={() => router.push(`/showcase/${slug}`)}
      style={({ pressed }) => ({
        padding: 16,
        gap: 14,
        borderRadius: 20,
        borderCurve: "continuous",
        backgroundColor: palette.card,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: palette.text }}>{title}</Text>
        <SymbolView name="chevron.right" size={13} tintColor={palette.tertiary} style={{ width: 13, height: 13 }} />
      </View>
      <View pointerEvents="none">{children}</View>
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
    <Demo title="Swipe Actions" slug="swipe-actions">
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

const MENU: { label: string; icon: SFSymbol }[] = [
  { label: "New chat", icon: "square.and.pencil" },
  { label: "Search", icon: "magnifyingglass" },
  { label: "Projects", icon: "folder" },
];

function ProfileSkeleton() {
  const palette = usePalette();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setLoading((value) => !value), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <Animated.View key={loading ? "loading" : "loaded"} entering={FadeIn.duration(250)} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      {loading ? (
        <>
          <Skeleton color={palette.surface} width={44} height={44} borderRadius={22} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton color={palette.surface} width="50%" height={14} />
            <Skeleton color={palette.surface} width="75%" height={12} />
          </View>
        </>
      ) : (
        <>
          <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#5E5CE6" }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#FFFFFF" }}>AM</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: palette.text }}>Alex Morgan</Text>
            <Text style={{ fontSize: 14, color: palette.secondary }}>Plus plan - 640 of 1,000 messages</Text>
          </View>
        </>
      )}
    </Animated.View>
  );
}

export default function GalleryScreen() {
  const palette = usePalette();
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
    drawer.value = withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(1, { duration: 900 }), withTiming(0, { duration: 600 })), -1);
  }, [level, drawer]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
    >
      <Demo title="Shimmer Text" slug="shimmer-text">
        <ShimmerText text="Generating a response" activeColor={palette.text} mutedColor={palette.tertiary} />
      </Demo>
      <Demo title="Skeleton" slug="skeleton">
        <ProfileSkeleton />
      </Demo>
      <Demo title="Shimmer Band" slug="shimmer-band">
        <ShimmerBand
          backgroundColor={palette.surface}
          highlightColor={palette.text}
          style={{ height: 160, borderRadius: 16 }}
        />
      </Demo>
      <Demo title="Status Row" slug="status-row">
        <StatusRow
          label="Searching the web"
          color={palette.secondary}
          icon={<View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: palette.text }} />}
        />
      </Demo>
      <Demo title="Thinking Block" slug="thinking-block">
        <ThinkingBlock
          reasoning="The user wants a summary of the paper, so I should start with the abstract."
          isStreaming
          thinkingLabel="Thinking"
          formatDoneLabel={(seconds) => (seconds ? `Thought for ${seconds}s` : "Thought")}
          colors={{ text: palette.text, textSecondary: palette.secondary, textTertiary: palette.tertiary, pressed: palette.surface }}
        />
      </Demo>
      <Demo title="Voice Wave" slug="voice-wave">
        <VoiceWave level={level} colors={["#7C5CFF", "#4CC9F0", "#F72585"]} />
      </Demo>
      <Demo title="Remaining Ring" slug="remaining-ring">
        <RemainingRing size={44} progress={0.6} trackColor={palette.surface} color={palette.text} />
      </Demo>
      <Demo title="Matrix Orb" slug="matrix-orb">
        <View style={{ alignItems: "center" }}>
          <MatrixOrb state="thinking" size={140} color={palette.text} />
        </View>
      </Demo>
      <Demo title="Drawer Reveal" slug="drawer-reveal">
        <DrawerReveal progress={drawer} style={{ gap: 14 }}>
          {MENU.map((item) => (
            <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <SymbolView name={item.icon} size={18} tintColor={palette.text} style={{ width: 18, height: 18 }} />
              <Text style={{ fontSize: 16, color: palette.text }}>{item.label}</Text>
            </View>
          ))}
        </DrawerReveal>
      </Demo>
      <SwipeActionsDemo />
    </ScrollView>
  );
}
