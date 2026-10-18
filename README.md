# nami-motion

Production animations for React Native and Expo chat apps: brand marks,
streaming, thinking, generation loaders and question cards.

```bash
npx expo install nami-motion react-native-reanimated react-native-worklets
```

## Components

<table>
  <tr>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/spinning-mark.gif" width="200" alt="Spinning Mark recording" /><br /><b>Spinning Mark</b><br /><code>nami-motion/brand</code></td>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/shimmer-text.gif" width="200" alt="Shimmer Text recording" /><br /><b>Shimmer Text</b><br /><code>nami-motion/text</code></td>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/streaming-text.gif" width="200" alt="Streaming Text recording" /><br /><b>Streaming Text</b><br /><code>nami-motion/text</code></td>
  </tr>
  <tr>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/status-row.gif" width="200" alt="Status Row recording" /><br /><b>Status Row</b><br /><code>nami-motion/chat</code></td>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/thinking-block.gif" width="200" alt="Thinking Block recording" /><br /><b>Thinking Block</b><br /><code>nami-motion/chat</code></td>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/question-card.gif" width="200" alt="Question Card recording" /><br /><b>Question Card</b><br /><code>nami-motion/chat</code></td>
  </tr>
  <tr>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/effort-bar.gif" width="200" alt="Effort Bar recording" /><br /><b>Effort Bar</b><br /><code>nami-motion/chat</code></td>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/media-generating.gif" width="200" alt="Media Generating recording" /><br /><b>Media Generating</b><br /><code>nami-motion/skia</code></td>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/voice-wave.gif" width="200" alt="Voice Wave recording" /><br /><b>Voice Wave</b><br /><code>nami-motion/skia</code></td>
  </tr>
</table>

<table>
  <tr>
    <td align="center" valign="top" width="50%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/shimmer-text.gif" width="160" alt="Shimmer Text recording" /><br /><b>Shimmer Text</b><br /><code>nami-motion/text</code><br /><a href="https://github.com/AhmeetKaar/nami-motion/raw/main/media/shimmer-text.mp4">10s video</a></td>
    <td align="center" valign="top" width="50%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/voice-wave.gif" width="160" alt="Voice Wave recording" /><br /><b>Voice Wave</b><br /><code>nami-motion/skia</code><br /><a href="https://github.com/AhmeetKaar/nami-motion/raw/main/media/voice-wave.mp4">10s video</a></td>
  </tr>
</table>

| Component | Entry | What it does |
| --- | --- | --- |
| Shimmer Text | `nami-motion/text` | A light band sweeping across text while a response is being generated. |
| Streaming Text | `nami-motion/text` | Words of a streaming answer fade and rise in, with a blinking caret. |
| Spoken Text | `nami-motion/text` | Highlights the word being spoken and dims the words already read aloud, for voice replies. |
| Spinning Mark | `nami-motion/brand` | Spins any icon you pass (your logo) with optional breathing and entrance. |
| Media Generating | `nami-motion/skia` | One loading state shared by image and video generation, with six variants (blobs, matrix, orbit, scan, constellation, helix). `ImageGenerating` and `VideoGenerating` are its presets. |
| DotOrb | `nami-motion/skia` | Dot sphere pictures behind the media variants, also usable on their own. |
| Liquid Orb | `nami-motion/skia` | Liquid voice orb in metal, water, iridescent or ring material that reacts to idle, listening, thinking and speaking states and a live level. |
| Voice Wave | `nami-motion/skia` | Live microphone waveform in four styles: lines, bars, dots and pulse. |
| Status Row | `nami-motion/chat` | Pulsing icon, shimmering label and elapsed timer for agent status. |
| Thinking Block | `nami-motion/chat` | "Thought for Ns" header that springs open into a step timeline. |
| Question Card | `nami-motion/chat` | Paged questions with numbered options and a custom answer, for cards or sheets. |
| Effort Bar | `nami-motion/chat` | Reasoning effort bar wired to `reasoning.effort` (low, medium, high) in four styles: rising bars (default), track, segmented pill and a slider whose knob stretches as you drag and snaps to a level under a tab with your model name, each with a compact form and a per level icon. |

Every style is also its own component with the same props minus `variant`:
`VoiceWaveLines`, `VoiceWaveBars`, `VoiceWaveDots` and `VoiceWavePulse`;
`EffortBars`, `EffortTrack`, `EffortSegmented` and
`EffortSlider`; `MediaGeneratingBlobs`, `MediaGeneratingMatrix`,
`MediaGeneratingOrbit`, `MediaGeneratingScan`, `MediaGeneratingConstellation`
and `MediaGeneratingHelix`; and `QuestionSheet`.

Every component takes its icon, font, colors and timing as props and falls back
to a static state when reduce motion is on. `nami-motion/theme` ships the
Moodstone palette with `MotionThemeProvider` and `useMotionPalette`; pass
`colors` to override one component.

Optional peer: `@shopify/react-native-skia` for `nami-motion/skia`.

### Shimmer Text

```tsx
import { ShimmerText } from "nami-motion/text";

<ShimmerText text="Generating a response" activeColor={colors.text} mutedColor={colors.textTertiary} />;
```

### Spinning Mark

```tsx
import { SpinningMark } from "nami-motion/brand";

<SpinningMark size={160} duration={3600} breathe entrance>
  <Image source={require("./logo.png")} style={{ width: 160, height: 160 }} />
</SpinningMark>;
```

### Streaming Text, Status Row, Thinking Block

```tsx
import { StreamingText } from "nami-motion/text";
import { StatusRow, ThinkingBlock } from "nami-motion/chat";

<StatusRow label="Searching the web" icon={<Logo />} startedAt={startedAt} />;
<ThinkingBlock thinking={thinking} startedAt={startedAt} steps={steps} />;
<StreamingText text={answer} streaming={streaming} textStyle={{ fontFamily: "Inter" }} />;
```

### Media Generating (shared by image and video)

```tsx
import { ImageGenerating, MediaGenerating, VideoGenerating } from "nami-motion/skia";

<MediaGenerating variant="constellation" label="Creating image" startedAt={startedAt} />;
<MediaGenerating variant="scan" chrome="overlay" status="generating" progress={0.42} meta="720p · 6s" aspectRatio={16 / 9} />;
<ImageGenerating variant="helix" startedAt={startedAt} />;
<VideoGenerating status="queued" variant="orbit" />;
```

### Effort Bar

`REASONING_EFFORTS` matches the `reasoning.effort` values OpenRouter and most reasoning APIs take (`low`, `medium`, `high`), with each level's share of max_tokens. `variant` picks the style: `bars` (default), `track`, `segmented` or `slider`; `size="compact"` gives each one a small inline form for model rows, `fillColors` tints any of them, `tabLabel` puts your model name in the slider's tab and `levelIcon` swaps every level name for your own icon, so the state reads without text. EffortBar is only the bar: put your own title, level label or description around it, wherever your UX needs it.

```tsx
import { EffortBar, REASONING_EFFORTS, reasoningRequest } from "nami-motion/chat";

<EffortBar levels={REASONING_EFFORTS} value={index} onChange={(i, level) => setEffort(level.value)} accessibilityLabel="Reasoning" />;
<EffortBar levels={REASONING_EFFORTS} value={index} onChange={(i) => setIndex(i)} variant="segmented" />;
<EffortBar levels={REASONING_EFFORTS} value={index} onChange={(i) => setIndex(i)} variant="slider" tabLabel={model.name} fillColors={["#5AA2FF", "#2F7BF5"]} levelIcon={(i, color) => <BrainIcon level={i} color={color} />} />;
<EffortBar levels={REASONING_EFFORTS} value={index} variant="slider" size="compact" />;

const body = { model, messages, max_tokens: 16000, ...reasoningRequest(effort) };
```

### Question Card

```tsx
import { QuestionCard } from "nami-motion/chat";

<QuestionCard questions={questions} variant="sheet" onSubmit={(answers) => send(answers)} />;
```

### Voice Wave

```tsx
import { useSharedValue } from "react-native-reanimated";
import { VoiceWave } from "nami-motion/skia";

const level = useSharedValue(0);

<VoiceWave level={level} variant="bars" colors={["#1F8A70", "#88C9F7", "#5FC7B0"]} />;
```

### Liquid Orb and Spoken Text (voice mode)

`LiquidOrb` is a Skia liquid orb in `metal`, `water` or `iridescent`, or three glowing loops with `ring` (color them with `colors`); `state` switches between `idle`, `listening`, `thinking` and `speaking`, and `level` (0-1) makes it swell while listening or speaking. `SpokenText` highlights the word being read aloud: pass the index of the current word as `spoken`.

```tsx
import { useSharedValue } from "react-native-reanimated";
import { LiquidOrb } from "nami-motion/skia";
import { SpokenText } from "nami-motion/text";

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
