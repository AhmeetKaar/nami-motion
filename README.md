# React Native AI Animations

[![npm](https://img.shields.io/npm/v/react-native-ai-animations)](https://www.npmjs.com/package/react-native-ai-animations)
[![license](https://img.shields.io/npm/l/react-native-ai-animations)](LICENSE)

Animated React Native and Expo components for AI chat apps: streaming text,
shimmer loading text, thinking and status indicators, voice orbs and
waveforms, image and video generation loaders, question cards and reasoning
effort bars. Built on Reanimated and Skia, themeable, and reduce motion aware.

**Docs and live demos:** [nami-motion-web.vercel.app](https://nami-motion-web.vercel.app/)

## Installation

```bash
npx expo install react-native-ai-animations react-native-reanimated react-native-worklets
```

The orbs, waveforms and media loaders in `react-native-ai-animations/skia` also need Skia:

```bash
npx expo install @shopify/react-native-skia
```

| Peer | Version |
| --- | --- |
| `react` | 19.2 or newer, below 20 |
| `react-native` | 0.83 or newer, below 1.0 |
| `react-native-reanimated` | 4.2 or newer, below 5 |
| `react-native-worklets` | 0.7 or newer, below 1.0 |
| `@shopify/react-native-skia` | 2.4 or newer, below 3, optional |

> Formerly published as `nami-motion`. Replace `nami-motion` with
> `react-native-ai-animations` in your imports.

## Components

Every component and style is shown in motion, with copyable code and agent
prompts, on the [website](https://nami-motion-web.vercel.app/).

| Component | Entry | What it does |
| --- | --- | --- |
| Shimmer Text | `/text` | A light band sweeping across text while a response is being generated. |
| Streaming Text | `/text` | A streaming answer fades in chunk by chunk with native text layout and a blinking caret. |
| Spoken Text | `/text` | Highlights the word being spoken and dims the words already read aloud, for voice replies. |
| Spinning Mark | `/brand` | Spins any icon you pass (your logo) with optional breathing and entrance. |
| Status Row | `/chat` | Pulsing icon, shimmering label and elapsed timer for agent status. |
| Thinking Block | `/chat` | "Thought for Ns" header that springs open into a step timeline. |
| Question Card | `/chat` | Paged questions with numbered options and a custom answer, as a card or a sheet. |
| Effort Bar | `/chat` | Reasoning effort control wired to `reasoning.effort` (low, medium, high) in four styles: bars, track, segmented and slider. |
| Media Generating | `/skia` | One loading state for image and video generation in six variants: blobs, matrix, orbit, scan, constellation and helix. |
| Dot Orb | `/skia` | The dot sphere behind the media variants, also usable on its own. |
| Matrix Orb | `/skia` | Dot matrix orb with idle, listening and thinking states and per state colors. |
| Liquid Orb | `/skia` | Voice orb in metal, water, iridescent or ring material that reacts to idle, listening, thinking and speaking and a live level. |
| Voice Wave | `/skia` | Live microphone waveform in four styles: lines, bars, dots and pulse. |

Entries are subpaths of `react-native-ai-animations`. The root export holds
`/theme` and `/text`; nothing that needs Skia is imported from the root.

Every style is also its own component with the same props minus `variant`:

- `VoiceWaveLines`, `VoiceWaveBars`, `VoiceWaveDots`, `VoiceWavePulse`
- `EffortBars`, `EffortTrack`, `EffortSegmented`, `EffortSlider`
- `MediaGeneratingBlobs`, `MediaGeneratingMatrix`, `MediaGeneratingOrbit`,
  `MediaGeneratingScan`, `MediaGeneratingConstellation`, `MediaGeneratingHelix`
- `QuestionSheet`

## Usage

### Shimmer Text

```tsx
import { ShimmerText } from "react-native-ai-animations/text";

<ShimmerText text="Generating a response" activeColor={colors.text} mutedColor={colors.textTertiary} />;
```

### Streaming Text, Status Row, Thinking Block

```tsx
import { StreamingText } from "react-native-ai-animations/text";
import { StatusRow, ThinkingBlock } from "react-native-ai-animations/chat";

<StatusRow label="Searching the web" icon={<Logo />} startedAt={startedAt} />;
<ThinkingBlock thinking={thinking} startedAt={startedAt} steps={steps} />;
<StreamingText text={answer} streaming={streaming} textStyle={{ fontFamily: "Inter" }} />;
```

StreamingText takes its color from `textStyle.color` when you set one, otherwise from the palette text color.

### Spinning Mark

```tsx
import { SpinningMark } from "react-native-ai-animations/brand";

<SpinningMark size={160} duration={3600} breathe entrance>
  <Image source={require("./logo.png")} style={{ width: 160, height: 160 }} />
</SpinningMark>;
```

### Question Card

```tsx
import { QuestionCard } from "react-native-ai-animations/chat";

<QuestionCard questions={questions} variant="sheet" onSubmit={(answers) => send(answers)} />;
```

`QuestionCard` and `QuestionSheet` take a `ref` with `select(index)`,
`goTo(page)` and `submit()`, so a demo, a voice flow or a test can drive the
questions without touches.

### Effort Bar

`REASONING_EFFORTS` matches the `reasoning.effort` values OpenRouter and most
reasoning APIs take (`low`, `medium`, `high`), with each level's share of
`max_tokens`. `reasoningRequest(effort)` builds the request fields.

```tsx
import { EffortBar, REASONING_EFFORTS, reasoningRequest } from "react-native-ai-animations/chat";

<EffortBar levels={REASONING_EFFORTS} value={index} onChange={(i, level) => setEffort(level.value)} accessibilityLabel="Reasoning" />;
<EffortBar levels={REASONING_EFFORTS} value={index} onChange={(i) => setIndex(i)} variant="segmented" />;
<EffortBar levels={REASONING_EFFORTS} value={index} onChange={(i) => setIndex(i)} variant="slider" tabLabel={model.name} fillColors={["#5AA2FF", "#2F7BF5"]} levelIcon={(i, color) => <BrainIcon level={i} color={color} />} />;
<EffortBar levels={REASONING_EFFORTS} value={index} variant="slider" size="compact" />;

const body = { model, messages, max_tokens: 16000, ...reasoningRequest(effort) };
```

| Prop | Does |
| --- | --- |
| `variant` | `bars` (default), `track`, `segmented` or `slider` |
| `size="compact"` | Small inline form for model rows |
| `fillColors` | Tints the fill of any style |
| `tabLabel` | Your model name in the slider's tab |
| `levelIcon` | Replaces every level name with your own icon |

EffortBar is only the control: put your own title, level label or description
around it.

### Media Generating

```tsx
import { ImageGenerating, MediaGenerating, VideoGenerating } from "react-native-ai-animations/skia";

<MediaGenerating variant="constellation" label="Creating image" startedAt={startedAt} />;
<MediaGenerating variant="scan" chrome="overlay" status="generating" progress={0.42} meta="720p · 6s" aspectRatio={16 / 9} />;
<ImageGenerating variant="helix" startedAt={startedAt} />;
<VideoGenerating status="queued" variant="orbit" />;
```

`ImageGenerating` and `VideoGenerating` are presets of `MediaGenerating`.

### Voice Wave

```tsx
import { useSharedValue } from "react-native-reanimated";
import { VoiceWave } from "react-native-ai-animations/skia";

const level = useSharedValue(0);

<VoiceWave level={level} variant="bars" colors={["#1F8A70", "#88C9F7", "#5FC7B0"]} />;
```

### Liquid Orb and Spoken Text

`LiquidOrb` comes in `metal`, `water` or `iridescent`, or three glowing loops
with `ring` (color them with `colors`). `state` switches between `idle`,
`listening`, `thinking` and `speaking`, and `level` (0 to 1) makes it swell
while listening or speaking. `SpokenText` highlights the word being read aloud:
pass the index of the current word as `spoken`.

```tsx
import { useSharedValue } from "react-native-reanimated";
import { LiquidOrb } from "react-native-ai-animations/skia";
import { SpokenText } from "react-native-ai-animations/text";

const level = useSharedValue(0);

<LiquidOrb material="water" state={isRecording ? "listening" : "idle"} level={level} size={240} />;
<LiquidOrb material="ring" state="listening" level={level} size={240} colors={["#1F8A70", "#88C9F7", "#5FC7B0"]} />;
<SpokenText text={reply} spoken={wordIndex} textStyle={{ fontFamily: "Inter", fontSize: 20, lineHeight: 28 }} />;
```

## Theming

Components use the built-in Moodstone palette until you wrap your app in
`MotionThemeProvider`. Pass one palette, or a `light` and `dark` pair with a
`colorScheme`. Components that read the palette also take `colors` to override
a single instance; Shimmer Text, Voice Wave, Dot Orb and Matrix Orb take their
colors directly (`activeColor`, `colors`, `color`).

```tsx
import { useColorScheme } from "react-native";
import { MotionThemeProvider } from "react-native-ai-animations/theme";

<MotionThemeProvider
  colorScheme={useColorScheme() ?? "light"}
  palette={{ light: { accent: "#2F7BF5" }, dark: { accent: "#5AA2FF" } }}
>
  <App />
</MotionThemeProvider>;
```

Palette keys: `background`, `card`, `surface`, `raised`, `text`,
`textSecondary`, `textTertiary`, `accent`, `accentContrast`, `success`,
`danger`. Read the active palette in your own components with
`useMotionPalette()`.

## Customization and accessibility

- Icons, fonts, colors and timing are props on every component; nothing is
  tied to a brand or an icon set.
- When the system's reduce motion setting is on, every component settles to a
  static final state.

## Development

```bash
npm install
npm run typecheck
npm run build
```

Changes that affect the package need a changeset: `npm run changeset`.

## License

[MIT](LICENSE)
