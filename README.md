# nami-motion

Production animations for React Native and Expo chat apps: a shimmer text
for generating states and a Skia voice wave for dictation.

```bash
npx expo install nami-motion react-native-reanimated react-native-worklets
```

## Components

<table>
  <tr>
    <td align="center" valign="top" width="50%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/shimmer-text.gif" width="160" alt="Shimmer Text recording" /><br /><b>Shimmer Text</b><br /><code>nami-motion/text</code><br /><a href="https://github.com/AhmeetKaar/nami-motion/raw/main/media/shimmer-text.mp4">10s video</a></td>
    <td align="center" valign="top" width="50%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/voice-wave.gif" width="160" alt="Voice Wave recording" /><br /><b>Voice Wave</b><br /><code>nami-motion/skia</code><br /><a href="https://github.com/AhmeetKaar/nami-motion/raw/main/media/voice-wave.mp4">10s video</a></td>
  </tr>
</table>

| Component | Entry | What it does |
| --- | --- | --- |
| Shimmer Text | `nami-motion/text` | A light band sweeping across text while a response is being generated. |
| Voice Wave | `nami-motion/skia` | Three-layer Skia waveform driven by live microphone level. |

Both take colors and fonts as props and fall back to a static state when reduce
motion is on. `nami-motion/theme` ships the Moodstone palette with
`MotionThemeProvider` and `useMotionPalette`.

### Shimmer Text

```tsx
import { ShimmerText } from "nami-motion/text";

<ShimmerText text="Generating a response" activeColor={colors.text} mutedColor={colors.textTertiary} />;
```

### Voice Wave

Needs `@shopify/react-native-skia`.

```bash
npx expo install @shopify/react-native-skia
```

```tsx
import { useSharedValue } from "react-native-reanimated";
import { VoiceWave } from "nami-motion/skia";

const level = useSharedValue(0);

<VoiceWave level={level} colors={["#1F8A70", "#88C9F7", "#5FC7B0"]} />;
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
