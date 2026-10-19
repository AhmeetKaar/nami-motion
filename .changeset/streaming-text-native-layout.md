---
"react-native-ai-animations": minor
---

StreamingText renders each paragraph as one native `Text`, so the streaming layout is the same as the finished text and nothing jumps when `streaming` turns false. Every arriving chunk fades in through its color, including the rest of a word that is already on screen; long words and URLs wrap natively; text that is not a prefix of the previous value keeps only the shared prefix and fades the rest. New `selectable` prop. The `rise` prop is removed.
