# nami-motion

Production animations for React Native and Expo chat apps: shimmer text,
skeletons, status rows, thinking traces, voice waves, progress rings, a
shader orb, drawer reveals and swipe actions.

```bash
npx expo install nami-motion react-native-reanimated react-native-worklets react-native-gesture-handler
```

## Components

<table>
  <tr>
    <td align="center" valign="top" width="25%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/shimmer-text.gif" width="160" alt="Shimmer Text recording" /><br /><b>Shimmer Text</b><br /><code>nami-motion/text</code><br /><a href="https://github.com/AhmeetKaar/nami-motion/raw/main/apps/site/public/videos/shimmer-text.mp4">10s video</a></td>
    <td align="center" valign="top" width="25%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/skeleton.gif" width="160" alt="Skeleton recording" /><br /><b>Skeleton</b><br /><code>nami-motion/feedback</code><br /><a href="https://github.com/AhmeetKaar/nami-motion/raw/main/apps/site/public/videos/skeleton.mp4">10s video</a></td>
    <td align="center" valign="top" width="25%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/shimmer-band.gif" width="160" alt="Shimmer Band recording" /><br /><b>Shimmer Band</b><br /><code>nami-motion/gradient</code><br /><a href="https://github.com/AhmeetKaar/nami-motion/raw/main/apps/site/public/videos/shimmer-band.mp4">10s video</a></td>
    <td align="center" valign="top" width="25%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/status-row.gif" width="160" alt="Status Row recording" /><br /><b>Status Row</b><br /><code>nami-motion/chat</code><br /><a href="https://github.com/AhmeetKaar/nami-motion/raw/main/apps/site/public/videos/status-row.mp4">10s video</a></td>
  </tr>
  <tr>
    <td align="center" valign="top" width="25%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/thinking-block.gif" width="160" alt="Thinking Block recording" /><br /><b>Thinking Block</b><br /><code>nami-motion/chat</code><br /><a href="https://github.com/AhmeetKaar/nami-motion/raw/main/apps/site/public/videos/thinking-block.mp4">10s video</a></td>
    <td align="center" valign="top" width="25%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/voice-wave.gif" width="160" alt="Voice Wave recording" /><br /><b>Voice Wave</b><br /><code>nami-motion/skia</code><br /><a href="https://github.com/AhmeetKaar/nami-motion/raw/main/apps/site/public/videos/voice-wave.mp4">10s video</a></td>
    <td align="center" valign="top" width="25%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/remaining-ring.gif" width="160" alt="Remaining Ring recording" /><br /><b>Remaining Ring</b><br /><code>nami-motion/skia</code><br /><a href="https://github.com/AhmeetKaar/nami-motion/raw/main/apps/site/public/videos/remaining-ring.mp4">10s video</a></td>
    <td align="center" valign="top" width="25%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/matrix-orb.gif" width="160" alt="Matrix Orb recording" /><br /><b>Matrix Orb</b><br /><code>nami-motion/skia</code><br /><a href="https://github.com/AhmeetKaar/nami-motion/raw/main/apps/site/public/videos/matrix-orb.mp4">10s video</a></td>
  </tr>
  <tr>
    <td align="center" valign="top" width="25%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/drawer-reveal.gif" width="160" alt="Drawer Reveal recording" /><br /><b>Drawer Reveal</b><br /><code>nami-motion/gestures</code><br /><a href="https://github.com/AhmeetKaar/nami-motion/raw/main/apps/site/public/videos/drawer-reveal.mp4">10s video</a></td>
    <td align="center" valign="top" width="25%"><img src="https://raw.githubusercontent.com/AhmeetKaar/nami-motion/main/media/swipe-actions.gif" width="160" alt="Swipe Actions recording" /><br /><b>Swipe Actions</b><br /><code>nami-motion/gestures</code><br /><a href="https://github.com/AhmeetKaar/nami-motion/raw/main/apps/site/public/videos/swipe-actions.mp4">10s video</a></td>
  </tr>
</table>

| Component | Entry | What it does |
| --- | --- | --- |
| Shimmer Text | `nami-motion/text` | A light band sweeping across text while a response is being generated. |
| Skeleton | `nami-motion/feedback` | Pulsing placeholder bar for content that is still loading. |
| Shimmer Band | `nami-motion/gradient` | Gradient band sweeping over a surface, for image and card placeholders. |
| Status Row | `nami-motion/chat` | Pulsing loading state with your logo and a status label. |
| Thinking Block | `nami-motion/chat` | Reasoning trace that shimmers while streaming and settles into an elapsed-time summary. |
| Voice Wave | `nami-motion/skia` | Three-layer Skia waveform driven by live microphone level. |
| Remaining Ring | `nami-motion/skia` | Animated progress ring for quotas, timers and recording limits. |
| Matrix Orb | `nami-motion/skia` | Dot-matrix shader orb with idle, listening and thinking states. |
| Drawer Reveal | `nami-motion/gestures` | Fades and slides drawer content in sync with the drawer's open progress. |
| Swipe Actions | `nami-motion/gestures` | List rows that reveal actions with a rubber-banded swipe. |

Each component takes colors, labels, icons and fonts as props and falls back to a
static state when reduce motion is on. The showcase site (`npm run site`) has the
recordings, install commands, props tables and a copy-ready prompt for each one.

## Repository

| Path | Purpose |
| --- | --- |
| `packages/motion` | The published `nami-motion` package |
| `apps/example` | Expo SDK 55 playground |
| `apps/site` | Showcase site with recordings, props and prompts (Vite + React) |

## Development

```bash
npm install
npm run example
npm run site
npm run build
```

Changes that affect the package need a changeset: `npm run changeset`.

## License

MIT. Third-party notices are listed in [NOTICE.md](NOTICE.md).
