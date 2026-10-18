# nami-motion

Production animations for React Native and Expo chat apps: brand marks, blur
text, streaming, thinking, generation loaders, question cards and charts.

```bash
npx expo install nami-motion react-native-reanimated react-native-worklets
```

## Components

<table>
  <tr>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/spinning-mark.gif" width="200" alt="Spinning Mark recording" /><br /><b>Spinning Mark</b><br /><code>nami-motion/brand</code></td>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/blur-text.gif" width="200" alt="Blur Text recording" /><br /><b>Blur Text</b><br /><code>nami-motion/skia</code></td>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/shimmer-text.gif" width="200" alt="Shimmer Text recording" /><br /><b>Shimmer Text</b><br /><code>nami-motion/text</code></td>
  </tr>
  <tr>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/streaming-text.gif" width="200" alt="Streaming Text recording" /><br /><b>Streaming Text</b><br /><code>nami-motion/text</code></td>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/status-row.gif" width="200" alt="Status Row recording" /><br /><b>Status Row</b><br /><code>nami-motion/chat</code></td>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/thinking-block.gif" width="200" alt="Thinking Block recording" /><br /><b>Thinking Block</b><br /><code>nami-motion/chat</code></td>
  </tr>
  <tr>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/question-card.gif" width="200" alt="Question Card recording" /><br /><b>Question Card</b><br /><code>nami-motion/chat</code></td>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/effort-bar.gif" width="200" alt="Effort Bar recording" /><br /><b>Effort Bar</b><br /><code>nami-motion/chat</code></td>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/media-generating.gif" width="200" alt="Media Generating recording" /><br /><b>Media Generating</b><br /><code>nami-motion/skia</code></td>
  </tr>
  <tr>
    <td align="center" valign="top" width="33%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/charts.gif" width="200" alt="Charts recording" /><br /><b>Charts</b><br /><code>nami-motion/charts</code></td>
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
| Spinning Mark | `nami-motion/brand` | Spins any icon you pass (your logo) with optional breathing and entrance. |
| Blur Text | `nami-motion/skia` | Phrases blur in and out letter by letter in your own font. |
| Media Generating | `nami-motion/skia` | One loading state shared by image and video generation, with eight variants (blobs, matrix, orbit, scan, constellation, helix, ring, morph). `ImageGenerating` and `VideoGenerating` are its presets. |
| DotOrb | `nami-motion/skia` | Dot sphere pictures behind the media variants, also usable on their own. |
| Voice Wave | `nami-motion/skia` | Live microphone waveform in five styles: lines, bars, dots, pulse and ring. |
| Status Row | `nami-motion/chat` | Pulsing icon, shimmering label and elapsed timer for agent status. |
| Thinking Block | `nami-motion/chat` | "Thought for Ns" header that springs open into a step timeline. |
| Question Card | `nami-motion/chat` | Paged questions with numbered options and a custom answer, for cards or sheets. |
| Effort Bar | `nami-motion/chat` | Reasoning effort picker wired to `reasoning.effort` (low, medium, high) in six styles: rising bars (default), track, segmented pill, dial with the budget share, dot staircase and snapping slider, each with a compact form and a per level icon. |
| Charts | `nami-motion/charts` | BarList, Meter, Sparkline, RingGauge and CountUp for usage and credits. |

Every component takes its icon, font, colors and timing as props and falls back
to a static state when reduce motion is on. `nami-motion/theme` ships the
Moodstone palette with `MotionThemeProvider` and `useMotionPalette`; pass
`colors` to override one component.

Optional peer: `@shopify/react-native-skia` for `nami-motion/skia` and
`nami-motion/charts`.

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

### Blur Text

```tsx
import { BlurText } from "nami-motion/skia";

<BlurText texts={["Ask anything", "Think out loud"]} fontSource={require("./font.otf")} fontSize={32} />;
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

`REASONING_EFFORTS` matches the `reasoning.effort` values OpenRouter and most reasoning APIs take (`low`, `medium`, `high`), with each level's share of max_tokens. `variant` picks the style: `bars` (default), `track`, `segmented`, `dial`, `dots` or `slider`; `size="compact"` gives each one a small inline form for model rows, and `fillColors` tints any of them.

```tsx
import { EffortBar, REASONING_EFFORTS, reasoningRequest } from "nami-motion/chat";

<EffortBar levels={REASONING_EFFORTS} value={index} onChange={(i, level) => setEffort(level.value)} title="Reasoning" />;
<EffortBar levels={REASONING_EFFORTS} value={index} onChange={(i) => setIndex(i)} variant="dial" title="Reasoning" />;
<EffortBar levels={REASONING_EFFORTS} value={index} variant="slider" size="compact" />;

const body = { model, messages, max_tokens: 16000, ...reasoningRequest(effort) };
```

### Question Card

```tsx
import { QuestionCard } from "nami-motion/chat";

<QuestionCard questions={questions} variant="sheet" onSubmit={(answers) => send(answers)} />;
```

### Charts

```tsx
import { BarList, CountUp, Meter, RingGauge, Sparkline } from "nami-motion/charts";

<CountUp value={1240} />;
<Meter value={used} max={total} warnAt={0.75} dangerAt={0.9} />;
<RingGauge value={remaining} max={total}><CountUp value={remaining} /></RingGauge>;
<BarList data={models} />;
<Sparkline data={daily} />;
```

### Voice Wave

```tsx
import { useSharedValue } from "react-native-reanimated";
import { VoiceWave } from "nami-motion/skia";

const level = useSharedValue(0);

<VoiceWave level={level} variant="bars" colors={["#1F8A70", "#88C9F7", "#5FC7B0"]} />;
<VoiceWave level={level} variant="ring" height={240} colors={["#1F8A70", "#88C9F7", "#5FC7B0"]} />;
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
