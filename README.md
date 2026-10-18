# React Native AI Animations

Animated React Native and Expo components for AI chat apps: streaming text,
shimmer loading text, thinking and status indicators, voice orbs and
waveforms, image and video generation loaders, question cards and reasoning
effort bars. Built on Reanimated and Skia, themeable, and reduce motion aware.

Docs and live demos: [nami-motion-web.vercel.app](https://nami-motion-web.vercel.app/)

```bash
npx expo install react-native-ai-animations react-native-reanimated react-native-worklets
```

Formerly published as `nami-motion`: replace `nami-motion` with
`react-native-ai-animations` in your imports.

## Components

See every component and style in motion, with copyable code and agent prompts, on
the [website](https://nami-motion-web.vercel.app/).

| Component | Entry | What it does |
| --- | --- | --- |
| Shimmer Text | `react-native-ai-animations/text` | A light band sweeping across text while a response is being generated. |
| Streaming Text | `react-native-ai-animations/text` | Words of a streaming answer fade and rise in, with a blinking caret. |
| Spoken Text | `react-native-ai-animations/text` | Highlights the word being spoken and dims the words already read aloud, for voice replies. |
| Spinning Mark | `react-native-ai-animations/brand` | Spins any icon you pass (your logo) with optional breathing and entrance. |
| Media Generating | `react-native-ai-animations/skia` | One loading state shared by image and video generation, with six variants (blobs, matrix, orbit, scan, constellation, helix). `ImageGenerating` and `VideoGenerating` are its presets. |
| DotOrb | `react-native-ai-animations/skia` | Dot sphere pictures behind the media variants, also usable on their own. |
| Liquid Orb | `react-native-ai-animations/skia` | Liquid voice orb in metal, water, iridescent or ring material that reacts to idle, listening, thinking and speaking states and a live level. |
| Voice Wave | `react-native-ai-animations/skia` | Live microphone waveform in four styles: lines, bars, dots and pulse. |
| Status Row | `react-native-ai-animations/chat` | Pulsing icon, shimmering label and elapsed timer for agent status. |
| Thinking Block | `react-native-ai-animations/chat` | "Thought for Ns" header that springs open into a step timeline. |
| Question Card | `react-native-ai-animations/chat` | Paged questions with numbered options and a custom answer, for cards or sheets. |
| Effort Bar | `react-native-ai-animations/chat` | Reasoning effort bar wired to `reasoning.effort` (low, medium, high) in four styles: rising bars (default), track, segmented pill and a slider whose knob stretches as you drag and snaps to a level under a tab with your model name, each with a compact form and a per level icon. |

Every style is also its own component with the same props minus `variant`:
`VoiceWaveLines`, `VoiceWaveBars`, `VoiceWaveDots` and `VoiceWavePulse`;
`EffortBars`, `EffortTrack`, `EffortSegmented` and
`EffortSlider`; `MediaGeneratingBlobs`, `MediaGeneratingMatrix`,
`MediaGeneratingOrbit`, `MediaGeneratingScan`, `MediaGeneratingConstellation`
and `MediaGeneratingHelix`; and `QuestionSheet`.

Every component takes its icon, font, colors and timing as props and falls back
to a static state when reduce motion is on. `react-native-ai-animations/theme` ships the
Moodstone palette with `MotionThemeProvider` and `useMotionPalette`; pass
`colors` to override one component.

Optional peer: `@shopify/react-native-skia` for `react-native-ai-animations/skia`.

### Shimmer Text

```tsx
import { ShimmerText } from "react-native-ai-animations/text";

<ShimmerText text="Generating a response" activeColor={colors.text} mutedColor={colors.textTertiary} />;
```

### Spinning Mark

```tsx
import { SpinningMark } from "react-native-ai-animations/brand";

<SpinningMark size={160} duration={3600} breathe entrance>
  <Image source={require("./logo.png")} style={{ width: 160, height: 160 }} />
</SpinningMark>;
```

### Streaming Text, Status Row, Thinking Block

```tsx
import { StreamingText } from "react-native-ai-animations/text";
import { StatusRow, ThinkingBlock } from "react-native-ai-animations/chat";

<StatusRow label="Searching the web" icon={<Logo />} startedAt={startedAt} />;
<ThinkingBlock thinking={thinking} startedAt={startedAt} steps={steps} />;
<StreamingText text={answer} streaming={streaming} textStyle={{ fontFamily: "Inter" }} />;
```

### Media Generating (shared by image and video)

```tsx
import { ImageGenerating, MediaGenerating, VideoGenerating } from "react-native-ai-animations/skia";

<MediaGenerating variant="constellation" label="Creating image" startedAt={startedAt} />;
<MediaGenerating variant="scan" chrome="overlay" status="generating" progress={0.42} meta="720p · 6s" aspectRatio={16 / 9} />;
<ImageGenerating variant="helix" startedAt={startedAt} />;
<VideoGenerating status="queued" variant="orbit" />;
```

### Effort Bar

`REASONING_EFFORTS` matches the `reasoning.effort` values OpenRouter and most reasoning APIs take (`low`, `medium`, `high`), with each level's share of max_tokens. `variant` picks the style: `bars` (default), `track`, `segmented` or `slider`; `size="compact"` gives each one a small inline form for model rows, `fillColors` tints any of them, `tabLabel` puts your model name in the slider's tab and `levelIcon` swaps every level name for your own icon, so the state reads without text. EffortBar is only the bar: put your own title, level label or description around it, wherever your UX needs it.

```tsx
import { EffortBar, REASONING_EFFORTS, reasoningRequest } from "react-native-ai-animations/chat";

<EffortBar levels={REASONING_EFFORTS} value={index} onChange={(i, level) => setEffort(level.value)} accessibilityLabel="Reasoning" />;
<EffortBar levels={REASONING_EFFORTS} value={index} onChange={(i) => setIndex(i)} variant="segmented" />;
<EffortBar levels={REASONING_EFFORTS} value={index} onChange={(i) => setIndex(i)} variant="slider" tabLabel={model.name} fillColors={["#5AA2FF", "#2F7BF5"]} levelIcon={(i, color) => <BrainIcon level={i} color={color} />} />;
<EffortBar levels={REASONING_EFFORTS} value={index} variant="slider" size="compact" />;

const body = { model, messages, max_tokens: 16000, ...reasoningRequest(effort) };
```

### Question Card

```tsx
import { QuestionCard } from "react-native-ai-animations/chat";

<QuestionCard questions={questions} variant="sheet" onSubmit={(answers) => send(answers)} />;
```

Both components take a `ref` with `select(index)`, `goTo(page)` and `submit()`, so a demo, a voice flow or a test can drive the questions without touches.

### Voice Wave

```tsx
import { useSharedValue } from "react-native-reanimated";
import { VoiceWave } from "react-native-ai-animations/skia";

const level = useSharedValue(0);

<VoiceWave level={level} variant="bars" colors={["#1F8A70", "#88C9F7", "#5FC7B0"]} />;
```

### Liquid Orb and Spoken Text (voice mode)

`LiquidOrb` is a Skia liquid orb in `metal`, `water` or `iridescent`, or three glowing loops with `ring` (color them with `colors`); `state` switches between `idle`, `listening`, `thinking` and `speaking`, and `level` (0-1) makes it swell while listening or speaking. `SpokenText` highlights the word being read aloud: pass the index of the current word as `spoken`.

```tsx
import { useSharedValue } from "react-native-reanimated";
import { LiquidOrb } from "react-native-ai-animations/skia";
import { SpokenText } from "react-native-ai-animations/text";

const level = useSharedValue(0);

<LiquidOrb material="water" state={isRecording ? "listening" : "idle"} level={level} size={240} />;
<LiquidOrb material="ring" state="listening" level={level} size={240} colors={["#1F8A70", "#88C9F7", "#5FC7B0"]} />;
<SpokenText text={reply} spoken={wordIndex} textStyle={{ fontFamily: "Inter", fontSize: 20, lineHeight: 28 }} />;
```

## Development

```bash
npm install
npm run typecheck
npm run build
```

Changes that affect the package need a changeset: `npm run changeset`.

## License

MIT.
