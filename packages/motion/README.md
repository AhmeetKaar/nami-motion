# nami-motion

Production animations for React Native and Expo chat apps: shimmer text,
skeletons, status rows, thinking traces, voice waves, progress rings, a
shader orb and drawer reveals.

```bash
bunx expo install nami-motion react-native-reanimated react-native-worklets react-native-gesture-handler
```

## Repository

| Path | Purpose |
| --- | --- |
| `packages/motion` | The published `nami-motion` package |
| `apps/example` | Expo SDK 55 playground |
| `apps/docs` | Documentation and gallery site (Next.js + Fumadocs) |

## Development

```bash
bun install
bun run example
bun run docs
bun run build
```

Changes that affect the package need a changeset: `bun run changeset`.

## License

MIT. Third-party notices are listed in [NOTICE.md](NOTICE.md).
