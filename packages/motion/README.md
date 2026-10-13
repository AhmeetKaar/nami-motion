# nami-motion

Production animations for React Native and Expo chat apps: shimmer text,
skeletons, status rows, thinking traces, voice waves, progress rings, a
shader orb, drawer reveals and swipe actions.

```bash
npx expo install nami-motion react-native-reanimated react-native-worklets react-native-gesture-handler
```

## Repository

| Path | Purpose |
| --- | --- |
| `packages/motion` | The published `nami-motion` package |
| `apps/example` | Expo SDK 55 playground |
| `apps/docs` | Documentation and gallery site (Next.js + Fumadocs) |

## Development

```bash
npm install
npm run example
npm run docs
npm run build
```

Changes that affect the package need a changeset: `npm run changeset`.

## License

MIT. Third-party notices are listed in [NOTICE.md](NOTICE.md).
